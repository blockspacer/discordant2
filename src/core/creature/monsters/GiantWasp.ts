import Creature from '../Creature';
import CreatureId from '../CreatureId';
import CreatureEquipment from '../../item/CreatureEquipment';
import {BareHands} from '../../item/ItemsIndex';
import AttributeSet from '../AttributeSet';
import CreatureAIControlled from '../CreatureAIControlled';
import { GiantWaspWeapon } from '../../item/weapons/GiantWaspWeapon';

export default class GiantWasp extends CreatureAIControlled{
    constructor(){
        super({
            id: CreatureId.GiantWasp,
            title: 'Large Wasp',
            description: 'A low level generic creature',
            attributes: new AttributeSet({
                strength: 4,
                agility: 4,
                vitality: 2,
                spirit: 4,
                luck: 4,
            }),
            onDefeated: (e)=>{
                setTimeout(() => {                
                   e.party.sendChannelMessage('You won! Now you can grab the treasure!');
                }, 1000);
            },
            equipment: new CreatureEquipment({
                weapon: GiantWaspWeapon
            }),
            wishesDropped: 5,
        });
    }
}