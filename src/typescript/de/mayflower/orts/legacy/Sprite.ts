
export class Sprite
{
    static BILLBOARD01 =            { src: 'sprite/billboard01.png' };
    static BILLBOARD02 =            { src: 'sprite/billboard02.png' };
    static BILLBOARD03 =            { src: 'sprite/billboard03.png' };
    static BILLBOARD04 =            { src: 'sprite/billboard04.png' };
    static BILLBOARD05 =            { src: 'sprite/billboard05.png' };
    static BILLBOARD06 =            { src: 'sprite/billboard06.png' };
    static BILLBOARD07 =            { src: 'sprite/billboard07.png' };
    static BILLBOARD08 =            { src: 'sprite/billboard08.png' };
    static BILLBOARD09 =            { src: 'sprite/billboard09.png' };

    static BOULDER1 =               { src: 'sprite/boulder1.png' };
    static BOULDER2 =               { src: 'sprite/boulder2.png' };
    static BOULDER3 =               { src: 'sprite/boulder3.png' };
    static BUSH1 =                  { src: 'sprite/bush1.png' };
    static BUSH2 =                  { src: 'sprite/bush2.png' };
    static CACTUS =                 { src: 'sprite/cactus.png' };
    static CAR01 =                  { src: 'sprite/car01.png' };
    static CAR02 =                  { src: 'sprite/car02.png' };
    static CAR03 =                  { src: 'sprite/car03.png' };
    static CAR04 =                  { src: 'sprite/car04.png' };
    static COLUMN =                 { src: 'sprite/column.png' };
    static DEAD_TREE1 =             { src: 'sprite/dead_tree1.png' };
    static DEAD_TREE2 =             { src: 'sprite/dead_tree2.png' };
    static PALM_TREE =              { src: 'sprite/palm_tree.png' };
    static PLAYER_LEFT =            { src: 'sprite/player_left.png' };
    static PLAYER_RIGHT =           { src: 'sprite/player_right.png' };
    static PLAYER_STRAIGHT =        { src: 'sprite/player_straight.png' };
    static PLAYER_UPHILL_LEFT =     { src: 'sprite/player_uphill_left.png' };
    static PLAYER_UPHILL_RIGHT =    { src: 'sprite/player_uphill_right.png' };
    static PLAYER_UPHILL_STRAIGHT = { src: 'sprite/player_uphill_straight.png' };
    static SEMI =                   { src: 'sprite/semi.png' };
    static STUMP =                  { src: 'sprite/stump.png' };
    static TREE1 =                  { src: 'sprite/tree1.png' };
    static TREE2 =                  { src: 'sprite/tree2.png' };
    static TRUCK =                  { src: 'sprite/truck.png' };

    static HILLS =                  { src: 'background/hills.png' };
    static SKY   =                  { src: 'background/sky.png'   };
    static TREES =                  { src: 'background/trees.png' };

    static SCALE = 0.3 * (1 / 80); // the reference sprite width should be 1/3rd the (half-)roadWidth

    static BILLBOARDS = [Sprite.BILLBOARD01, Sprite.BILLBOARD02, Sprite.BILLBOARD03, Sprite.BILLBOARD04, Sprite.BILLBOARD05, Sprite.BILLBOARD06, Sprite.BILLBOARD07, Sprite.BILLBOARD08, Sprite.BILLBOARD09];
    static PLANTS     = [Sprite.TREE1, Sprite.TREE2, Sprite.DEAD_TREE1, Sprite.DEAD_TREE2, Sprite.PALM_TREE, Sprite.BUSH1, Sprite.BUSH2, Sprite.CACTUS, Sprite.STUMP, Sprite.BOULDER1, Sprite.BOULDER2, Sprite.BOULDER3];
    static CARS       = [Sprite.CAR01, Sprite.CAR02, Sprite.CAR03, Sprite.CAR04, Sprite.SEMI, Sprite.TRUCK];

    static ALL :any[] = [
        Sprite.BILLBOARD01,
        Sprite.BILLBOARD02,
        Sprite.BILLBOARD03,
        Sprite.BILLBOARD04,
        Sprite.BILLBOARD05,
        Sprite.BILLBOARD06,
        Sprite.BILLBOARD07,
        Sprite.BILLBOARD08,
        Sprite.BILLBOARD09,

        Sprite.BOULDER1,
        Sprite.BOULDER1,
        Sprite.BOULDER2,
        Sprite.BOULDER2,
        Sprite.BOULDER3,
        Sprite.BOULDER3,
        Sprite.BUSH1,
        Sprite.BUSH1,
        Sprite.BUSH2,
        Sprite.BUSH2,
        Sprite.CACTUS,
        Sprite.CACTUS,
        Sprite.CAR01,
        Sprite.CAR01,
        Sprite.CAR02,
        Sprite.CAR02,
        Sprite.CAR03,
        Sprite.CAR03,
        Sprite.CAR04,
        Sprite.CAR04,
        Sprite.COLUMN,
        Sprite.COLUMN,
        Sprite.DEAD_TREE1,
        Sprite.DEAD_TREE1,
        Sprite.DEAD_TREE2,
        Sprite.DEAD_TREE2,
        Sprite.PALM_TREE,
        Sprite.PALM_TREE,
        Sprite.PLAYER_LEFT,
        Sprite.PLAYER_LEFT,
        Sprite.PLAYER_RIGHT,
        Sprite.PLAYER_RIGHT,
        Sprite.PLAYER_STRAIGHT,
        Sprite.PLAYER_STRAIGHT,
        Sprite.PLAYER_UPHILL_LEFT,
        Sprite.PLAYER_UPHILL_LEFT,
        Sprite.PLAYER_UPHILL_RIGHT,
        Sprite.PLAYER_UPHILL_RIGHT,
        Sprite.PLAYER_UPHILL_STRAIGHT,
        Sprite.PLAYER_UPHILL_STRAIGHT,
        Sprite.SEMI,
        Sprite.SEMI,
        Sprite.STUMP,
        Sprite.STUMP,
        Sprite.TREE1,
        Sprite.TREE1,
        Sprite.TREE2,
        Sprite.TREE2,
        Sprite.TRUCK,

        Sprite.HILLS,
        Sprite.SKY,
        Sprite.TREES,
    ];
}
