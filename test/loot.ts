import LootGenerator from '../src/core/loot/LootGenerator';
import * as ItemsIndex from '../src/core/item/ItemsIndex';
import { IGenerateLootBag } from '../src/core/loot/LootGenerator';

const Table = require('cli-table');

// BEGIN LOOT
const lootGenerator = new LootGenerator();

lootGenerator.addLootItem('common',ItemsIndex.HuntingSword,0.1);
lootGenerator.addLootItem('common',ItemsIndex.WoodShield,0.3);
lootGenerator.addLootItem('common',ItemsIndex.HandAxe,0.3);
lootGenerator.addLootItem('common',ItemsIndex.WornLeathers,0.3);
lootGenerator.addLootItem('common',ItemsIndex.WornLeatherHelmet,0.3);
lootGenerator.addLootItem('common',ItemsIndex.ClothTunic,0.3);
lootGenerator.addLootItem('common',ItemsIndex.ClothHood,0.3);
lootGenerator.addLootItem('common',ItemsIndex.Vial,1);
lootGenerator.addLootItem('common',ItemsIndex.RedForestMapPiece,0.3);

lootGenerator.addLootItem('rare',ItemsIndex.RingOfAgility,0.1);
lootGenerator.addLootItem('rare',ItemsIndex.RingOfHealth,0.1);
lootGenerator.addLootItem('rare',ItemsIndex.RingOfStrength,0.1);
lootGenerator.addLootItem('rare',ItemsIndex.RingOfLuck,0.1);
lootGenerator.addLootItem('rare',ItemsIndex.RingOfSpirit,0.1);
lootGenerator.addLootItem('rare',ItemsIndex.TabletOfPoison,0.1);
lootGenerator.addLootItem('rare',ItemsIndex.Tent,0.1);
lootGenerator.addLootItem('rare',ItemsIndex.RedForestMapPiece,0.4);

//////////////// BEGIN SETTINGS /////////////

const LOOT_TEST_RUNS = 100000;

const LOOT_TEST_SETTINGS:IGenerateLootBag = {
    startingNode: 'common',
    chanceToGenerate: 1,
    chanceToGoUp: 0.5,
    maxStepsUp: 6,
};

const MF_RATES = [
       0,
       5,
      10,
      20,
      30,
      40,
      50,
     100,
     150,
     200,
];

//////////////// END SETTINGS /////////////

function testLootAt(magicFind):Array<{name:string,value:number}>{
    const results = {};

    for(var i=0;i<LOOT_TEST_RUNS;i++){
        const lootItemId = lootGenerator.generateLoot({
            startingNode: LOOT_TEST_SETTINGS.startingNode,
            chanceToGenerate: LOOT_TEST_SETTINGS.chanceToGenerate,
            chanceToGoUp: LOOT_TEST_SETTINGS.chanceToGoUp,
            maxStepsUp: LOOT_TEST_SETTINGS.maxStepsUp,
            magicFind: magicFind
        });

        results[lootItemId] = (results[lootItemId] || 0) + 1;
    }

    const resultsArr:Array<{name:string,value:number}> = [];

    for(var itemId in results){
        const dropped = results[itemId];
        const dropPercent = Math.round(dropped/LOOT_TEST_RUNS*10000)/100;;

        resultsArr.push({
            name: ItemsIndex[itemId],
            value: dropPercent
        });
    }

    return resultsArr;
}

const table = new Table({
    head: [LOOT_TEST_RUNS+' runs','Rarity'].concat(
        MF_RATES.map(function(rate){
            return rate+' MF';
        })
    ),
});

// Collect results in a x,y lookup of <Item Name><magicFindRate>
const allResults = {};
const itemNames = {};//used to generate table left headers

MF_RATES.forEach(function(rate,index){
    const rateResults = testLootAt(rate);

    rateResults.forEach(function(rr){
        itemNames[rr.name] = true;
        allResults[rr.name+rate] = rr.value;
    });
});

// Generate a proper array to pass as a table
Object.keys(itemNames)
.sort(function(a,b){
    return allResults[b+MF_RATES[0]] - allResults[a+MF_RATES[0]];
})
.forEach(function(itemName){
    let itemRarity = '?';

    lootGenerator.lootNodes.forEach(function(ln){
        if(ln.itemId == ItemsIndex[itemName]){
            itemRarity = ''+ln.rarity;
        }
    });

    const rowValues = [itemRarity];

    MF_RATES.forEach(function(rate){
        const percentDropped = allResults[itemName+rate];

        rowValues.push(percentDropped ? percentDropped+'%' : '');
    });

    const row = {};

    row[itemName] = rowValues;

    table.push(row);    
});

console.log(table.toString());