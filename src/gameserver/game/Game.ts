import DatabaseService from '../db/DatabaseService';
import DBGetPlayerCharacter from '../db/api/DBGetPlayerCharacter';
import PlayerCharacter from '../../core/creature/player/PlayerCharacter';
import InventoryItem from '../../core/item/InventoryItem';
import CharacterClasses from '../../core/creature/player/CharacterClasses';
import CreatureEquipment from '../../core/item/CreatureEquipment';
import PlayerInventory from '../../core/item/PlayerInventory';
import PermissionsService from '../../core/permissions/PermissionService';
import AttributeSet from '../../core/creature/AttributeSet';
import CharacterClass from '../../core/creature/player/CharacterClass';
import DBRegisterPlayerCharacter from '../db/api/DBRegisterPlayerCharacter';
import DBGrantPlayerWishes from '../db/api/DBGrantPlayerWishes';
import { EquipmentSlot } from '../../core/item/CreatureEquipment';
import AllItems from '../../core/item/AllItems';
import DBGrantPlayerXP from '../db/api/DBGrantPlayerXP';
import ItemBase from '../../core/item/ItemBase';
import DBGrantPlayerItem from '../db/api/DBGrantPlayerItem';

export interface GameServerBag{
    db: DatabaseService;
    permissions:PermissionsService;
}

export default class Game{
    db: DatabaseService;
    permissions:PermissionsService;
    cachedPCs: Map<string,PlayerCharacter>;
    items: AllItems;

    constructor(bag:GameServerBag){
        this.db = bag.db;
        this.permissions = bag.permissions;
        this.cachedPCs = new Map();
        this.items = new AllItems();
    }

    async getPlayerCharacter(uid:string):Promise<PlayerCharacter>{
        let player = this.cachedPCs.get(uid);

        if(!player){
            const dbPlayer = await DBGetPlayerCharacter(this.db,uid);

            if(!dbPlayer){
                const response:PlayerCharacter = null;

                return response;
            }

            const inventory = new Map<number,InventoryItem>();

            if(dbPlayer.inventory){
                dbPlayer.inventory.forEach((item:DBInventoryItem)=>{
                    inventory.set(item.item_id,new InventoryItem(this.items.get(item.item_id),item.amount));
                });
            }

            const pcInventory = new PlayerInventory(inventory);
            
            const equipment = {};

            if(dbPlayer.equipment){
                dbPlayer.equipment.forEach((item:DBEquipmentItem)=>{
                    equipment[item.slot] = this.items.get(item.item_id);
                });
            }

            const pcEquipment = new CreatureEquipment(equipment);

            player = new PlayerCharacter({
                uid: dbPlayer.uid,
                title: dbPlayer.username,
                description: dbPlayer.description,
                attributes: new AttributeSet({
                    strength: dbPlayer.attribute_strength,
                    agility: dbPlayer.attribute_agility,
                    vitality: dbPlayer.attribute_vitality,
                    spirit: dbPlayer.attribute_spirit,
                    charisma: dbPlayer.attribute_charisma,
                    luck: dbPlayer.attribute_luck,
                }),
                class: CharacterClasses.get(dbPlayer.class),
                equipment: pcEquipment,
                inventory: pcInventory,
                xp: dbPlayer.xp,
                wishes: dbPlayer.wishes,
                role: this.permissions.getRole(dbPlayer.role),
                karma: dbPlayer.karma
            });

            this.cachedPCs.set(player.uid,player);
        }

        return player;
    }

    async registerPlayerCharacter(bag:RegisterPlayerCharacterBag):Promise<PlayerCharacter>{
        let player:PlayerCharacter = this.cachedPCs.get(bag.uid);

        //Try from database if not
        if(player || await DBGetPlayerCharacter(this.db,bag.uid)){
            throw 'Already registered';
        }

        const playerClass:CharacterClass = CharacterClasses.get(bag.classId);

        if(!playerClass){
            throw 'Invalid class ID "'+bag.classId+'"';
        }

        await DBRegisterPlayerCharacter(this.db,{
            uid: bag.uid,
            username: bag.username,
            class: playerClass,
            discriminator: bag.discriminator,
        });

        player = new PlayerCharacter({
            uid: bag.uid,
            title: bag.username,
            description: playerClass.description,
            attributes: playerClass.startingAttributes,
            class: playerClass,
            equipment: playerClass.startingEquipment,
            inventory: new PlayerInventory(),
            xp: 0,
            wishes: 0,
            role: this.permissions.getRole('player'),
            karma: 0,
        });

        return player;
    }

    async grantPlayerWishes(uid:string,amount:number):Promise<number>{
        const player = await this.getPlayerCharacter(uid);

        const leftOver = await DBGrantPlayerWishes(this.db,uid,amount);

        return leftOver;
    }

    async grantPlayerXP(uid:string,amount:number):Promise<number>{
        const player = await this.getPlayerCharacter(uid);

        const leftOver = await DBGrantPlayerXP(this.db,uid,amount);

        return leftOver;
    }

    async grantPlayerItem(uid:string,itemId:number,amount:number):Promise<number>{
        const player = await this.getPlayerCharacter(uid);

        if(!player){
            throw 'Player is not registered';
        }
        
        const itemBase = this.items.get(itemId);

        if(!itemBase){
            throw 'Invalid item id '+itemId;
        }

        await DBGrantPlayerItem(this.db,uid,itemId,amount);

        player.inventory._addItem(itemBase,amount);

        return player.inventory.getItemAmount(itemBase);
    }
}

export interface RegisterPlayerCharacterBag{
    uid:string;
    discriminator:string;
    username:string;
    classId:number;
}

interface DBEquipmentItem{
    player_uid:string;
    item_id:number;
    slot:EquipmentSlot;
}

interface DBInventoryItem{
    player_uid:string;
    item_id:number;
    amount:number;
}