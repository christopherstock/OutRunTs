
    /** ****************************************************************************************************************
    *   Contains the project history with all current and completed version information.
    *******************************************************************************************************************/
    // tslint:disable:max-line-length
    export class Version
    {
        /** The project's version v.0.0.1. */
        private     static  readonly    V_0_0_1                 :Version            = new Version( '0.0.1', 'OutRunJS', '25.12.2018, 14:29:31 GMT+1' );

        /** The project's current version. */
        private     static  readonly    CURRENT_VERSION         :Version            = Version.V_0_0_1;

        /** This version's specifier. */
        private             readonly    version                 :string             = null;
        /** This version's internal codename. */
        private             readonly    codename                :string             = null;
        /** This version's completion date. */
        private             readonly    date                    :string             = null;

        /** ************************************************************************************************************
        *   Creates a project version.
        *
        *   @param version      The version specifier.
        *   @param codename     The internal codename.
        *   @param date         The completion date.
        ***************************************************************************************************************/
        private constructor( version:string, codename:string, date:string )
        {
            this.version  = version;
            this.codename = codename;
            this.date     = date;
        }

        /** ************************************************************************************************************
        *   Returns a representation of the current project version and it's date.
        *
        *   @return A representation of the current project's version with it's timestamp.
        ***************************************************************************************************************/
        public static getCurrent() : string
        {
            return ( 'v. ' + Version.CURRENT_VERSION.version + ' ' + Version.CURRENT_VERSION.codename );
        }
    }
