import PermissionId from './PermissionId';
import { Dagger } from '../item/weapons/Dagger';
//Hard coded permissions assigned to each role
export const BannedPermissions = [

];

export const AnonymousPermissions = [
    PermissionId.Begin,
    PermissionId.Classes,
];

export const PlayerPermissions = [
    PermissionId.Stats,
    PermissionId.WishCalc,
    PermissionId.Party,
    PermissionId.PartyNew,
    PermissionId.PartyInvite,
    PermissionId.PartyJoin,
    PermissionId.PartyExplore,
    PermissionId.PartyMove,
    PermissionId.PartyKick,
    PermissionId.Battle,
    PermissionId.BattleAttack,
    PermissionId.BattleOffhand,
    PermissionId.BattleCharge,
    PermissionId.BattleBlock,
    PermissionId.Inventory,
    PermissionId.Help,
    PermissionId.Give,
    PermissionId.Equip,
    PermissionId.Items,
    PermissionId.Unequip,
    PermissionId.Use,
    PermissionId.Challenge,
    PermissionId.Item,
    PermissionId.Wish,
    PermissionId.Buy,
    PermissionId.MarketSell,
    PermissionId.MarketStop,
    PermissionId.Shop,
    PermissionId.MarketSearch,
    PermissionId.MarketList,
    PermissionId.MarketNew,
    PermissionId.MarketBuy,
    PermissionId.Sell,
    PermissionId.Lead,
    PermissionId.Pass,
    PermissionId.DPR,
    PermissionId.PartyLeave,
    PermissionId.Ping,
    PermissionId.BattleRun,
    PermissionId.PartyMap,
    PermissionId.Craft,
    PermissionId.Pay,
    PermissionId.DodgeCalc,
    PermissionId.Daily,
    PermissionId.Heal,
    PermissionId.SetDescription,
    PermissionId.SCalc,
    PermissionId.PartyKick,
    PermissionId.PartyTransfer,
    PermissionId.Tester,
    PermissionId.PartyReturn,
].concat(AnonymousPermissions).sort();

export const TesterPermissions = [
    PermissionId.Echo,
    PermissionId.Embed,
    PermissionId.ChannelId,
].concat(PlayerPermissions).sort();

export const AdminPermissions = [
    PermissionId.Reset,
    PermissionId.Shutdown,
    PermissionId.Grant,
    PermissionId.SetRole,
    PermissionId.SetPlayingGame,
    PermissionId.Lockdown,
    PermissionId.Refresh,
].concat(TesterPermissions).sort();