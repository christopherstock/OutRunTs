
export class Sprite
{
    static BILLBOARD01 :string =            'sprite/billboard01.png' ;
    static BILLBOARD02 :string =            'sprite/billboard02.png' ;
    static BILLBOARD03 :string =            'sprite/billboard03.png' ;
    static BILLBOARD04 :string =            'sprite/billboard04.png' ;
    static BILLBOARD05 :string =            'sprite/billboard05.png' ;
    static BILLBOARD06 :string =            'sprite/billboard06.png' ;
    static BILLBOARD07 :string =            'sprite/billboard07.png' ;
    static BILLBOARD08 :string =            'sprite/billboard08.png' ;
    static BILLBOARD09 :string =            'sprite/billboard09.png' ;
    static BOULDER1 :string =               'sprite/boulder1.png' ;
    static BOULDER2 :string =               'sprite/boulder2.png' ;
    static BOULDER3 :string =               'sprite/boulder3.png' ;
    static BUSH1 :string =                  'sprite/bush1.png' ;
    static BUSH2 :string =                  'sprite/bush2.png' ;
    static CACTUS :string =                 'sprite/cactus.png' ;
    static CAR01 :string =                  'sprite/car01.png' ;
    static CAR02 :string =                  'sprite/car02.png' ;
    static CAR03 :string =                  'sprite/car03.png' ;
    static CAR04 :string =                  'sprite/car04.png' ;
    static COLUMN :string =                 'sprite/column.png' ;
    static DEAD_TREE1 :string =             'sprite/dead_tree1.png' ;
    static DEAD_TREE2 :string =             'sprite/dead_tree2.png' ;
    static PALM_TREE :string =              'sprite/palm_tree.png' ;
    static PLAYER_LEFT :string =            'sprite/player_left.png' ;
    static PLAYER_RIGHT :string =           'sprite/player_right.png' ;
    static PLAYER_STRAIGHT :string =        'sprite/player_straight.png' ;
    static PLAYER_UPHILL_LEFT :string =     'sprite/player_uphill_left.png' ;
    static PLAYER_UPHILL_RIGHT :string =    'sprite/player_uphill_right.png' ;
    static PLAYER_UPHILL_STRAIGHT :string = 'sprite/player_uphill_straight.png' ;
    static SEMI :string =                   'sprite/semi.png' ;
    static STUMP :string =                  'sprite/stump.png' ;
    static TREE1 :string =                  'sprite/tree1.png' ;
    static TREE2 :string =                  'sprite/tree2.png' ;
    static TRUCK :string =                  'sprite/truck.png' ;
    static HILLS :string =                  'background/hills.png' ;
    static SKY   :string =                  'background/sky.png'   ;
    static TREES :string =                  'background/trees.png' ;

    static SCALE :number = 0.3 * (1 / 80); // the reference sprite width should be 1/3rd the (half-)roadWidth

    static BILLBOARDS :string[] = [Sprite.BILLBOARD01, Sprite.BILLBOARD02, Sprite.BILLBOARD03, Sprite.BILLBOARD04, Sprite.BILLBOARD05, Sprite.BILLBOARD06, Sprite.BILLBOARD07, Sprite.BILLBOARD08, Sprite.BILLBOARD09];
    static PLANTS     :string[] = [Sprite.TREE1, Sprite.TREE2, Sprite.DEAD_TREE1, Sprite.DEAD_TREE2, Sprite.PALM_TREE, Sprite.BUSH1, Sprite.BUSH2, Sprite.CACTUS, Sprite.STUMP, Sprite.BOULDER1, Sprite.BOULDER2, Sprite.BOULDER3];
    static CARS       :string[] = [Sprite.CAR01, Sprite.CAR02, Sprite.CAR03, Sprite.CAR04, Sprite.SEMI, Sprite.TRUCK];

    static ALL :string[] = [
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
