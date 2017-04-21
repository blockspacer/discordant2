import Command from '../Command';
import { CommandBag, CommandRunBag } from '../Command';
import PermissionId from '../../core/permissions/PermissionId';
import CharacterClass from '../../core/creature/player/CharacterClass';
import CharacterClasses from '../../core/creature/player/CharacterClasses';
import GetEarnedWishes from '../../util/GetEarnedWishes';
import MarketOfferEncoder from '../../util/MarketOfferEncoder';
import { SocketActiveMarketOffer } from "../../gameserver/db/api/DBGetActiveMarketOffers";
import Challenge from './Challenge';
import { User } from "discord.js";

export default class MarketShop extends Command{
    constructor(bag:CommandBag){
        super({
            name: 'marketshop',
            description: `View your items for sale or another player\'s`,
            usage: 'marketshop [@username]',
            permissionNode: PermissionId.MarketShop,
            minParams: 0,
        });

        this.aliases.set('mshop','marketshop');
    }

    async run(bag:CommandRunBag){
        let tagUserId;

        if(bag.params.length == 0){
            tagUserId = bag.message.author.id;
        }
        else{
            tagUserId = this.getUserTagId(bag.params[0]);

            if(!tagUserId){
                bag.message.channel.sendMessage(this.getUsage());

                return;
            }
        }

        const shopPlayer = await bag.socket.getPlayer(tagUserId);

        if(!shopPlayer){
            bag.message.channel.sendMessage('Player not found');

            return;
        }

        const offers:Array<SocketActiveMarketOffer> = await bag.socket.marketGetPlayerOffers(tagUserId);

        let msg = bag.message.author.id == tagUserId ? `Your` : shopPlayer.title+`'s`;
        
        msg += ` shop offers\n\n`;

        if(offers == null){
            msg += 'No offers found';
        }
        else{
            msg += offers.map(function(offer){
                const offerSid = MarketOfferEncoder.encode(offer.id);

                return `${offerSid} ${offer.price}GP each (${offer.amountLeft} left, ${offer.price*offer.amountLeft}GP buyout)`;
            }).join('\n');
        }

        bag.message.channel.sendMessage(msg);
    }
}