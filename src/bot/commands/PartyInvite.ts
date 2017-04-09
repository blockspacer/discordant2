import Command from '../Command';
import { CommandBag, CommandRunBag } from '../Command';
import PermissionId from '../../core/permissions/PermissionId';
import CharacterClass from '../../core/creature/player/CharacterClass';
import CharacterClasses from '../../core/creature/player/CharacterClasses';

export default class PartyInvite extends Command{
    constructor(bag:CommandBag){
        super({
            name: 'partyinvite',
            description: 'Invite someone to join your party',
            usage: 'partyinvite <@user>',
            permissionNode: PermissionId.PartyInvite,
            minParams: 1,
        });

        this.aliases = ['pinvite','pi'];
    }

    async run(bag:CommandRunBag){
        const tagUserId = bag.message.mentions.users.first().id;

        if(!tagUserId){
            bag.message.channel.sendMessage(this.getUsage());

            return;
        }

        //not really much to do here since most of it is server-side checks that we would just be duplicating after making a call for the player
        await bag.socket.invitePlayerToJoinParty(bag.message.author.id,tagUserId);

        bag.message.channel.sendMessage(`<@${tagUserId}> was invited to join the party!\n\nYou can use \`dpartyaccept\` or \`dpartydecline\``);
    }
}