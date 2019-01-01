
    import * as orts from '..';

    /** ****************************************************************************************************************
    *   Loads and manages all desired images.
    *******************************************************************************************************************/
    export class ImageSystem
    {
        /** All filenames. */
        private     readonly    fileNames           :string[]                   = [];
        /** The callback function that is being invoked when all images are loaded. */
        private     readonly    callback            :()=>void                   = null;

        /** Counts the number of successful loaded images. */
        private                 loadedCount         :number                     = 0;
        /** This array contains all loaded {@link HTMLImageElement} objects, indexed by filename. */
        private                 loadedImages        :HTMLImageElement[]         = [];

        /** ************************************************************************************************************
        *   Creates a new image system.
        *
        *   @param fileNames All filenames to load.
        *   @param callback  The function to invoke when all images are loaded.
        ***************************************************************************************************************/
        public constructor( fileNames:string[], callback:()=>void )
        {
            this.fileNames = fileNames;
            this.callback  = callback;

            this.loadImages();
        }

        /** ************************************************************************************************************
        *   Delivers the image with the specified filename.
        *
        *   @param  id The filename of the image to return.
        *   @return    The image object with the specified filename.
        ***************************************************************************************************************/
        public getImage( id:string ):HTMLImageElement
        {
            return this.loadedImages[ id ];
        }

        /** ************************************************************************************************************
        *   Triggers loading all images. TODO extract to path setting!
        ***************************************************************************************************************/
        private loadImages() : void
        {
            for ( const fileName of this.fileNames )
            {
                this.loadedImages[ fileName ] = this.loadImage( 'res/image/legacy/' + fileName );
            }
        }

        /** ************************************************************************************************************
        *   Loads one single image with the specified filename.
        *
        *   @param  filename The filename of this image to load.
        *   @return          The unloaded image object.
        ***************************************************************************************************************/
        private loadImage( filename:string ):HTMLImageElement
        {
            const img :HTMLImageElement = new Image();
            img.src    = filename;
            img.onload = this.onImageLoaded;

            return img;
        }

        /** ************************************************************************************************************
        *   This function is invoked each time <strong>one</strong> image has been fully loaded.
        ***************************************************************************************************************/
        private onImageLoaded=() :void =>
        {
            ++this.loadedCount;
            orts.Debug.image.log( 'loaded imgage [' + this.loadedCount + '] / [' + this.fileNames.length + ']' );

            if ( this.loadedCount === this.fileNames.length )
            {
                orts.Debug.image.log( 'All images loaded' );

                // invoke callback function when all images are loaded
                this.callback();
            }
        };
    }
