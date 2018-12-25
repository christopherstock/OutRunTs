
    require( '../css/global.less' );

    import * as orts from '..';

    /** ****************************************************************************************************************
    *   The main class containing the point of entry and a single game instance.
    *
    *   =====================
    *   TODO Primal
    *   =====================
    *
     *  TODO Remove single sprite sheet.
     *  TODO Move to TS.
     *  TODO Move to Node.js framework and package.json.
     *  TODO Move to classes.    *
    *
    *******************************************************************************************************************/
    export class Main
    {
        /** The singleton instance of the game. */
//        public      static          game                    :bz.Game                    = null;

        /** ************************************************************************************************************
        *   This method is invoked when the application starts.
        ***************************************************************************************************************/
        public static main() : void
        {
            orts.HTML.setTitle( orts.SettingGame.APP_TITLE );
            orts.HTML.setFavicon( 'favicon.ico' );

            Main.acclaim();
/*
            Main.game = new bz.Game();
            Main.game.init();
*/
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
