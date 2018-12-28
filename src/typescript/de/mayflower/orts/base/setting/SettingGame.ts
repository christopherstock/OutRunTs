
    import * as orts from '../../index';

    /** ****************************************************************************************************************
    *   Specifies all adjustments for the gameplay.
    *******************************************************************************************************************/
    // tslint:disable:max-line-length
    export class SettingGame
    {
        /** The application title. */
        public  static  readonly    APP_TITLE       :string             = 'OutRun TS';

        public  static  readonly    SPRITE_SCALE    :number             = 0.3 * (1 / 80); // the reference sprite width should be 1/3rd the (half-)roadWidth

        public  static  readonly    BILLBOARDS      :string[]           = [orts.ImageFile.BILLBOARD01, orts.ImageFile.BILLBOARD02, orts.ImageFile.BILLBOARD03, orts.ImageFile.BILLBOARD04, orts.ImageFile.BILLBOARD05, orts.ImageFile.BILLBOARD06, orts.ImageFile.BILLBOARD07, orts.ImageFile.BILLBOARD08, orts.ImageFile.BILLBOARD09];
        public  static  readonly    PLANTS          :string[]           = [orts.ImageFile.TREE1, orts.ImageFile.TREE2, orts.ImageFile.DEAD_TREE1, orts.ImageFile.DEAD_TREE2, orts.ImageFile.PALM_TREE, orts.ImageFile.BUSH1, orts.ImageFile.BUSH2, orts.ImageFile.CACTUS, orts.ImageFile.STUMP, orts.ImageFile.BOULDER1, orts.ImageFile.BOULDER2, orts.ImageFile.BOULDER3];
        public  static  readonly    CARS            :string[]           = [orts.ImageFile.CAR01, orts.ImageFile.CAR02, orts.ImageFile.CAR03, orts.ImageFile.CAR04, orts.ImageFile.SEMI, orts.ImageFile.TRUCK];
    }
