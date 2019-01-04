
    require( '../css/global.less' );

    import * as orts from '..';

    /** ****************************************************************************************************************
    *   The main class containing the point of entry and a single game instance.
    *
    *   =====================
    *   TODO Primal
    *   =====================
    *   TODO Clear all TODOs.
    *   TODO Add FPS counter via Lib.
    *   TODO Scale canvas to screen size .. update all dimensions on size rechange.
    *
    *   =====================
    *   TODO Secondary - game
    *   =====================
    *   TODO New images and sprites.
    *   TODO New stage system for creating different stages.
    *   TODO Extract level creation to separate Factory / StageBuilder class?
    *   TODO Add sound effects?
    *   TODO Add main menu?
    *******************************************************************************************************************/
    export class Main
    {
        /** The singleton instance of the game. */
        public      static          game                    :orts.Game                  = null;

        /** ************************************************************************************************************
        *   This method is invoked when the application starts.
        ***************************************************************************************************************/
        public static main() : void
        {
            orts.HTML.setTitle( orts.SettingGame.APP_TITLE );
            orts.HTML.setFavicon( 'favicon.ico' );

            Main.acclaim();

            Main.game = new orts.Game();
            Main.game.init();
        }

        /** ************************************************************************************************************
        *   Acclaims the debug console.
        ***************************************************************************************************************/
        private static acclaim() : void
        {
            orts.Debug.acclaim.log( orts.SettingGame.APP_TITLE );

            orts.Debug.acclaim.log( orts.Version.getCurrent() );
            orts.Debug.acclaim.log();
        }
    }
