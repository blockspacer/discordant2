import ItemBase from '../ItemBase';
import ItemId from '../ItemId';
import ItemUsable from '../ItemUsable';
import PlayerCharacter from '../../creature/player/PlayerCharacter';
import BattleTemporaryEffectAttributeBoost from '../../effects/BattleTemporaryEffectAttributeBoost';
import EffectId from '../../effects/EffectId';
import { Attribute } from "../../creature/AttributeSet";

export default new ItemUsable({
    id: ItemId.Bane,
    title: 'Bane',
    description: '(During a battle: boosts STR) Wolf\'s Bane, a poisonus wild flower used by many a hunter to subdue prey.',
    goldValue: 10,
    battleExhaustion: 1,
    canUse: function(user:PlayerCharacter){
        if(user.battle == null){
            throw 'You are not currently in a battle';
        }
    },
    onUse: function(user:PlayerCharacter):string{
        user.battle.addTemporaryEffect(user,new BattleTemporaryEffectAttributeBoost({
            id: EffectId.WolfsBane,
            title: `Wolf's Bane`,
            attribute: Attribute.strength,
            amount: 10,
        }),30);

        return null;
    }
});