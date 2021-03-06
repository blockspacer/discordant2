/// <reference path='../../node_modules/discord.js/typings/index.d.ts' />
import Command from './Command';
import * as Commands from "./ActiveCommands";
import { PermissionRole } from '../core/permissions/PermissionService';
import { SocketPlayerCharacter } from '../core/creature/player/PlayerCharacter';
import PermissionsService from '../core/permissions/PermissionService';
import AllItems from '../core/item/AllItems';
import SocketClientRequester from '../client/SocketClientRequester';
import { SocketPvPInvite } from '../core/battle/PvPInvite';
import{
    Client as DiscordClient,
    Message,
    TextChannel,
    Guild,
    PermissionOverwrites
} from 'discord.js';
import Logger from "../gameserver/log/Logger";
import SendMessageClientRequest from '../client/requests/SendMessageClientRequest';
import { BotConstants } from './BotConstants';

export interface BotConfigBase{
    authToken:string;
    commandPrefix:string;
    uids: UIDs;
}

export interface UIDs{
    canSeePartyChannels: string[];
    owners: string[];
}

export interface BotConfig extends BotConfigBase{
    gameserver:string;
    production:boolean;
}

export interface BotBag extends BotConfigBase{
    socket:SocketClientRequester;
    permissions:PermissionsService;
    logger:Logger;
}

const COOLDOWN_MS = 1000;

export default class Bot{
    client:DiscordClient;
    commandPrefix:string;
    commands:Map<String,Command>;
    lockdown:boolean;
    socket:SocketClientRequester;
    logger:Logger;
    permissions:PermissionsService;
    items: AllItems;
    cooldowns:Map<String,number>;
    uids: UIDs;
    aliases: {};

    constructor(bag:BotBag){
        this.lockdown = false;
        this.commandPrefix = bag.commandPrefix;
        this.permissions = bag.permissions;
        this.items = new AllItems();
        this.aliases = {};
        this.cooldowns = new Map();

        this.uids = bag.uids;

        this.logger = bag.logger;

        this.socket = bag.socket;

        this.getChannelById = this.getChannelById.bind(this);

        this.commands = new Map();

        Object.keys(Commands).forEach((commandName)=>{
            const command:Command = new Commands[commandName];

            this.commands.set(command.name.toUpperCase(),command);

            command.aliases.forEach((expandTo,alias)=>{
                if(this.aliases[alias]){
                    throw 'Duplicate alias "' + alias + '" in ' + command.name+' command';
                }

                this.aliases[alias] = expandTo;
            });
        });

        this.client = new DiscordClient();

        this.client.on('ready',this.handleReady.bind(this));
        this.client.on('message',this.handleMessage.bind(this));

        this.client.login(bag.authToken);
    }

    handleReady(){
        this.client.user.setStatus("online");

        setTimeout(()=>{
            this.setPlayingGame(this.commandPrefix+'help for commands');
        },500);

        let deleteChannelDelay = 2000;

        try{
            //Clean up any party channels
            this.client.channels.array()
            .forEach(async (channel:TextChannel,index:number)=>{
                if(channel.name && (channel.name.startsWith(this.commandPrefix+'pvp-') || channel.name.startsWith(this.commandPrefix+'party-'))){
                    const channelInUse = await this.socket.isChannelInUse(channel.id);
                    
                    if(channelInUse){
                        return;
                    }

                    deleteChannelDelay = deleteChannelDelay + 2000;

                    setTimeout(()=>{
                        try{
                            this.logger.info('Deleting channel '+channel.name);
                            
                            channel.delete();
                        }
                        catch(ex){
                            ex.msg = 'Error deleting channel';

                            this.logger.error(ex);
                        }
                    },deleteChannelDelay);
                }
            });
        }
        catch(ex){
            this.logger.error(ex);
        }
    }

    handleMessage(message:Message){
        //Ignore own messages
        if(message.author.id == this.client.user.id){
            return;
        }

        //Ignore #general messages
        if(message.channel.id == '332388308564967426'){
            return;
        }
        
        //Ignore non-prefix messages
        if(!message.content.startsWith(this.commandPrefix) && !message.content.toUpperCase().startsWith(this.commandPrefix.toUpperCase())){
            return;
        }

        if(message.content == this.commandPrefix || message.content == this.commandPrefix.toUpperCase()){
            return;
        }

        let msgWithoutPrefix:string = message.content.substr(this.commandPrefix.length)+' ';

        let aliasFound = false;

        for(var a in this.aliases){
            if(msgWithoutPrefix.startsWith(a+' ')){
                msgWithoutPrefix = this.aliases[a]+' '+msgWithoutPrefix.substr(a.length);
                break;
            }
        }

        const params:Array<string> = resolveArgs(msgWithoutPrefix);
        let commandName:string = params.shift();

        const command = this.commands.get(commandName.toUpperCase());

        if(!command){
            return;
        }

        const lastCommandMS = this.cooldowns.get(message.author.id);
        const nowMS = new Date().getTime();
        const expireMS = nowMS - COOLDOWN_MS;

        if(lastCommandMS && lastCommandMS > expireMS){
            message.channel.send(`You are sending commands too fast, ${message.author.username}`);

            return;
        }
        else{
            this.cooldowns.set(message.author.id,nowMS);
        }

        (async ()=>{
            try{
                const playerUID = message.author.id;
                const playerRoleStr = await this.socket.getPlayerRole(playerUID);
                const playerRole:PermissionRole = this.permissions.getRole(playerRoleStr);

                if(this.lockdown && this.uids.owners.indexOf(playerUID) == -1){
                    message.channel.send(`Bot on lockdown, only owners may use commands.`);

                    return;
                }

                if(!playerRole.has(command.permissionNode) && this.uids.owners.indexOf(playerUID) == -1){
                    if(playerRole.title == 'anonymous'){
                        message.channel.send(`You can register with \`${this.commandPrefix}begin\``);
                    }
                    else{
                        message.channel.send(`You are not allowed to use this command, ${message.author.username}`);
                    }
                    return;
                }

                if(command.minParams > params.length){
                    message.channel.send(command.getUsage());

                    return;
                }

                await command.run({
                    socket: this.socket,
                    message: message,
                    params: params,
                    role: playerRole,
                    items: this.items,
                    commandPrefix: this.commandPrefix,
                    commands: this.commands,
                    bot: this,
                    permissions: this.permissions
                });
            }
            catch(errorMsg){
                message.channel.send(errorMsg+', '+message.author.username);
            }
        })();
    }

    setLockdown(lockdown:boolean){
        this.lockdown = lockdown;
    }

    setPlayingGame(msg:string){
        this.client.user.setActivity(msg);
    }

    logout(){
        this.client.user.setStatus("invisible");
    }

    getChannelById(channelId:string):TextChannel{
        return this.client.channels.get(channelId) as TextChannel;
    }

    //Grant user role on the Discordant server
    addChatRole(uid:string,roleId:string){
        this.client.guilds.get(BotConstants.SERVER_ID).members.get(uid).addRole(roleId);
    }

    //Revoke user role on Discordant server
    revokeChatRole(uid:string,roleId:string){
        this.client.guilds.get(BotConstants.SERVER_ID).members.get(uid).removeRole(roleId);
    }

    createPvPChannel = async (guild:Guild,invite:SocketPvPInvite):Promise<TextChannel> => {
        const channelname = (this.commandPrefix+'pvp-'+invite.sender.title.substr(0,invite.sender.title.length/2)+invite.receiver.title.substr(invite.receiver.title.length/2))
            .replace(/[^A-Za-z0-9-]+/g,'')
            .substr(0,20);

        const overwrites = [     
            {
                id: guild.id, 
                type: 'role', 
                deny: 0x00000800/*send_msg*/ + 0x00001000/*send_tts*/, 
                allow: 0x00000400/*read_msgs*/ + 0x00000040/*reactions*/,
                //Need these strictly for typescript
                channel: null,
                delete: null,
            } as PermissionOverwrites
        ];

        const channel:TextChannel = await guild.createChannel(channelname,'text',overwrites) as TextChannel;

        channel.setParent(BotConstants.PVP_CATEGORY_ID);

        await channel.overwritePermissions(this.client.user.id,{
            SEND_MESSAGES: true
        });

        await channel.overwritePermissions(invite.sender.uid,{
            SEND_MESSAGES: true
        });

        await channel.overwritePermissions(invite.receiver.uid,{
            SEND_MESSAGES: true
        });

        return channel;
    }

    grantPlayerWriteAccessToChannel(channel:TextChannel,playerUid:string){
        const overwrites = {
            SEND_MESSAGES: true,
            READ_MESSAGES: true,
            ADD_REACTIONS: true,
        };

        channel.overwritePermissions(playerUid,overwrites);
    }

    revokePlayerAccessToChannel(channel:TextChannel,playerUid:string){
        const overwrites = {
            READ_MESSAGES: false,
        };

        channel.overwritePermissions(playerUid,overwrites);
    }

    createPartyChannel = async(guild:Guild,partyName:string,leaderUid:string):Promise<TextChannel> => {
        const channelname = (this.commandPrefix+'party-'+partyName)
            .replace(/[^A-Za-z0-9-]+/g,'')
            .substr(0,20);

        const overwrites = [     
            {
                id: guild.id, 
                type: 'role', 
                 deny: 0x00000400, 
                allow: 0x00000000,
                //Need these strictly for typescript
                channel: null,
                delete: null,
            } as PermissionOverwrites
        ];

        const channel:TextChannel = await guild.createChannel(channelname,'text',overwrites) as TextChannel;

        channel.setParent(BotConstants.PARTIES_CATEGORY_ID);

        const readSendPerms = {
            READ_MESSAGES: true,
            SEND_MESSAGES: true,
        };

        await channel.overwritePermissions(leaderUid,readSendPerms);

        this.uids.canSeePartyChannels.forEach((uid:string) => {
            channel.overwritePermissions(uid,readSendPerms);
        });

        return channel;
    }

    deleteChannel(channelId:string){
        const channel = this.getChannelById(channelId);

        if(channel){
            channel.delete();
        }
    }
}

function resolveArgs(msg:string){
    let regex = /("([^"]+)")|('([^']+)')|\S+/g,
        matches = [],
        match;

    while((match = regex.exec(msg)) !== null) matches.push(match[4] || match[2] || match[0]);

    return matches;
}