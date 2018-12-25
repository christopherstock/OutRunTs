
    /** ****************************************************************************************************************
    *   Offers additional mathematical functionality.
    *******************************************************************************************************************/
    export class MathUtil
    {
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
    }
