
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   The legacy game stage.
    *******************************************************************************************************************/
    export class Stage
    {
        /** array of road segments */
        public                  segments            :any[]                      = [];
        /** array of cars on the road */
        public                  cars                :any[]                      = [];
        /** z length of entire track (computed) */
        public                  trackLength         :number                     = null;

        /** ************************************************************************************************************
        *   TODO to road factory.
        ***************************************************************************************************************/
        private ROAD :any = {
            LENGTH: {NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100},
            HILL: {NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60},
            CURVE: {NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6}
        };

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        public resetRoad( playerZ:number ) : void
        {
            this.segments = [];

            this.addStraight(this.ROAD.LENGTH.SHORT);
            this.addLowRollingHills(0, 0);
            this.addSCurves();
            this.addCurve(this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.MEDIUM, this.ROAD.HILL.LOW);
            this.addBumps();
            this.addLowRollingHills(0, 0);
            this.addCurve(this.ROAD.LENGTH.LONG * 2, this.ROAD.CURVE.MEDIUM, this.ROAD.HILL.MEDIUM);
            this.addStraight(0);
            this.addHill(this.ROAD.LENGTH.MEDIUM, this.ROAD.HILL.HIGH);
            this.addSCurves();
            this.addCurve(this.ROAD.LENGTH.LONG, -this.ROAD.CURVE.MEDIUM, this.ROAD.HILL.NONE);
            this.addHill(this.ROAD.LENGTH.LONG, this.ROAD.HILL.HIGH);
            this.addCurve(this.ROAD.LENGTH.LONG, this.ROAD.CURVE.MEDIUM, -this.ROAD.HILL.LOW);
            this.addBumps();
            this.addHill(this.ROAD.LENGTH.LONG, -this.ROAD.HILL.MEDIUM);
            this.addStraight(0);
            this.addSCurves();
            this.addDownhillToEnd(0);

            this.resetSprites();
            this.resetCars();

            this.segments[this.findSegment(playerZ).index + 2].color = orts.SettingColor.START;
            this.segments[this.findSegment(playerZ).index + 3].color = orts.SettingColor.START;
            for ( let n:number = 0; n < orts.SettingGame.RUMBLE_LENGTH; n++ )
            {
                this.segments[ this.segments.length - 1 - n ].color = orts.SettingColor.FINISH;
            }

            this.trackLength = this.segments.length * orts.SettingGame.SEGMENT_LENGTH;
        }

        /** ************************************************************************************************************
        *   Finds the segment with the specified index.
        *
        *   TODO create class 'segment' !
        ***************************************************************************************************************/
        public findSegment( z:number ) : any
        {
            return this.segments[Math.floor(z / orts.SettingGame.SEGMENT_LENGTH) % this.segments.length];
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addSprite( n:number, source:string, offset:number ) : void
        {
            this.segments[n].sprites.push({source: source, offset: offset});
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addRoad( enter:number, hold:number, leave:number, curve:number, y:number ) : void
        {
            const startY :number = this.lastY();
            const endY   :number = startY + (orts.MathUtil.toInt( y ) * orts.SettingGame.SEGMENT_LENGTH);
            const total  :number = ( enter + hold + leave );

            for ( let n:number = 0; n < enter; n++ )
            {
                this.addSegment
                (
                    orts.MathUtil.easeIn(0, curve, n / enter),
                    orts.MathUtil.easeInOut(startY, endY, n / total)
                );
            }

            for ( let n:number = 0; n < hold; n++ )
            {
                this.addSegment
                (
                    curve,
                    orts.MathUtil.easeInOut(startY, endY, (enter + n) / total)
                );
            }

            for ( let n:number = 0; n < leave; n++ )
            {
                this.addSegment
                (
                    orts.MathUtil.easeInOut(curve, 0, n / leave),
                    orts.MathUtil.easeInOut(startY, endY, (enter + hold + n) / total)
                );
            }
        }

        /** ************************************************************************************************************
        *
        *   @param num The road length?
        *
        *   TODO to stage factory.
        ***************************************************************************************************************/
        private addStraight( num:number ) : void
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            this.addRoad(num, num, num, 0, 0);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addHill( num:number, height:number ) : void
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            height = height || this.ROAD.HILL.MEDIUM;
            this.addRoad(num, num, num, 0, height);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addCurve( num:number, curve:number, height:number ) : void
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            curve = curve || this.ROAD.CURVE.MEDIUM;
            height = height || this.ROAD.HILL.NONE;
            this.addRoad(num, num, num, curve, height);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addLowRollingHills( num:number, height:number ) : void
        {
            num = num || this.ROAD.LENGTH.SHORT;
            height = height || this.ROAD.HILL.LOW;
            this.addRoad(num, num, num, 0, height / 2);
            this.addRoad(num, num, num, 0, -height);
            this.addRoad(num, num, num, this.ROAD.CURVE.EASY, height);
            this.addRoad(num, num, num, 0, 0);
            this.addRoad(num, num, num, -this.ROAD.CURVE.EASY, height / 2);
            this.addRoad(num, num, num, 0, 0);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        // tslint:disable:max-line-length
        private addSCurves() : void
        {
            this.addRoad( this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.EASY,   this.ROAD.HILL.NONE    );
            this.addRoad( this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.MEDIUM,  this.ROAD.HILL.MEDIUM  );
            this.addRoad( this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.EASY,    -this.ROAD.HILL.LOW    );
            this.addRoad( this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.EASY,   this.ROAD.HILL.MEDIUM  );
            this.addRoad( this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.MEDIUM, -this.ROAD.HILL.MEDIUM );
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addBumps() : void
        {
            this.addRoad(10, 10, 10, 0, 5);
            this.addRoad(10, 10, 10, 0, -2);
            this.addRoad(10, 10, 10, 0, -5);
            this.addRoad(10, 10, 10, 0, 8);
            this.addRoad(10, 10, 10, 0, 5);
            this.addRoad(10, 10, 10, 0, -7);
            this.addRoad(10, 10, 10, 0, 5);
            this.addRoad(10, 10, 10, 0, -2);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addDownhillToEnd( num:number ) : void
        {
            num = num || 200;
            this.addRoad(num, num, num, -this.ROAD.CURVE.EASY, -this.lastY() / orts.SettingGame.SEGMENT_LENGTH);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private resetSprites() : void
        {
            this.addSprite(20, orts.ImageFile.BILLBOARD07, -1);
            this.addSprite(40, orts.ImageFile.BILLBOARD06, -1);
            this.addSprite(60, orts.ImageFile.BILLBOARD08, -1);
            this.addSprite(80, orts.ImageFile.BILLBOARD09, -1);
            this.addSprite(100, orts.ImageFile.BILLBOARD01, -1);
            this.addSprite(120, orts.ImageFile.BILLBOARD02, -1);
            this.addSprite(140, orts.ImageFile.BILLBOARD03, -1);
            this.addSprite(160, orts.ImageFile.BILLBOARD04, -1);
            this.addSprite(180, orts.ImageFile.BILLBOARD05, -1);

            this.addSprite(240, orts.ImageFile.BILLBOARD07, -1.2);
            this.addSprite(240, orts.ImageFile.BILLBOARD06, 1.2);
            this.addSprite(this.segments.length - 25, orts.ImageFile.BILLBOARD07, -1.2);
            this.addSprite(this.segments.length - 25, orts.ImageFile.BILLBOARD06, 1.2);

            for ( let n:number = 10; n < 200; n += 4 + Math.floor(n / 100) ) {
                this.addSprite(n, orts.ImageFile.PALM_TREE, 0.5 + Math.random() * 0.5);
                this.addSprite(n, orts.ImageFile.PALM_TREE, 1 + Math.random() * 2);
            }

            for ( let n:number = 250; n < 1000; n += 5 ) {
                this.addSprite(n, orts.ImageFile.COLUMN, 1.1);
                this.addSprite(n + orts.MathUtil.randomInt(0, 5), orts.ImageFile.TREE1, -1 - (Math.random() * 2));
                this.addSprite(n + orts.MathUtil.randomInt(0, 5), orts.ImageFile.TREE2, -1 - (Math.random() * 2));
            }

            for ( let n:number = 200; n < this.segments.length; n += 3 ) {
                this.addSprite(n, orts.MathUtil.randomChoice(orts.SettingGame.PLANTS), orts.MathUtil.randomChoice([1, -1]) * (2 + Math.random() * 5));
            }

            let side   :number = 0;
            let sprite :any    = null;
            let offset :number = 0;

            for ( let n:number = 1000; n < (this.segments.length - 50); n += 100 ) {
                side = orts.MathUtil.randomChoice([1, -1]);
                this.addSprite(n + orts.MathUtil.randomInt(0, 50), orts.MathUtil.randomChoice(orts.SettingGame.BILLBOARDS), -side);
                for ( let i:number = 0; i < 20; i++ ) {
                    sprite = orts.MathUtil.randomChoice(orts.SettingGame.PLANTS);
                    offset = side * (1.5 + Math.random());
                    this.addSprite(n + orts.MathUtil.randomInt(0, 50), sprite, offset);
                }
            }
        }

        /** ************************************************************************************************************
        *   Resets all cars on the road to their initial state.
        ***************************************************************************************************************/
        private resetCars() : void
        {
            this.cars = [];

            let segment :any = null;
            let sprite  :any = null;
            let car     :any = null;

            for ( let n:number = 0; n < orts.SettingGame.TOTAL_CARS; n++ ) {
                const offset :number = Math.random() * orts.MathUtil.randomChoice([-0.8, 0.8]);
                const z      :number = Math.floor(Math.random() * this.segments.length) * orts.SettingGame.SEGMENT_LENGTH;
                sprite = orts.MathUtil.randomChoice(orts.SettingGame.CARS);
                const speed  :number = orts.SettingGame.MAX_SPEED / 4 + Math.random() * orts.SettingGame.MAX_SPEED / (sprite === orts.ImageFile.SEMI ? 4 : 2);
                car = {offset: offset, z: z, sprite: sprite, speed: speed};
                segment = this.findSegment(car.z);
                segment.cars.push(car);
                this.cars.push(car);
            }
        }

        /** ************************************************************************************************************
        *   Adds a road segment.
        *
        *   @param curve Specifies if this segment is a curve?
        *   @param y     The Y location of this segment.
        ***************************************************************************************************************/
        private addSegment( curve:any, y:number ) : void
        {
            const n:number = this.segments.length;
            this.segments.push({
                index: n,
                p1: {world: {y: this.lastY(), z: n * orts.SettingGame.SEGMENT_LENGTH}, camera: {}, screen: {}},
                p2: {world: {y: y, z: (n + 1) * orts.SettingGame.SEGMENT_LENGTH}, camera: {}, screen: {}},
                curve: curve,

                // TODO create class Sprite

                sprites: [],
                cars: [],
                color: Math.floor
                (
                    n / orts.SettingGame.RUMBLE_LENGTH) % 2
                    ? orts.SettingColor.DARK
                    : orts.SettingColor.LIGHT
                }
            );
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private lastY() : number
        {
            return (this.segments.length === 0) ? 0 : this.segments[this.segments.length - 1].p2.world.y;
        }
    }
