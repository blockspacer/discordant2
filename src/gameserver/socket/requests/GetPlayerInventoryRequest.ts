import { ServerResponse, ServerRequestData, ServerRequestReceiveBag } from '../ServerRequest';
import ServerRequest from '../ServerRequest';
import { SocketPlayerInventory } from '../../../core/item/PlayerInventory';
import PlayerCharacter from '../../../core/creature/player/PlayerCharacter';

export interface GetPlayerInventoryData extends ServerRequestData{
    uid: string;
}

export interface GetPlayerInventoryResponse extends ServerResponse{
    inventory:SocketPlayerInventory;
}

export default class GetPlayerInventoryRequest extends ServerRequest{
    data:GetPlayerInventoryData;

    constructor(playerUID:string){
        super('GetPlayerInventory',{
            uid: playerUID
        });
    }

    async send(sioc:SocketIOClient.Socket):Promise<SocketPlayerInventory>{
        return (await this._send(sioc) as GetPlayerInventoryResponse).inventory;
    }

    async receive(bag:ServerRequestReceiveBag):Promise<GetPlayerInventoryResponse>{
        const player:PlayerCharacter = await bag.game.getPlayerCharacter(this.data.uid);

        if(!player){
            throw 'Player not found';
        }

        return {
            success: true,
            inventory: player.inventory.toSocket()
        };
    }
}