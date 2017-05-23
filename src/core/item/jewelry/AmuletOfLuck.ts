import ItemEquippable from '../ItemEquippable';
import ItemId from '../ItemId';
import { EquipmentSlot } from '../CreatureEquipment';
import { ICreatureStatSet } from '../../creature/Creature';

export const AmuletOfLuck = new ItemEquippable({
    id: ItemId.AmuletOfLuck,
    title: 'Amulet of Luck',
    description: `(+1 Luck) Most say these baubles do nothing, or at best instill a sense of bravery in the wearer. Yet, few can deny the allure of a good luck charm.\n\nThis particular example is of quite inferior quality.`,
    goldValue: 100,
    slotType:'amulet',
    onAddBonuses:function(stats:ICreatureStatSet){
        stats.luck += 1;
    }
});