
    /** ****************************************************************************************************************
    *   Offers additional mathematical functionality.
    *******************************************************************************************************************/
    export class MathUtil
    {
        /** ************************************************************************************************************
        *   Converts the given number into an integer value.
        *   All decimal places are cut off.
        *
        *   @param num The number to convert to an integer.
        *
        *   @return The converted value as an integer.
        ***************************************************************************************************************/
        public static toInt( num:number ) : number
        {
            return parseInt( String( num ), 10 );
        }

        public static limit( value:number, min:number, max:number ) : number
        {
            return Math.max( min, Math.min( value, max ) );
        }

        /** ************************************************************************************************************
        *   Returns a random integer between the given mininum and maximum.
        *
        *   @param min The minimum value to return by random.
        *   @param max The maximum value to return by random.
        *
        *   @return A random integer in the specified tange.
        ***************************************************************************************************************/
        public static getRandomInt( min:number, max:number ) : number
        {
            return Math.floor( ( Math.random() * ( max + 1 - min ) ) + min );
        }

        public static randomInt( min:number, max:number ) : number
        {
            return Math.round( MathUtil.interpolate( min, max, Math.random() ) );
        }

        public static randomChoice( options:any[] ) : any
        {
            return options[ MathUtil.randomInt( 0, options.length - 1 ) ];
        }

        public static percentRemaining( n:number, total:number ) : number
        {
            return ( ( n % total ) / total );
        }

        public static accelerate( v:number, accel:number, dt:number ) : number
        {
            return v + ( accel * dt );
        }

        public static interpolate( a:number, b:number, percent:number ) : number
        {
            return ( a + ( b - a ) * percent );
        }

        public static easeIn( a:number, b:number, percent:number ) : number
        {
            return ( a + ( b - a ) * Math.pow( percent, 2 ) );
        }

        public static easeInOut( a:number, b:number, percent:number ) : number
        {
            return ( a + ( b - a ) * ( ( -Math.cos( percent * Math.PI ) / 2 ) + 0.5 ) );
        }

        public static exponentialFog( distance:number, density:number ) : number
        {
            return ( 1 / ( Math.pow( Math.E, ( distance * distance * density ) ) ) );
        }

        public static increase( start:number, increment:number, max:number ) : number
        {
            let result:number = start + increment;
            while (result >= max)
                result -= max;
            while (result < 0)
                result += max;

            return result;
        }

        public static project
        (
            p           :any,
            cameraX     :number,
            cameraY     :number,
            cameraZ     :number,
            cameraDepth :number,
            width       :number,
            height      :number,
            roadWidth   :number
        )
        : void
        {
            p.camera.x     = (p.world.x || 0) - cameraX;
            p.camera.y     = (p.world.y || 0) - cameraY;
            p.camera.z     = (p.world.z || 0) - cameraZ;

            p.screen.scale = cameraDepth / p.camera.z;
            p.screen.x     = Math.round( ( width  / 2 ) + ( p.screen.scale * p.camera.x  * width  / 2 ) );
            p.screen.y     = Math.round( ( height / 2 ) - ( p.screen.scale * p.camera.y  * height / 2 ) );
            p.screen.w     = Math.round(                  ( p.screen.scale * roadWidth   * width  / 2 ) );
        }

        public static overlap( x1:number, w1:number, x2:number, w2:number, percent:number ) : boolean
        {
            const half :number = ( percent || 1 ) / 2;
            const min1 :number = x1 - ( w1 * half );
            const max1 :number = x1 + ( w1 * half );
            const min2 :number = x2 - ( w2 * half );
            const max2 :number = x2 + ( w2 * half );

            return ! ( ( max1 < min2 ) || ( min1 > max2 ) );
        }
    }
