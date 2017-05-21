import CreatureId from '../CreatureId';
import CreatureAIControlled from '../CreatureAIControlled';
import AttributeSet from '../AttributeSet';
import CreatureEquipment from '../../item/CreatureEquipment';
import { FireAntMiteWeapon } from '../../item/weapons/FireAntMiteWeapon';

export default class FireAntMite extends CreatureAIControlled{
    constructor(){
        super({
            id: CreatureId.FireAntMite,
            title: 'Fire Ant Mite',
            description: 'A common parasite that lives off of giant fire ants',
            attributes: new AttributeSet({
                strength: 12,
                agility: 16,
                vitality: 8,
                spirit: 0,
                luck: 0,
            }),
            equipment: new CreatureEquipment({
                weapon: FireAntMiteWeapon
            }),
            wishesDropped: 30,
        });
    }
}