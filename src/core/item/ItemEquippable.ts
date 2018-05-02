import ItemBase from './ItemBase';
import {ItemBaseBag} from './ItemBase';
import Creature from '../creature/Creature';
import {ICreatureStatSet} from '../creature/Creature';
import { EquipmentSlot } from './CreatureEquipment';
import CreatureBattleTurnBased, { IBattleCreature } from '../battle/CreatureBattleTurnBased';

export interface ItemEquippableBag extends ItemBaseBag{
    slotType:EquipmentSlot;
    onAddBonuses?:OnAddBonusesHandler;
    onDefeat?:OnDefeatHandler;
    onDefend?:OnDefendHandler;
    useRequirements?:UseRequirements;
    lostOnDeath?:boolean;
}

export interface UseRequirements{
    strength?:number;
    agility?:number;
    vitality?:number;
    spirit?:number;
    luck?:number;
}

export interface OnAddBonusesHandler{
    (stats:ICreatureStatSet):void;//Modifies the statset if bonuses/penalties apply
}

interface BattleBag{
    battle:CreatureBattleTurnBased;
    wearer:IBattleCreature;
}

export interface OnDefendHandlerBag extends BattleBag{
    defender: IBattleCreature;
}

export interface OnDefendHandler extends OnDefendHandlerBag{
    (bag: OnDefendHandlerBag):void;
}

export interface OnDefeatHandlerBag extends BattleBag{
    attacker:IBattleCreature;
}

export interface OnDefeatHandler{
    (bag: OnDefeatHandlerBag):void;
}

export default class ItemEquippable extends ItemBase{
    slotType:EquipmentSlot;
    onAddBonuses?:OnAddBonusesHandler;
    onDefeat?:OnDefeatHandler;
    onDefend?:OnDefendHandler;
    useRequirements:UseRequirements;
    lostOnDeath:boolean;

    constructor(bag:ItemEquippableBag){
        super(bag);

        this.slotType = bag.slotType;

        if(bag.onAddBonuses) this.onAddBonuses = bag.onAddBonuses;
        if(bag.onDefeat) this.onDefeat = bag.onDefeat;
        if(bag.onDefend) this.onDefend = bag.onDefend;

        this.useRequirements = bag.useRequirements || {};
        this.lostOnDeath = bag.lostOnDeath;
    }

    canEquip(creature:Creature){
        for(var useRequirement in this.useRequirements){
            const requirementAmount = this.useRequirements[useRequirement];

            if(creature.stats[useRequirement] < requirementAmount){
                return false;
            }
        }

        return true;
    }
}