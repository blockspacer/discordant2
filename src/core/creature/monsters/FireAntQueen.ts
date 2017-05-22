import CreatureId from '../CreatureId';
import CreatureAIControlled from '../CreatureAIControlled';
import AttributeSet from '../AttributeSet';
import CreatureEquipment from '../../item/CreatureEquipment';
import { FireAntMiteWeapon } from '../../item/weapons/FireAntMiteWeapon';
import { FireAntQueenWeapon } from '../../item/weapons/FireAntQueenWeapon';

export default class FireAntQueen extends CreatureAIControlled{
    constructor(){
        super({
            id: CreatureId.FireAntQueen,
            title: 'Giant Fire Ant Queen',
            description: 'A common parasite that lives off of giant fire ants',
            attributes: new AttributeSet({
                strength: 0,
                agility: 0,
                vitality: 30,
                spirit: 0,
                luck: 0,
            }),
            equipment: new CreatureEquipment({
                weapon: FireAntQueenWeapon
            }),
            wishesDropped: 300,
        });
    }
}