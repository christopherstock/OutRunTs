
    import * as orts from '..';

    /** ****************************************************************************************************************
    *   Manages the game logic.
    *******************************************************************************************************************/
    export class GameEngine
    {
        /** The key system that manages pressed keys. */
        public              keySystem               :orts.KeySystem             = null;
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

            orts.Debug.init.log( 'Init image system' );
            this.imageSystem = new orts.ImageSystem( orts.ImageFile.FILE_NAMES, this.onImagesLoaded );
        }

        /** ************************************************************************************************************
        *   Being invoked when all images are loaded.
        ***************************************************************************************************************/
        public onImagesLoaded() : void
        {
            orts.Debug.init.log( 'All images loaded successfully' );

            // start legacy game loop
            orts.Main.legacyGame = new orts.Game();
            orts.Main.legacyGame.run();
        }
    }
