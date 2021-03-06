import ItemEquippable from '../ItemEquippable';
import ItemId from '../ItemId';

export const WornLeathers = new ItemEquippable({
    id: ItemId.WornLeathers,
    title: 'Worn Leathers',
    description: `(+2 Physical Resistance) A set of hardened animal hide braces that cover the chest, arms and legs`,
    goldValue: 30,
    useRequirements: {
        strength: 10
    },
    slotType:'armor',
    onAddBonuses:(e)=>{
        e.target.stats.resistances.physical += 2;
    }
});