import PlayerCharacter from "../creature/player/PlayerCharacter";
import PartyExploringMap, { PartyMoveDirection } from "./PartyExploringMap";
import Game from "../../gameserver/game/Game";
import { IGetRandomClientFunc } from '../../gameserver/socket/SocketServer';
import CoopBattle from "../battle/CoopBattle";
import ExplorableMap from "../map/ExplorableMap";
import DeleteChannelClientRequest from '../../client/requests/DeleteChannelClientRequest';
import SendMessageClientRequest from '../../client/requests/SendMessageClientRequest';
import SendPMClientRequest from '../../client/requests/SendPMClientRequest';
import SendImageClientRequest from '../../client/requests/SendImageClientRequest';
import SendLocalImageClientRequest from "../../client/requests/SendLocalImageClientRequest";

const INVITE_EXPIRES_MS = 60000;

enum PartyStatus{
    InTown,
    Exploring,
    Battling
}

interface PlayerCharacterInvited{
    pc:PlayerCharacter;
    expires:number;
}

export {PartyStatus};

interface PlayerPartyBag{
    title:string;
    leader:PlayerCharacter;
    channelId:string;
    game:Game;
    getClient:IGetRandomClientFunc;
}

export default class PlayerParty{
    leader:PlayerCharacter;
    title: string;
    members:Map<string,PlayerCharacter>;
    invited:Map<string,PlayerCharacterInvited>;
    channelId:string;
    partyStatus:PartyStatus;
    exploration:PartyExploringMap;
    currentBattle:CoopBattle;
    getClient:IGetRandomClientFunc;
    game:Game;

    constructor(bag:PlayerPartyBag){
        this.leader = bag.leader;
        this.title = bag.title;
        this.channelId = bag.channelId;
        this.getClient = bag.getClient;

        this.members = new Map();
        this.members.set(bag.leader.uid,bag.leader);

        this.invited = new Map();
        this.partyStatus = PartyStatus.InTown;
        this.game = bag.game;
        this.currentBattle = null;

        this.leader.party = this;
        this.leader.status = 'inParty';
    }

    sendChannelMessage(msg:string){
        new SendMessageClientRequest({
            channelId: this.channelId,
            message: msg
        });
    }

    get id():string{
        return this.leader.uid;
    }

    get status():PartyStatus{
        return this.partyStatus;
    }

    explore(map:ExplorableMap){
        this.exploration = new PartyExploringMap(map);
        this.partyStatus = PartyStatus.Exploring;

        this.sendCurrentMapImageFile('Your party arrives outside the city...');
    }

    move(direction:PartyMoveDirection){
        if(!this.exploration.canMove(direction)){
            this.sendChannelMessage('The party cannot move '+direction+', the way is impassably blocked by a small bush or something.');

            return;
        }

        this.exploration.move(direction);

        if(this.exploration.getEncounterChance() > Math.random()){
            this.monsterEncounter();

            return;
        }

        const startingLocationImageSrc = this.exploration.getCurrentLocationImage();

        this.sendCurrentMapImageFile('Your party moved');
    }

    monsterEncounter(){
        const partyMembers = [];

        this.members.forEach(function(pc){
            partyMembers.push(pc);
        });

        const opponentId = this.exploration.getRandomEncounterMonsterId();

        this.currentBattle = this.game.createMonsterBattle({
            party: this,
            partyMembers: partyMembers,
            opponentId: opponentId
        });

        this.partyStatus = PartyStatus.Battling;

        new SendMessageClientRequest({
            channelId: this.channelId,
            message: `${this.currentBattle.opponent.title} attacks!`
        })
        .send(this.getClient());
    }

    returnFromBattle(victory:boolean){
        if(victory){
            this.partyStatus = PartyStatus.Exploring;
        
            this.sendCurrentMapImageFile('Your party survived!');
        }
        else{
            this.sendChannelMessage('Your party was defeated!');

            setTimeout(()=>{
                this.members.forEach((pc)=>{
                    new SendPMClientRequest({
                        channelId: null,
                        playerUid: pc.uid,
                        message: 'Your party was defeated!'
                    }).send(this.getClient());
                });
                
                this.playerActionDisband();
            },10000);
        }

        this.currentBattle = null;
        this.members.forEach(function(member){
            member.status = 'inParty';
        });
    }

    sendCurrentMapImageFile(msg:string){
        const localUrl = this.exploration.getCurrentLocationImage();
        const cachedCDNUrl = this.game.getSliceRemoteUrl(localUrl);

        if(cachedCDNUrl){
            new SendImageClientRequest({
                channelId: this.channelId,
                imageUrl: cachedCDNUrl,
                message: msg,
            }).send(this.getClient());
        }
        else{
            new SendLocalImageClientRequest({
                channelId: this.channelId,
                imageSrc: localUrl,
                message: msg,
            }).send(this.getClient());
        }
    }

    playerActionInvite(pc:PlayerCharacter){
        if(this.members.size + this.invited.size >= 4){
            throw 'Party is full (max 4)';
        }

        this.invited.set(pc.uid,{
            pc:pc,
            expires: new Date().getTime()+INVITE_EXPIRES_MS,
        });

        pc.party = this;
        pc.status = 'invitedToParty';

        this.sendChannelMessage(`${pc.title} was invited to the party`);

        setTimeout(()=>{
            //invite is still pending
            if(this.invited.has(pc.uid)){
                this.sendChannelMessage(`${pc.title}'s invitation expired`);

                this.invited.delete(pc.uid);

                //They didn't accept the invite
                if(pc.status == 'invitedToParty' && pc.party.id == this.id){
                    pc.party = null;
                    pc.status = 'inCity';
                }
            }
        },INVITE_EXPIRES_MS);
    }

    playerActionDecline(pc:PlayerCharacter){
        this.invited.delete(pc.uid);

        new SendMessageClientRequest({
            channelId: this.channelId,
            message: `${pc.title} declined the party invite`,
        }).send(this.getClient());
    }

    playerActionJoin(pc:PlayerCharacter){
        this.members.set(pc.uid,pc);

        this.invited.delete(pc.uid);

        pc.party = this;
        pc.status = 'inParty';

        new SendMessageClientRequest({
            channelId: this.channelId,
            message: `<@${pc.uid}> joined the party!`,
        }).send(this.getClient());
    }

    playerActionLeave(pc:PlayerCharacter){
        if(this.leader.uid == pc.uid){
            throw 'Party leaders cannot leave, they must disband the party';
        }

        this.members.delete(pc.uid);

        pc.party = null;
        pc.status = 'inCity';

        new SendMessageClientRequest({
            channelId: this.channelId,
            message: `${pc.title} left the party`,
        }).send(this.getClient());
    }

    playerActionDisband(){
        const members:Array<PlayerCharacter> = [];

        this.members.forEach(function(pc){
            pc.party = null;
            pc.status = 'inCity';
        });

        this.invited.forEach(function(pci:PlayerCharacterInvited){
            pci.pc.party = null;
            pci.pc.status = 'inCity';
        });

        this.leader.party = null;
        this.leader.status = 'inCity';

        new SendMessageClientRequest({
            channelId: this.channelId,
            message: `The party has been disbanded!`,
        }).send(this.getClient());

        setTimeout(()=>{
            new DeleteChannelClientRequest({
                channelId: this.channelId
            }).send(this.getClient());
        },20000);
    }

    get isInBattle():boolean{
        return this.partyStatus == PartyStatus.Battling;
    }

    get isInTown():boolean{
        return this.partyStatus == PartyStatus.InTown;
    }

    get isExploring():boolean{
        return this.partyStatus == PartyStatus.Exploring;
    }
}