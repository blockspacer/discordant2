import BattleTemporaryEffect from './BattleTemporaryEffect';
import EffectId from './EffectId';
import { EMBED_COLORS } from '../../bot/util/ChatHelpers';
import { Attribute } from '../creature/AttributeSet';

interface AttributeBoostBag{
    id: EffectId;
    title: string;
    attribute: Attribute;
    amount: number;
}

export default class BattleTemporaryEffectAttributeBoost extends BattleTemporaryEffect{
    constructor(bag:AttributeBoostBag){
        super({
            id: bag.id,
            title: bag.title,
            dispellable: true,
            onAdded:(e)=>{
                e.battle.queueBattleMessage([`+${e.target.title}'s ${Attribute[bag.attribute]} is boosted by ${bag.title}!`]);
            },
            onRemoved:(e)=>{
                e.battle.queueBattleMessage([`-${e.target.title}'s ${bag.title} wore off`]);
            },
            onAddBonuses:(stats)=>{
                stats[Attribute[bag.attribute]] += bag.amount;
            }
        });
    }
}