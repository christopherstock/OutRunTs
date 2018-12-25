
    /** ****************************************************************************************************************
    *   Offers functionality for the HTML wenpage.
    *******************************************************************************************************************/
    export class HTML
    {
        /** ************************************************************************************************************
        *   Sets the document title.
        *
        *   @param title The title to set.
        ***************************************************************************************************************/
        public static setTitle( title:string ) : void
        {
            document.title = title;
        }

        /** ************************************************************************************************************
        *   Sets the document favicon path.
        *
        *   @param path The path to the favicon.
        ***************************************************************************************************************/
        public static setFavicon( path:string ) : void
        {
            const link:HTMLLinkElement = document.createElement( 'link' );
            link.rel  = 'shortcut icon';
            link.href = path;

            document.head.appendChild( link );
        }
    }
