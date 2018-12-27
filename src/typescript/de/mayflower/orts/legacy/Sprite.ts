
export class Sprite
{
    static BILLBOARD01 =            { w:  300, src: 'sprite/billboard01.png' };
    static BILLBOARD02 =            { w:  215, src: 'sprite/billboard02.png' };
    static BILLBOARD03 =            { w:  230, src: 'sprite/billboard03.png' };
    static BILLBOARD04 =            { w:  268, src: 'sprite/billboard04.png' };
    static BILLBOARD05 =            { w:  298, src: 'sprite/billboard05.png' };
    static BILLBOARD06 =            { w:  298, src: 'sprite/billboard06.png' };
    static BILLBOARD07 =            { w:  298, src: 'sprite/billboard07.png' };
    static BILLBOARD08 =            { w:  385, src: 'sprite/billboard08.png' };
    static BILLBOARD09 =            { w:  328, src: 'sprite/billboard09.png' };

    static BOULDER1 =               { w:  168, src: 'sprite/boulder1.png' };
    static BOULDER2 =               { w:  298, src: 'sprite/boulder2.png' };
    static BOULDER3 =               { w:  320, src: 'sprite/boulder3.png' };
    static BUSH1 =                  { w:  240, src: 'sprite/bush1.png' };
    static BUSH2 =                  { w:  232, src: 'sprite/bush2.png' };
    static CACTUS =                 { w:  235, src: 'sprite/cactus.png' };
    static CAR01 =                  { w:   80, src: 'sprite/car01.png' };
    static CAR02 =                  { w:   80, src: 'sprite/car02.png' };
    static CAR03 =                  { w:   88, src: 'sprite/car03.png' };
    static CAR04 =                  { w:   80, src: 'sprite/car04.png' };
    static COLUMN =                 { w:  200, src: 'sprite/column.png' };
    static DEAD_TREE1 =             { w:  135, src: 'sprite/dead_tree1.png' };
    static DEAD_TREE2 =             { w:  150, src: 'sprite/dead_tree2.png' };
    static PALM_TREE =              { w:  215, src: 'sprite/palm_tree.png' };
    static PLAYER_LEFT =            { w:   80, src: 'sprite/player_left.png' };
    static PLAYER_RIGHT =           { w:   80, src: 'sprite/player_right.png' };
    static PLAYER_STRAIGHT =        { w:   80, src: 'sprite/player_straight.png' };
    static PLAYER_UPHILL_LEFT =     { w:   80, src: 'sprite/player_uphill_left.png' };
    static PLAYER_UPHILL_RIGHT =    { w:   80, src: 'sprite/player_uphill_right.png' };
    static PLAYER_UPHILL_STRAIGHT = { w:   80, src: 'sprite/player_uphill_straight.png' };
    static SEMI =                   { w:  122, src: 'sprite/semi.png' };
    static STUMP =                  { w:  195, src: 'sprite/stump.png' };
    static TREE1 =                  { w:  360, src: 'sprite/tree1.png' };
    static TREE2 =                  { w:  282, src: 'sprite/tree2.png' };
    static TRUCK =                  { w:  100, src: 'sprite/truck.png' };

    static HILLS = { src: 'background/hills.png' };
    static SKY   = { src: 'background/sky.png'   };
    static TREES = { src: 'background/trees.png' };

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
