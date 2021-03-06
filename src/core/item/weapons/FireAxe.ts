import Weapon from '../Weapon';
import WeaponAttack, { ScalingLevel } from '../WeaponAttack';
import WeaponAttackStep from '../WeaponAttackStep';
import Creature from '../../creature/Creature';

import ItemId from '../ItemId';
import { DamageFuncBag, DamageType } from '../WeaponAttackStep';
import { DefaultDamageFunc } from '../../damage/DefaultDamageFunc';
import { Attribute } from "../../creature/AttributeSet";
import BattleTemporaryEffect from "../../effects/BattleTemporaryEffect";
import EffectId from '../../effects/EffectId';
import { EffectRage } from '../../effects/types/EffectRage';

export const FireAxe = new Weapon({
    id: ItemId.FireAxe,
    title: 'Fire Axe',
    description: `A large axe enchanted to erupt in flame when striking an opponent`,
    damageBlocked: 0.05,
    goldValue: 150,
    useRequirements:{
        strength: 36
    },
    attacks: [
        new WeaponAttack({
            title: 'swing',
            minBaseDamage: 20,
            maxBaseDamage: 30,
            damageType: DamageType.fire,
            scalingAttribute: Attribute.strength,
            scalingLevel: ScalingLevel.C,
            steps: [
                new WeaponAttackStep({
                    attackMessage: '{attacker} slashes {defender} with a flaming axe',
                    damageFunc: DefaultDamageFunc
                })
            ],
            aiUseWeight: 0.8
        }),        
        new WeaponAttack({
            title: 'slam',
            minBaseDamage: 70,
            maxBaseDamage: 80,
            damageType: DamageType.fire,
            scalingAttribute: Attribute.strength,
            scalingLevel: ScalingLevel.C,
            chargesRequired: 2,
            steps: [
                new WeaponAttackStep({
                    attackMessage: '{attacker} slams their axe down on {defender}',
                    damageFunc: DefaultDamageFunc,
                }),
            ],
            aiUseWeight: 0.1
        }),
        new WeaponAttack({
            title: 'rage',
            specialDescription: 'Lowers VIT by 4 and increases STR by 10 (12 rounds)',
            minBaseDamage: 0,
            maxBaseDamage: 0,
            damageType: DamageType.special,
            scalingAttribute: Attribute.strength,
            scalingLevel: ScalingLevel.No,
            steps: [
                new WeaponAttackStep({
                    attackMessage: '{attacker} rages letting out a terrifying scream',
                    damageFunc: function(bag: DamageFuncBag){
                        bag.battle.addTemporaryEffect(
                            bag.attacker.creature,
                            EffectRage,
                            12
                        );

                        return [];
                    },
                }),
            ],
            aiUseWeight: 0.0
        }),
    ]
});