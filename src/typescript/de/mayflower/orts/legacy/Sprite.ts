
export class Sprite
{
    static BILLBOARD01 =            { x:  625, y:  375, w:  300, h:  170, src: 'sprite/billboard01.png' };
    static BILLBOARD02 =            { x:  245, y: 1262, w:  215, h:  220, src: 'sprite/billboard02.png' };
    static BILLBOARD03 =            { x:    5, y: 1262, w:  230, h:  220, src: 'sprite/billboard03.png' };
    static BILLBOARD04 =            { x: 1205, y:  310, w:  268, h:  170, src: 'sprite/billboard04.png' };
    static BILLBOARD05 =            { x:    5, y:  897, w:  298, h:  190, src: 'sprite/billboard05.png' };
    static BILLBOARD06 =            { x:  488, y:  555, w:  298, h:  190, src: 'sprite/billboard06.png' };
    static BILLBOARD07 =            { x:  313, y:  897, w:  298, h:  190, src: 'sprite/billboard07.png' };
    static BILLBOARD08 =            { x:  230, y:    5, w:  385, h:  265, src: 'sprite/billboard08.png' };
    static BILLBOARD09 =            { x:  150, y:  555, w:  328, h:  282, src: 'sprite/billboard09.png' };

    static BOULDER1 =               { x: 1205, y:  760, w:  168, h:  248, src: 'sprite/boulder1.png' };
    static BOULDER2 =               { x:  621, y:  897, w:  298, h:  140, src: 'sprite/boulder2.png' };
    static BOULDER3 =               { x:  230, y:  280, w:  320, h:  220, src: 'sprite/boulder3.png' };
    static BUSH1 =                  { x:    5, y: 1097, w:  240, h:  155, src: 'sprite/bush1.png' };
    static BUSH2 =                  { x:  255, y: 1097, w:  232, h:  152, src: 'sprite/bush2.png' };
    static CACTUS =                 { x:  929, y:  897, w:  235, h:  118, src: 'sprite/cactus.png' };
    static CAR01 =                  { x: 1205, y: 1018, w:   80, h:   56, src: 'sprite/car01.png' };
    static CAR02 =                  { x: 1383, y:  825, w:   80, h:   59, src: 'sprite/car02.png' };
    static CAR03 =                  { x: 1383, y:  760, w:   88, h:   55, src: 'sprite/car03.png' };
    static CAR04 =                  { x: 1383, y:  894, w:   80, h:   57, src: 'sprite/car04.png' };
    static COLUMN =                 { x:  995, y:    5, w:  200, h:  315, src: 'sprite/column.png' };
    static DEAD_TREE1 =             { x:    5, y:  555, w:  135, h:  332, src: 'sprite/dead_tree1.png' };
    static DEAD_TREE2 =             { x: 1205, y:  490, w:  150, h:  260, src: 'sprite/dead_tree2.png' };
    static PALM_TREE =              { x:    5, y:    5, w:  215, h:  540, src: 'sprite/palm_tree.png' };
    static PLAYER_LEFT =            { x:  995, y:  480, w:   80, h:   41, src: 'sprite/player_left.png' };
    static PLAYER_RIGHT =           { x:  995, y:  531, w:   80, h:   41, src: 'sprite/player_right.png' };
    static PLAYER_STRAIGHT =        { x: 1085, y:  480, w:   80, h:   41, src: 'sprite/player_straight.png' };
    static PLAYER_UPHILL_LEFT =     { x: 1383, y:  961, w:   80, h:   45, src: 'sprite/player_uphill_left.png' };
    static PLAYER_UPHILL_RIGHT =    { x: 1385, y: 1018, w:   80, h:   45, src: 'sprite/player_uphill_right.png' };
    static PLAYER_UPHILL_STRAIGHT = { x: 1295, y: 1018, w:   80, h:   45, src: 'sprite/player_uphill_straight.png' };
    static SEMI =                   { x: 1365, y:  490, w:  122, h:  144, src: 'sprite/semi.png' };
    static STUMP =                  { x:  995, y:  330, w:  195, h:  140, src: 'sprite/stump.png' };
    static TREE1 =                  { x:  625, y:    5, w:  360, h:  360, src: 'sprite/tree1.png' };
    static TREE2 =                  { x: 1205, y:    5, w:  282, h:  295, src: 'sprite/tree2.png' };
    static TRUCK =                  { x: 1365, y:  644, w:  100, h:   78, src: 'sprite/truck.png' };

    static HILLS = { x:   5, y:   5, w: 1280, h: 480, src: 'background/hills.png' };
    static SKY   = { x:   5, y: 495, w: 1280, h: 480, src: 'background/sky.png'   };
    static TREES = { x:   5, y: 985, w: 1280, h: 480, src: 'background/trees.png' };

    static SCALE = 0.3 * (1/Sprite.PLAYER_STRAIGHT.w); // the reference sprite width should be 1/3rd the (half-)roadWidth

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
