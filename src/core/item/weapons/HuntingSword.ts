import Weapon from '../Weapon';
import WeaponAttack, { WeaponDamageType, ScalingLevel } from '../WeaponAttack';
import WeaponAttackStep from '../WeaponAttackStep';

import Creature from '../../creature/Creature';
import DamageScaling from '../../damage/DamageScaling';
import ItemId from '../ItemId';
import { DamageFuncBag, DamageType } from '../WeaponAttackStep';
import { Attribute } from "../../creature/AttributeSet";
import { DefaultDamageFunc } from '../../damage/DefaultDamageFunc';

export const HuntingSword = new Weapon({
    id: ItemId.HuntingSword,
    title: 'Hunting Sword',
    description: 'A straight, pointed blade used to quickly and silently finish off prey before its calls can alert other, larger predators to the meal.',
    damageBlocked: 0.05,
    goldValue: 30,
    useRequirements: {
        Strength: 12
    },//no use requirements
    attacks: [
        new WeaponAttack({
            title: 'swing',
            minBaseDamage: 8,
            maxBaseDamage: 14,
            damageType: DamageType.physical,
            scalingAttribute: Attribute.agility,
            scalingLevel: ScalingLevel.C,
            steps: [
                new WeaponAttackStep({
                    attackMessage: '{attacker} slices {defender} with their hunting sword',
                    damageFunc: DefaultDamageFunc
                })
            ],
            aiUseWeight: 0.6
        }),
        new WeaponAttack({
            title: 'duo',
            minBaseDamage: 5,
            maxBaseDamage: 10,
            damageType: DamageType.physical,
            specialDescription: 'Attacks 1-3 times',
            chargesRequired: 1,
            scalingAttribute: Attribute.agility,
            scalingLevel: ScalingLevel.C,
            steps: [
                new WeaponAttackStep({
                    attackMessage: '{attacker} slices {defender} (BROKEN DONT USE RIGHT NOW)',
                    damageFunc: DefaultDamageFunc,
                })
            ],
            aiUseWeight: 0.4
        }),
    ]
});