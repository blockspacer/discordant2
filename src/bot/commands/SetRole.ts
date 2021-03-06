import Command from '../Command';
import { CommandBag, CommandRunBag } from '../Command';
import PermissionId from '../../core/permissions/PermissionId';
import CharacterClass from '../../core/creature/player/CharacterClass';
import CharacterClasses from '../../core/creature/player/CharacterClasses';

export default class SetRole extends Command{
    constructor(bag:CommandBag){
        super({
            name: 'setrole',
            description: 'Set a user\'s role',
            usage: 'setrole <@username> <roleName>',
            permissionNode: PermissionId.SetRole,
            minParams: 2,
        });
    }

    async run(bag:CommandRunBag){
        if(bag.params.length < 2){
            bag.message.channel.send(this.getUsage());

            return;
        }

        const tagUserId = this.getUserTagId(bag.params[0]);

        if(!tagUserId){
            bag.message.channel.send('That player is not registered, '+bag.message.author.username);

            return;
        }

        const roleStr = bag.params[1];

        if(!bag.permissions.isRole(roleStr)){
            bag.message.channel.send(`${roleStr} is not a valid role, ${bag.message.author.username}`);

            return;
        }

        const setRolePC = await bag.socket.getPlayer(tagUserId);

        if(!setRolePC){
            bag.message.channel.send(`That user is not registered, ${bag.message.author.username}`);

            return;
        }

        await bag.socket.setPlayerRole(setRolePC.uid,roleStr);

        bag.message.channel.send(`${setRolePC.title} was granted the \`${roleStr}\` role, ${bag.message.author.username}`);
    }
}