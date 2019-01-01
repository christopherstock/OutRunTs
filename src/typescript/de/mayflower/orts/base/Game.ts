
    import * as orts from '..';

    /** ****************************************************************************************************************
    *   Manages the game logic.
    *
    *   TODO to package 'game'.
    *******************************************************************************************************************/
    export class Game
    {
        /** The key system that manages pressed keys. */
        public              keySystem               :orts.KeySystem             = null;
        /** The canvas system that manages the canvas. */
        public              canvasSystem            :orts.CanvasSystem          = null;
        /** The image system that manages all images. */
        public              imageSystem             :orts.ImageSystem           = null;

        /** ************************************************************************************************************
        *   Inits the game from scratch.
        ***************************************************************************************************************/
        public init() : void
        {
            orts.Debug.init.log( 'Init game engine' );

            orts.Debug.init.log( 'Init key system' );
            this.keySystem = new orts.KeySystem();

            orts.Debug.init.log( 'Init canvas system' );
            this.canvasSystem = new orts.CanvasSystem();
            this.canvasSystem.updateDimensions();

            orts.Debug.init.log( 'Init image system' );
            this.imageSystem = new orts.ImageSystem( orts.ImageFile.FILE_NAMES, this.onImagesLoaded );
        }

        /** ************************************************************************************************************
        *   Being invoked when all images are loaded.
        ***************************************************************************************************************/
        public onImagesLoaded=() : void =>
        {
            orts.Debug.init.log( 'All images loaded successfully' );

            // start legacy game loop
            const outRun:orts.OutRun = new orts.OutRun( this.canvasSystem );
            outRun.reset();
            outRun.start();
        }
    }
