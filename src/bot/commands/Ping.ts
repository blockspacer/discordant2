import Command from '../Command';
import { CommandBag, CommandRunBag } from '../Command';
import PermissionId from '../../core/permissions/PermissionId';

export default class Pong extends Command{
    constructor(bag:CommandBag){
        super({
            name: 'ping',
            description: 'Check bot response time',
            usage: 'ping',
            permissionNode: PermissionId.Ping,
            minParams: 0,
        });
    }

    async run(bag:CommandRunBag){
        const time = Math.round((Date.now() - bag.message.createdAt.getTime())/10)/100;
        bag.message.channel.sendMessage(`Pong! (${time}s)`);
    }
}