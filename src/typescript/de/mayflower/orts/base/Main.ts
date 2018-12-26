
    require( '../css/global.less' );

    import * as orts from '..';

    /** ****************************************************************************************************************
    *   The main class containing the point of entry and a single game instance.
    *
    *   =====================
    *   TODO Primal
    *   =====================
    *   TODO Remove single sprite sheet.
    *   TODO Remove legacy sprite system.
    *   TODO Move to classes.
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

//            require( '../legacy/index.ts' );




            //=========================================================================
            // specify and start THE GAME LOOP
            //=========================================================================

            const outRun :orts.OutRun = new orts.OutRun();

            orts.Game.run({
                canvas: outRun.canvas, render: outRun.render, update: outRun.update, step: outRun.step,
                images: ["background", "sprites"],
                keys: [
                    { keys: [orts.KEY.LEFT,  orts.KEY.A], mode: 'down', action: () => { outRun.keyLeft   = true;  } },
                    { keys: [orts.KEY.RIGHT, orts.KEY.D], mode: 'down', action: () => { outRun.keyRight  = true;  } },
                    { keys: [orts.KEY.UP,    orts.KEY.W], mode: 'down', action: () => { outRun.keyFaster = true;  } },
                    { keys: [orts.KEY.DOWN,  orts.KEY.S], mode: 'down', action: () => { outRun.keySlower = true;  } },
                    { keys: [orts.KEY.LEFT,  orts.KEY.A], mode: 'up',   action: () => { outRun.keyLeft   = false; } },
                    { keys: [orts.KEY.RIGHT, orts.KEY.D], mode: 'up',   action: () => { outRun.keyRight  = false; } },
                    { keys: [orts.KEY.UP,    orts.KEY.W], mode: 'up',   action: () => { outRun.keyFaster = false; } },
                    { keys: [orts.KEY.DOWN,  orts.KEY.S], mode: 'up',   action: () => { outRun.keySlower = false; } }
                ],
                ready: (images) => {
                    outRun.background = images[0];
                    outRun.sprites    = images[1];
                    outRun.reset({});
                }
            });
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
