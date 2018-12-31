
    import * as orts from '../../index';

    /** ****************************************************************************************************************
    *   Specifies all adjustments for the gameplay.
    *******************************************************************************************************************/
    // tslint:disable:max-line-length
    export class SettingGame
    {
        /** The application title. */
        public  static  readonly    APP_TITLE                   :string             = 'OutRun TS';

        public  static  readonly    SPRITE_SCALE                :number             = 0.3 * (1 / 80); // the reference sprite width should be 1/3rd the (half-)roadWidth

        public  static  readonly    BILLBOARDS                  :string[]           = [orts.ImageFile.BILLBOARD01, orts.ImageFile.BILLBOARD02, orts.ImageFile.BILLBOARD03, orts.ImageFile.BILLBOARD04, orts.ImageFile.BILLBOARD05, orts.ImageFile.BILLBOARD06, orts.ImageFile.BILLBOARD07, orts.ImageFile.BILLBOARD08, orts.ImageFile.BILLBOARD09];
        public  static  readonly    PLANTS                      :string[]           = [orts.ImageFile.TREE1, orts.ImageFile.TREE2, orts.ImageFile.DEAD_TREE1, orts.ImageFile.DEAD_TREE2, orts.ImageFile.PALM_TREE, orts.ImageFile.BUSH1, orts.ImageFile.BUSH2, orts.ImageFile.CACTUS, orts.ImageFile.STUMP, orts.ImageFile.BOULDER1, orts.ImageFile.BOULDER2, orts.ImageFile.BOULDER3];
        public  static  readonly    CARS                        :string[]           = [orts.ImageFile.CAR01, orts.ImageFile.CAR02, orts.ImageFile.CAR03, orts.ImageFile.CAR04, orts.ImageFile.SEMI, orts.ImageFile.TRUCK];

        public  static  readonly    CANVAS_WIDTH                :number             = 640;
        public  static  readonly    CANVAS_HEIGHT               :number             = 480;

        /** how many 'update' frames per second */
        public  static  readonly    FPS                         :number             = 60;
        /** how long is each frame (in seconds) */
        public  static  readonly    STEP                        :number             = 1 / SettingGame.FPS;
        /** centrifugal force multiplier when going around curves */
        public  static  readonly    CENTRIFUGAL                 :number             = 0.3;
        /** background sky layer scroll speed when going around curve (or up hill) */
        public  static  readonly    SKY_SPEED                   :number             = 0.001;
        /** background hill layer scroll speed when going around curve (or up hill) */
        public  static  readonly    HILL_SPEED                  :number             = 0.002;
        /** background tree layer scroll speed when going around curve (or up hill) */
        public  static  readonly    TREE_SPEED                  :number             = 0.003;
        /** actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth */
        public  static  readonly    ROAD_WIDTH                  :number             = 2000;
        /** length of a single segment */
        public  static  readonly    SEGMENT_LENGTH              :number             = 200;
        /** number of segments per red/white rumble strip */
        public  static  readonly    RUMBLE_LENGTH               :number             = 3;
        /** number of lanes */
        public  static  readonly    LANES                       :number             = 4;
        /** angle (degrees) for field of view */
        public  static  readonly    FIELD_OF_VIEW               :number             = 100;
        /** z height of camera */
        public  static  readonly    CAMERA_HEIGHT               :number             = 1000;
        /** number of segments to draw */
        public  static  readonly    DRAW_DISTANCE               :number             = 300;
        /** exponential fog density */
        public  static  readonly    FOG_DENSITY                 :number             = 5;
        /** top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier) */
        public  static  readonly    MAX_SPEED                   :number             = SettingGame.SEGMENT_LENGTH / SettingGame.STEP;
        /** acceleration rate - tuned until it 'felt' right */
        public  static  readonly    ACCELERATION_RATE           :number             = SettingGame.MAX_SPEED / 5;
        /** deceleration rate when braking */
        public  static  readonly    BREAKING_RATE               :number             = -SettingGame.MAX_SPEED;
        /** 'natural' deceleration rate when neither accelerating, nor braking */
        public  static  readonly    NATURAL_DECELERATION_RATE   :number             = -SettingGame.MAX_SPEED / 5;
        /** speed multiploier for off road - off road deceleration is somewhere in between */
        public  static  readonly    OFF_ROAD_DECELERATION       :number             = -SettingGame.MAX_SPEED / 2;
        /** limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road) */
        public  static  readonly    OFF_ROAD_LIMIT              :number             = SettingGame.MAX_SPEED / 4;
        /** total number of cars on the road */
        public  static  readonly    TOTAL_CARS                  :number             = 200;
    }
