
    import * as bz from '..';

    /** ****************************************************************************************************************
    *   Represents a debug group whose logging can be enabled or disabled.
    *******************************************************************************************************************/
    export class Debug
    {
        /** Debugs startup process. */
        public      static      readonly    acclaim             :Debug              = new Debug( true  );
        /** Debugs initialization process. */
        public      static      readonly    init                :Debug              = new Debug( true  );
        /** Debugs game states. */
        public      static      readonly    game                :Debug              = new Debug( true  );
        /** Debugs canvas setup and resizing. */
        public      static      readonly    canvas              :Debug              = new Debug( false );
        /** Debugs sound system. */
        public      static      readonly    sound               :Debug              = new Debug( false );
        /** Debugs stage system. */
        public      static      readonly    stage               :Debug              = new Debug( true  );
        /** Debugs key system. */
        public      static      readonly    key                 :Debug              = new Debug( false );

        /** Flags if logging for this debug group is enabled. */
        private                 readonly    debugEnabled        :boolean            = false;

        /** ************************************************************************************************************
        *   Constructs a new debug group.
        *
        *   @param debugEnabled Flags if this debug group should log messages.
        ***************************************************************************************************************/
        public constructor( debugEnabled:boolean )
        {
            this.debugEnabled = debugEnabled;
        }

        /** ************************************************************************************************************
        *   Logs a line of output to the default console. Will only generate output
        *   if the debug for this debug group is enabled.
        *
        *   @param msg The message to log to the output console. Defaults to an empty string.
        ***************************************************************************************************************/
        public log( msg:string = '' ) : void
        {
            if ( bz.SettingDebug.DEBUG_MODE && this.debugEnabled )
            {
                // tslint:disable-next-line:no-console
                console.log( '[' + bz.String.getDateTimeString() + '] ' + msg );
            }
        }

        /** ************************************************************************************************************
        *   Logs a line of output to the error console. Will only generate output
        *   if the debug for this debug group is enabled.
        *
        *   @param msg The message to log to the error console. Defaults to an empty string.
        ***************************************************************************************************************/
        public err( msg:string = '' ) : void
        {
            if ( bz.SettingDebug.DEBUG_MODE && this.debugEnabled )
            {
                // tslint:disable-next-line:no-console
                console.error( '[' + bz.String.getDateTimeString() + '] ' + msg );
            }
        }
    }
