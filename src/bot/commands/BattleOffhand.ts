import Command from '../Command';
import { CommandBag, CommandRunBag } from '../Command';
import PermissionId from '../../core/permissions/PermissionId';
import CharacterClass from '../../core/creature/player/CharacterClass';
import CharacterClasses from '../../core/creature/player/CharacterClasses';
import Weapon from "../../core/item/Weapon";
import WeaponAttack from '../../core/item/WeaponAttack';

export default class BattleAttack extends Command{
    constructor(bag:CommandBag){
        super({
            name: 'offhand',
            description: '(during battle) send an offhand attack',
            usage: 'offhand',
            permissionNode: PermissionId.BattleAttack,
            minParams: 0,
        });

        this.aliases.set('off','offhand');
    }

    async run(bag:CommandRunBag){
        const target = bag.message.mentions.users.first();

        const player = await bag.socket.getPlayer(bag.message.author.id);

        if(player.status != 'inBattle'){
            throw 'You are not currently in a battle';
        }

        if(bag.message.channel.id != player.battleChannelId){
            throw `Your battle is in <#${player.battleChannelId}>`;
        }

        const primaryWeaponId = player.equipment.weapon;
        const primaryWeapon = bag.items.get(primaryWeaponId) as Weapon;
        let attack:WeaponAttack;
        let wantedAttackStr;
        
        if(target && bag.params.length > 1){
            wantedAttackStr = bag.params.slice(0,-1).join(' ').toUpperCase();
        }
        else if(target || bag.params.length == 0){
            wantedAttackStr = primaryWeapon.attacks[0];
        }
        else{
            wantedAttackStr = bag.params.join(' ').toUpperCase();
        }

        attack = primaryWeapon.findAttack(wantedAttackStr);

        if(!attack){
            let validAttacks = '';

            offhandWeapon.attacks.forEach((attack)=>{
                validAttacks += ', '+attack.title;
            });

            bag.message.channel.sendMessage(wantedAttackStr+' is not a valid attack, '+bag.message.author.username+'. '+offhandWeapon.title+' has: '+validAttacks.substr(2));

            return;
        }

        await bag.socket.sendBattleAttack(
            player.uid,
            target?target.id:player.uid,
            attack.title,
            true
        );
    }
}