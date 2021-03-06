import BattleTemporaryEffect from '../BattleTemporaryEffect';
import EffectId from '../EffectId';
import { Attribute } from '../../creature/AttributeSet';

export const EffectBless = new BattleTemporaryEffect({
    id: EffectId.Bless,
    title: 'Bless',
    onAdded:(e)=>{
        e.battle.queueBattleMessage([`+${e.target.title} is blessed with +10 to all resistances!`]);
    },
    onRemoved:(e)=>{
        e.battle.queueBattleMessage([`-${e.target.title}'s blessing wore off`]);
    },
    onAddBonuses:function(stats){
        stats.resistances.physical += 10;
        stats.resistances.fire += 10;
        stats.resistances.thunder += 10;
        stats.resistances.dark += 10;
    }
});