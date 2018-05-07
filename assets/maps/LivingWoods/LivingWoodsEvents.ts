import CreatureId from '../../../src/core/creature/CreatureId';
import Creature from '../../../src/core/creature/Creature';
import { IMapData } from '../../../src/core/map/IMapData';
import { EventTileForagable } from '../../../src/core/map/tiles/EventTileForagable';
import * as ItemsIndex from '../../../src/core/item/ItemsIndex';
import EventTileLootable from "../../../src/core/map/tiles/EventTileLootable";
import EventTileMonster from "../../../src/core/map/tiles/EventTileMonster";
import EventTileWarp from "../../../src/core/map/tiles/EventTileWarp";
import LootGenerator from '../../../src/core/loot/LootGenerator';
import { EventTileDrinkableWater } from '../../../src/core/map/tiles/EventTileDrinkableWater';
import {EventTile} from '../../../src/core/map/EventTile';
import EventTileEnterMessage from "../../../src/core/map/tiles/EventTileEnterMessage";

export const lootGenerator = new LootGenerator();

lootGenerator.addLootItem('common',ItemsIndex.Vial,1);
lootGenerator.addLootItem('rare',ItemsIndex.Tent,1);

export const LivingWoodsEvents:IMapData = {
    startX: 27,
    startY: 27,
    encounterChance: 0.1,
    encounters:[
        { id:CreatureId.WillOWisp, weight: 2 },
        { id:CreatureId.Faun, weight: 4 },
        { id:CreatureId.Treant, weight: 1 },
    ],
    eventTiles: [
        {
            event: new EventTileMonster(`Out of the trees comes a dark growling figure!`,CreatureId.Werewolf),
            coords: [
                {x:14,y:16},
            ],
        },
        {
            event: new EventTileLootable({
                lootGenerator: lootGenerator,
                lootSettings:{
                    startingNode: 'common',
                    chanceToGenerate: 0.8,        
                },
                wishesMax: 120,
                goldMax: 200,
            }),
            coords: [
                {x:12, y:3},
                {x:9, y:19},
                {x:26, y:5},
                {x:27, y:8},
                {x:27, y:20},
            ],
        },
        {
            event: new EventTileLootable({
                lootGenerator: lootGenerator,
                lootSettings:{
                    startingNode: 'rare',
                    chanceToGenerate: 0.8,        
                },
                wishesMax: 160,
                goldMax: 250,
            }),
            coords: [
                {x:6, y:8},
                {x:13, y:15},
                {x:24, y:11},
            ],
        },
        {
            event: new EventTileEnterMessage({
                message: `A stranger hiding behind a grey robe looks you over... "Bah, come back later when you have something worth trading for!"`,
            }),
            coords: [
                {x:19,y:9},
            ],
        },
    ]
};