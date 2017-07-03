import { DamageFuncBag, IWeaponAttackDamages } from '../item/WeaponAttackStep';
import { Attribute } from "../creature/AttributeSet";
import { WeaponDamageType } from "../item/WeaponAttack";
import { GetScalingBonusFor } from './DamageScaling';

export function DefaultDamageAllFunc(bag: DamageFuncBag): Array<IWeaponAttackDamages> {
    const attack = bag.step.attack;
    const weapon = attack.weapon;

    const damages = [];

    bag.battle.participants.forEach(function(p){
        if(bag.attacker.teamNumber == p.teamNumber){
            return;
        }

        let damageAmount = Math.random() * (attack.maxBaseDamage - attack.minBaseDamage) + attack.minBaseDamage;

        if(bag.isCritical){
            damageAmount = damageAmount * weapon.criticalMultiplier; 
        }

        const scalingAttribute = Attribute[attack.scalingAttribute];

        damageAmount = damageAmount * GetScalingBonusFor(bag.attacker.creature,attack);
        
        damages.push({
            target: p,
            type: attack.damageType,
            amount: damageAmount
        });
    });

    return damages;
}