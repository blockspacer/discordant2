import PlayerCharacter from '../creature/player/PlayerCharacter';
import Game from '../../gameserver/game/Game';
import LootGenerator from "../loot/LootGenerator";
import PlayerParty from "../party/PlayerParty";

export interface SendPartyMessageFunc{
    (msg:string):void;
}

export interface EventTileHandlerBag{
    runCount: number;//number of times the event has fired for this tile on this adventure (starts with 0)
    party: PlayerParty;
    player: PlayerCharacter;
}

interface EventTileHandlerFunc{
    (bag:EventTileHandlerBag):void;
}

export interface EventTileBag{
    onEnter?: EventTileHandlerFunc;
    onExit?: EventTileHandlerFunc;
    onInteract?: EventTileHandlerFunc;
    stopsPlayer?: boolean;
}

export default class EventTile{
    onEnter: EventTileHandlerFunc;
    onExit: EventTileHandlerFunc;
    onInteract: EventTileHandlerFunc;
    stopsPlayer: boolean;

    constructor(bag:EventTileBag){
        this.onEnter = bag.onEnter;
        this.onExit = bag.onExit;
        this.onInteract = bag.onInteract;
        this.stopsPlayer = bag.stopsPlayer != undefined ? bag.stopsPlayer : true;
    }
}