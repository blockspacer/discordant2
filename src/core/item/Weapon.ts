import WeaponAttack from './WeaponAttack';
import Creature from '../creature/Creature';
import ItemEquippable, { BattleBeginEvent, AddBonusesEvent } from './ItemEquippable';
import { ItemEquippableBag, UseRequirements } from './ItemEquippable';
import {EquipmentSlot} from './CreatureEquipment';
import Use from '../../bot/commands/Use';
import { ItemRecipe } from './ItemRecipe';

interface ItemWeaponBag{
    id:number;
    title:string;
    description:string;
    goldValue: number;
    damageBlocked:number;
    chanceToCritical?: number;
    criticalMultiplier?: number;
    useRequirements:UseRequirements;
    attacks:Array<WeaponAttack>;    
    onAddBonuses?: (e:AddBonusesEvent)=>void;
    onBattleBegin?: (e:BattleBeginEvent)=>void;
    showInItems?:boolean;
    recipe?:ItemRecipe;
}

export default class Weapon extends ItemEquippable{
    attacks:Array<WeaponAttack>;
    damageBlocked:number;//0.0 to 0.45 describing the % of damage this weapon blocks when the player blocks
    chanceToCritical: number;
    criticalMultiplier: number;

    constructor(bag:ItemWeaponBag){
        super({
            id:bag.id,
            title:bag.title,
            description:bag.description,
            goldValue: bag.goldValue,
            useRequirements: bag.useRequirements,
            showInItems: bag.showInItems,  
            onAddBonuses: bag.onAddBonuses,
            onBattleBegin: bag.onBattleBegin,
            recipe: bag.recipe,
            slotType:'weapon'//also offhand, but for slot type they are all primary
        });

        this.damageBlocked = bag.damageBlocked;
        this.chanceToCritical = typeof bag.chanceToCritical === "undefined" ? 0.05 : bag.chanceToCritical;
        this.criticalMultiplier = typeof bag.criticalMultiplier === "undefined" ? 2 : bag.criticalMultiplier;
        this.attacks = bag.attacks;
        this.attacks.forEach((attack)=>{
            attack.weapon = this;
        });
    }

    findAttack(attackName:string):WeaponAttack{
        attackName = attackName.toUpperCase();
        
        for(var i=0;i<this.attacks.length;i++){
            const attack = this.attacks[i];

            if(attack.title.toUpperCase() == attackName){
                return attack;
            }
        }

        return null;
    }
}