import ItemEquippable from '../ItemEquippable';
import ItemId from '../ItemId';
import { EquipmentSlot } from '../CreatureEquipment';
import { ICreatureStatSet } from '../../creature/Creature';

export const BlueEyeAmulet = new ItemEquippable({
    id: ItemId.BlueEyeAmulet,
    title: 'Blue Eye Amulet',
    description: `(decrease chance of getting attacked while in a battle) Said to be the wish remains of an unrequited lover who fell during the great collapse, blue-eyed diamonds absorb light around themselves and those who hold it. As a side effect, monsters are less likely to see you during a battle.`,
    goldValue: 300,
    slotType: 'amulet',
    onAddBonuses:function(stats:ICreatureStatSet){
        stats.redEye = Math.max(1, stats.redEye - 1 );
    }
});