
    /** ****************************************************************************************************************
    *   The legacy player.
    *******************************************************************************************************************/
    export class Player
    {
        /** player x offset from center of road (-1 to 1 to stay independent of roadWidth) */
        public                  playerX             :number                     = 0;
        /** player relative z distance from camera (computed) */
        public                  playerZ             :number                     = null;
        /** current player speed */
        public                  speed               :number                     = 0;

        // TODO create members and make all fields private!
    }
