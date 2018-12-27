
    require( '../css/global.less' );

    import * as orts from '..';

    /** ****************************************************************************************************************
    *   The main class containing the point of entry and a single game instance.
    *
    *   =====================
    *   TODO Primal
    *   =====================
    *   TODO Remove image loading system and replace by own implementation.
    *   TODO Remove single sprite sheet.
    *   TODO Remove legacy sprite system.
    *   TODO Move to classes.
    *******************************************************************************************************************/
    export class Main
    {
        /** The singleton instance of the game. */
        public      static          game                    :orts.GameEngine                = null;

        /** The singleton instance of the legacy game. */
        public      static          legacyGame              :orts.Game                      = null;

        /** ************************************************************************************************************
        *   This method is invoked when the application starts.
        ***************************************************************************************************************/
        public static main() : void
        {
            orts.HTML.setTitle( orts.SettingGame.APP_TITLE );
            orts.HTML.setFavicon( 'favicon.ico' );

            Main.acclaim();

            Main.game = new orts.GameEngine();
            Main.game.init();


            // start legacy game loop
            Main.legacyGame = new orts.Game();
            Main.legacyGame.run();
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
