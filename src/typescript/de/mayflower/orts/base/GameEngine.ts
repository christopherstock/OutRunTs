
    import * as orts from '..';

    /** ****************************************************************************************************************
    *   Manages the game logic.
    *******************************************************************************************************************/
    export class GameEngine
    {
        /** The key system that manages pressed keys. */
        public              keySystem               :orts.KeySystem             = null;

        /** ************************************************************************************************************
        *   Inits the game from scratch.
        ***************************************************************************************************************/
        public init() : void
        {
            orts.Debug.init.log( 'Init game engine' );

            this.keySystem = new orts.KeySystem();
        }
    }
