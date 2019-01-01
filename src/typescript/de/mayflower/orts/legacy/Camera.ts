
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   The legacy camera.
    *******************************************************************************************************************/
    export class Camera
    {
        /** z distance camera is from screen (computed) */
        private     readonly    depth               :number                     = null;
        /** current camera Z position (add playerZ to get player's absolute Z position) */
        private                 z                   :number                     = 0;

        public constructor()
        {
            this.depth = ( 1 / Math.tan( ( orts.SettingGame.FIELD_OF_VIEW / 2 ) * Math.PI / 180 ) );
        }

        public getDepth() : number
        {
            return this.depth;
        }

        public getZ() : number
        {
            return this.z;
        }

        public setZ( z:number ) : void
        {
            this.z = z;
        }
    }
