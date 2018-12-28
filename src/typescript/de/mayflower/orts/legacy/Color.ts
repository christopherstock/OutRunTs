
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   Color values the game makes use of.
    *******************************************************************************************************************/
    export class COLORS
    {
        static SKY      = '#72D7EE';
        static TREE     = '#005108';
        static FOG      = '#005108';
        static LIGHT    = { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC'  };
        static DARK     = { road: '#696969', grass: '#009A00', rumble: '#BBBBBB'                   };
        static START    = { road: 'white',   grass: 'white',   rumble: 'white'                     };
        static FINISH   = { road: 'black',   grass: 'black',   rumble: 'black'                     };
    }

    export class Sprite
    {
        static SCALE :number = 0.3 * (1 / 80); // the reference sprite width should be 1/3rd the (half-)roadWidth

        static BILLBOARDS :string[] = [orts.ImageFile.BILLBOARD01, orts.ImageFile.BILLBOARD02, orts.ImageFile.BILLBOARD03, orts.ImageFile.BILLBOARD04, orts.ImageFile.BILLBOARD05, orts.ImageFile.BILLBOARD06, orts.ImageFile.BILLBOARD07, orts.ImageFile.BILLBOARD08, orts.ImageFile.BILLBOARD09];
        static PLANTS     :string[] = [orts.ImageFile.TREE1, orts.ImageFile.TREE2, orts.ImageFile.DEAD_TREE1, orts.ImageFile.DEAD_TREE2, orts.ImageFile.PALM_TREE, orts.ImageFile.BUSH1, orts.ImageFile.BUSH2, orts.ImageFile.CACTUS, orts.ImageFile.STUMP, orts.ImageFile.BOULDER1, orts.ImageFile.BOULDER2, orts.ImageFile.BOULDER3];
        static CARS       :string[] = [orts.ImageFile.CAR01, orts.ImageFile.CAR02, orts.ImageFile.CAR03, orts.ImageFile.CAR04, orts.ImageFile.SEMI, orts.ImageFile.TRUCK];
    }
