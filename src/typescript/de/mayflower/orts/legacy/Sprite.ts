
export const SPRITES:any =
{
    BILLBOARD01:            { x:  625, y:  375, w:  300, h:  170, src: 'sprite/billboard01.png' },
    BILLBOARD02:            { x:  245, y: 1262, w:  215, h:  220, src: 'sprite/billboard02.png' },
    BILLBOARD03:            { x:    5, y: 1262, w:  230, h:  220, src: 'sprite/billboard03.png' },
    BILLBOARD04:            { x: 1205, y:  310, w:  268, h:  170, src: 'sprite/billboard04.png' },
    BILLBOARD05:            { x:    5, y:  897, w:  298, h:  190, src: 'sprite/billboard05.png' },
    BILLBOARD06:            { x:  488, y:  555, w:  298, h:  190, src: 'sprite/billboard06.png' },
    BILLBOARD07:            { x:  313, y:  897, w:  298, h:  190, src: 'sprite/billboard07.png' },
    BILLBOARD08:            { x:  230, y:    5, w:  385, h:  265, src: 'sprite/billboard08.png' },
    BILLBOARD09:            { x:  150, y:  555, w:  328, h:  282, src: 'sprite/billboard09.png' },
    BOULDER1:               { x: 1205, y:  760, w:  168, h:  248, src: 'sprite/boulder1.png' },
    BOULDER2:               { x:  621, y:  897, w:  298, h:  140, src: 'sprite/boulder2.png' },
    BOULDER3:               { x:  230, y:  280, w:  320, h:  220, src: 'sprite/boulder3.png' },
    BUSH1:                  { x:    5, y: 1097, w:  240, h:  155, src: 'sprite/bush1.png' },
    BUSH2:                  { x:  255, y: 1097, w:  232, h:  152, src: 'sprite/bush2.png' },
    CACTUS:                 { x:  929, y:  897, w:  235, h:  118, src: 'sprite/cactus.png' },
    CAR01:                  { x: 1205, y: 1018, w:   80, h:   56, src: 'sprite/car01.png' },
    CAR02:                  { x: 1383, y:  825, w:   80, h:   59, src: 'sprite/car02.png' },
    CAR03:                  { x: 1383, y:  760, w:   88, h:   55, src: 'sprite/car03.png' },
    CAR04:                  { x: 1383, y:  894, w:   80, h:   57, src: 'sprite/car04.png' },
    COLUMN:                 { x:  995, y:    5, w:  200, h:  315, src: 'sprite/column.png' },
    DEAD_TREE1:             { x:    5, y:  555, w:  135, h:  332, src: 'sprite/dead_tree1.png' },
    DEAD_TREE2:             { x: 1205, y:  490, w:  150, h:  260, src: 'sprite/dead_tree2.png' },
    PALM_TREE:              { x:    5, y:    5, w:  215, h:  540, src: 'sprite/palm_tree.png' },
    PLAYER_LEFT:            { x:  995, y:  480, w:   80, h:   41, src: 'sprite/player_left.png' },
    PLAYER_RIGHT:           { x:  995, y:  531, w:   80, h:   41, src: 'sprite/player_right.png' },
    PLAYER_STRAIGHT:        { x: 1085, y:  480, w:   80, h:   41, src: 'sprite/player_straight.png' },
    PLAYER_UPHILL_LEFT:     { x: 1383, y:  961, w:   80, h:   45, src: 'sprite/player_uphill_left.png' },
    PLAYER_UPHILL_RIGHT:    { x: 1385, y: 1018, w:   80, h:   45, src: 'sprite/player_uphill_right.png' },
    PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w:   80, h:   45, src: 'sprite/player_uphill_straight.png' },
    SEMI:                   { x: 1365, y:  490, w:  122, h:  144, src: 'sprite/semi.png' },
    STUMP:                  { x:  995, y:  330, w:  195, h:  140, src: 'sprite/stump.png' },
    TREE1:                  { x:  625, y:    5, w:  360, h:  360, src: 'sprite/tree1.png' },
    TREE2:                  { x: 1205, y:    5, w:  282, h:  295, src: 'sprite/tree2.png' },
    TRUCK:                  { x: 1365, y:  644, w:  100, h:   78, src: 'sprite/truck.png' },
};

SPRITES.SCALE = 0.3 * (1/SPRITES.PLAYER_STRAIGHT.w); // the reference sprite width should be 1/3rd the (half-)roadWidth

SPRITES.BILLBOARDS = [SPRITES.BILLBOARD01, SPRITES.BILLBOARD02, SPRITES.BILLBOARD03, SPRITES.BILLBOARD04, SPRITES.BILLBOARD05, SPRITES.BILLBOARD06, SPRITES.BILLBOARD07, SPRITES.BILLBOARD08, SPRITES.BILLBOARD09];
SPRITES.PLANTS     = [SPRITES.TREE1, SPRITES.TREE2, SPRITES.DEAD_TREE1, SPRITES.DEAD_TREE2, SPRITES.PALM_TREE, SPRITES.BUSH1, SPRITES.BUSH2, SPRITES.CACTUS, SPRITES.STUMP, SPRITES.BOULDER1, SPRITES.BOULDER2, SPRITES.BOULDER3];
SPRITES.CARS       = [SPRITES.CAR01, SPRITES.CAR02, SPRITES.CAR03, SPRITES.CAR04, SPRITES.SEMI, SPRITES.TRUCK];
