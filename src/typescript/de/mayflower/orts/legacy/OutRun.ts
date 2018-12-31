
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   The main legacy game engine.
    *******************************************************************************************************************/
    // tslint:disable:max-line-length
    export class OutRun
    {
        /** The 2D drawing context for the canvas. */
        private     readonly    ctx                 :CanvasRenderingContext2D   = null;

        /** logical canvas width */
        private                 width               :number                     = 1024;
        /** logical canvas height */
        private                 height              :number                     = 768;
        /** current sky scroll offset */
        private                 skyOffset           :number                     = 0;
        /** current hill scroll offset */
        private                 hillOffset          :number                     = 0;
        /** current tree scroll offset */
        private                 treeOffset          :number                     = 0;
        /** array of road segments */
        private                 segments            :any[]                      = [];
        /** array of cars on the road */
        private                 cars                :any[]                      = [];
        /** scaling factor to provide resolution independence (computed) */
        private                 resolution          :number                     = null;
        /** z length of entire track (computed) */
        private                 trackLength         :number                     = null;
        /** z distance camera is from screen (computed) */
        private                 cameraDepth         :number                     = null;
        /** player x offset from center of road (-1 to 1 to stay independent of roadWidth) */
        private                 playerX             :number                     = 0;
        /** player relative z distance from camera (computed) */
        private                 playerZ             :number                     = null;
        /** current camera Z position (add playerZ to get player's absolute Z position) */
        private                 position            :number                     = 0;
        /** current speed */
        private                 speed               :number                     = 0;

        /** Indicates if the 'steer left' key is pressed this game tick. */
        private                 keyLeft             :boolean                    = false;
        /** Indicates if the 'steer right' key is pressed this game tick. */
        private                 keyRight            :boolean                    = false;
        /** Indicates if the 'faster' key is pressed this game tick. */
        private                 keyFaster           :boolean                    = false;
        /** Indicates if the 'slower' key is pressed this game tick. */
        private                 keySlower           :boolean                    = false;

        /** ************************************************************************************************************
        *   Creates a new legacy game system.
        *
        *   @param ctx The canvas context to draw onto.
        ***************************************************************************************************************/
        public constructor( ctx:CanvasRenderingContext2D )
        {
            this.ctx = ctx;
        }

        /** ************************************************************************************************************
        *   Resets the legacy game to its initial defaults.
        ***************************************************************************************************************/
        public reset() : void
        {
            this.cameraDepth = 1 / Math.tan((orts.SettingGame.FIELD_OF_VIEW / 2) * Math.PI / 180);
            this.playerZ = (orts.SettingGame.CAMERA_HEIGHT * this.cameraDepth);

            this.width = orts.Main.game.canvasSystem.getWidth();
            this.height = orts.Main.game.canvasSystem.getHeight();

            this.resolution = this.height / 480;

            if ((this.segments.length === 0))
                this.resetRoad(); // only rebuild road when necessary
        };

        /** ************************************************************************************************************
        *   Starts the legacy game.
        ***************************************************************************************************************/
        public start() : void
        {
            /*
                        const frame:()=>void = (): void =>
                        {
                            this.update( this.STEP );
                            this.render();

                            requestAnimationFrame( frame );
                        };
                        frame();
            */

            let now  :number = null;
            let last :number = new Date().getTime();
            let dt   :number = 0;
            let gdt  :number = 0;

            const frame :()=>void = ():void =>
            {
                now = new Date().getTime();

                // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
                dt = Math.min(1, (now - last) / 1000);

                gdt = gdt + dt;
                while (gdt > orts.SettingGame.STEP) {
                    gdt = gdt - orts.SettingGame.STEP;
                    this.update(orts.SettingGame.STEP);
                }
                this.render();
                last = now;
                requestAnimationFrame( frame );
            };
            frame(); // lets get this party started
        };

        /** ************************************************************************************************************
        *   Updates the game world.
        *
        *   @param dt The delta time to update the game.
        ***************************************************************************************************************/
        private update( dt )
        {
            var n, car, carW, sprite, spriteW;
            var playerSegment = this.findSegment(this.position + this.playerZ);
            var playerW = 80 * orts.SettingGame.SPRITE_SCALE;
            var speedPercent = this.speed / orts.SettingGame.MAX_SPEED;
            var dx = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
            var startPosition = this.position;

            this.updateCars(dt, playerSegment, playerW);

            this.position = orts.MathUtil.increase(this.position, dt * this.speed, this.trackLength);

            // check pressed keys
            this.keyLeft = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_LEFT);
            this.keyRight = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_RIGHT);
            this.keyFaster = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_UP);
            this.keySlower = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_DOWN);

            if (this.keyLeft)
                this.playerX = this.playerX - dx;
            else if (this.keyRight)
                this.playerX = this.playerX + dx;

            this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * orts.SettingGame.CENTRIFUGAL);

            if (this.keyFaster)
                this.speed = orts.MathUtil.accelerate(this.speed, orts.SettingGame.ACCELERATION_RATE, dt);
            else if (this.keySlower)
                this.speed = orts.MathUtil.accelerate(this.speed, orts.SettingGame.BREAKING_RATE, dt);
            else
                this.speed = orts.MathUtil.accelerate(this.speed, orts.SettingGame.NATURAL_DECELERATION_RATE, dt);


            if ((this.playerX < -1) || (this.playerX > 1)) {

                if (this.speed > orts.SettingGame.OFF_ROAD_LIMIT)
                    this.speed = orts.MathUtil.accelerate(this.speed, orts.SettingGame.OFF_ROAD_DECELERATION, dt);

                for (n = 0; n < playerSegment.sprites.length; n++) {
                    sprite = playerSegment.sprites[n];
                    spriteW = orts.Main.game.imageSystem.getImage(sprite.source).width * orts.SettingGame.SPRITE_SCALE;

                    if (orts.MathUtil.overlap(this.playerX, playerW, sprite.offset + spriteW / 2 * (sprite.offset > 0 ? 1 : -1), spriteW, 0)) {
                        this.speed = orts.SettingGame.MAX_SPEED / 5;
                        this.position = orts.MathUtil.increase(playerSegment.p1.world.z, -this.playerZ, this.trackLength); // stop in front of sprite (at front of segment)
                        break;
                    }
                }
            }

            for (n = 0; n < playerSegment.cars.length; n++) {
                car = playerSegment.cars[n];
                carW = orts.Main.game.imageSystem.getImage(car.sprite).width * orts.SettingGame.SPRITE_SCALE;
                if (this.speed > car.speed) {
                    if (orts.MathUtil.overlap(this.playerX, playerW, car.offset, carW, 0.8)) {
                        this.speed = car.speed * (car.speed / this.speed);
                        this.position = orts.MathUtil.increase(car.z, -this.playerZ, this.trackLength);
                        break;
                    }
                }
            }

            this.playerX = orts.MathUtil.limit(this.playerX, -3, 3);     // dont ever let it go too far out of bounds
            this.speed = orts.MathUtil.limit(this.speed, 0, orts.SettingGame.MAX_SPEED); // or exceed maxSpeed

            this.skyOffset = orts.MathUtil.increase(this.skyOffset, orts.SettingGame.SKY_SPEED * playerSegment.curve * (this.position - startPosition) / orts.SettingGame.SEGMENT_LENGTH, 1);
            this.hillOffset = orts.MathUtil.increase(this.hillOffset, orts.SettingGame.HILL_SPEED * playerSegment.curve * (this.position - startPosition) / orts.SettingGame.SEGMENT_LENGTH, 1);
            this.treeOffset = orts.MathUtil.increase(this.treeOffset, orts.SettingGame.TREE_SPEED * playerSegment.curve * (this.position - startPosition) / orts.SettingGame.SEGMENT_LENGTH, 1);
        }

        /** ************************************************************************************************************
        *   Updates the cars in the game world.
        *
        *   @param dt The delta time to update the game.
        ***************************************************************************************************************/
        private updateCars( dt, playerSegment, playerW )
        {
            var n, car, oldSegment, newSegment;
            for (n = 0; n < this.cars.length; n++) {
                car = this.cars[n];
                oldSegment = this.findSegment(car.z);
                car.offset = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerW);
                car.z = orts.MathUtil.increase(car.z, dt * car.speed, this.trackLength);
                car.percent = orts.MathUtil.percentRemaining(car.z, orts.SettingGame.SEGMENT_LENGTH); // useful for interpolation during rendering phase
                newSegment = this.findSegment(car.z);
                if (oldSegment !== newSegment) {
                    var index = oldSegment.cars.indexOf(car);
                    oldSegment.cars.splice(index, 1);
                    newSegment.cars.push(car);
                }
            }
        }

        /** ************************************************************************************************************
        *   Updates the offset for the player car.
        ***************************************************************************************************************/
        private updateCarOffset( car, carSegment, playerSegment, playerW )
        {
            var i, j, dir, segment, otherCar, otherCarW, lookahead = 20,
                carW = orts.Main.game.imageSystem.getImage(car.sprite).width * orts.SettingGame.SPRITE_SCALE;

            // optimization, dont bother steering around other cars when 'out of sight' of the player
            if ((carSegment.index - playerSegment.index) > orts.SettingGame.DRAW_DISTANCE)
                return 0;

            for (i = 1; i < lookahead; i++) {
                segment = this.segments[(carSegment.index + i) % this.segments.length];

                if ((segment === playerSegment) && (car.speed > this.speed) && (orts.MathUtil.overlap(this.playerX, playerW, car.offset, carW, 1.2))) {
                    if (this.playerX > 0.5)
                        dir = -1;
                    else if (this.playerX < -0.5)
                        dir = 1;
                    else
                        dir = (car.offset > this.playerX) ? 1 : -1;
                    return dir * 1 / i * (car.speed - this.speed) / orts.SettingGame.MAX_SPEED; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
                }

                for (j = 0; j < segment.cars.length; j++) {
                    otherCar = segment.cars[j];
                    otherCarW = orts.Main.game.imageSystem.getImage(otherCar.sprite).width * orts.SettingGame.SPRITE_SCALE;
                    if ((car.speed > otherCar.speed) && orts.MathUtil.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
                        if (otherCar.offset > 0.5)
                            dir = -1;
                        else if (otherCar.offset < -0.5)
                            dir = 1;
                        else
                            dir = (car.offset > otherCar.offset) ? 1 : -1;
                        return dir * 1 / i * (car.speed - otherCar.speed) / orts.SettingGame.MAX_SPEED;
                    }
                }
            }

            // if no cars ahead, but I have somehow ended up off road, then steer back on
            if (car.offset < -0.9)
                return 0.1;
            else if (car.offset > 0.9)
                return -0.1;
            else
                return 0;
        };

        /** ************************************************************************************************************
        *   Renders the current tick of the legacy game.
        ***************************************************************************************************************/
        private render()
        {
            var baseSegment = this.findSegment(this.position);
            var basePercent = orts.MathUtil.percentRemaining(this.position, orts.SettingGame.SEGMENT_LENGTH);
            var playerSegment = this.findSegment(this.position + this.playerZ);
            var playerPercent = orts.MathUtil.percentRemaining(this.position + this.playerZ, orts.SettingGame.SEGMENT_LENGTH);
            var playerY = orts.MathUtil.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
            var maxy = this.height;

            var x = 0;
            var dx = -(baseSegment.curve * basePercent);

            // clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);

            // fill canvas with sky color
            orts.Drawing2D.rect(this.ctx, 0, 0, this.width, this.height, orts.SettingColor.SKY);

            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.SKY, this.skyOffset, this.resolution * orts.SettingGame.SKY_SPEED * playerY);
            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.HILLS, this.hillOffset, this.resolution * orts.SettingGame.HILL_SPEED * playerY);
            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.TREES, this.treeOffset, this.resolution * orts.SettingGame.TREE_SPEED * playerY);

            var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;

            for (n = 0; n < orts.SettingGame.DRAW_DISTANCE; n++) {

                segment = this.segments[(baseSegment.index + n) % this.segments.length];
                segment.looped = segment.index < baseSegment.index;
                segment.fog = orts.MathUtil.exponentialFog(n / orts.SettingGame.DRAW_DISTANCE, orts.SettingGame.FOG_DENSITY);
                segment.clip = maxy;

                orts.MathUtil.project(segment.p1, (this.playerX * orts.SettingGame.ROAD_WIDTH) - x, playerY + orts.SettingGame.CAMERA_HEIGHT, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, orts.SettingGame.ROAD_WIDTH);
                orts.MathUtil.project(segment.p2, (this.playerX * orts.SettingGame.ROAD_WIDTH) - x - dx, playerY + orts.SettingGame.CAMERA_HEIGHT, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, orts.SettingGame.ROAD_WIDTH);

                x = x + dx;
                dx = dx + segment.curve;

                if ((segment.p1.camera.z <= this.cameraDepth) || // behind us
                    (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
                    (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
                    continue;

                orts.Drawing2D.segment(this.ctx, this.width, orts.SettingGame.LANES,
                    segment.p1.screen.x,
                    segment.p1.screen.y,
                    segment.p1.screen.w,
                    segment.p2.screen.x,
                    segment.p2.screen.y,
                    segment.p2.screen.w,
                    segment.fog,
                    segment.color);

                maxy = segment.p1.screen.y;
            }

            for (n = (orts.SettingGame.DRAW_DISTANCE - 1); n > 0; n--) {
                segment = this.segments[(baseSegment.index + n) % this.segments.length];

                for (i = 0; i < segment.cars.length; i++) {
                    car = segment.cars[i];
                    sprite = car.sprite;
                    spriteScale = orts.MathUtil.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
                    spriteX = orts.MathUtil.interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + (spriteScale * car.offset * orts.SettingGame.ROAD_WIDTH * this.width / 2);
                    spriteY = orts.MathUtil.interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent);
                    orts.Drawing2D.sprite(this.ctx, this.width, this.height, this.resolution, orts.SettingGame.ROAD_WIDTH, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
                }

                for (i = 0; i < segment.sprites.length; i++) {
                    sprite = segment.sprites[i];
                    spriteScale = segment.p1.screen.scale;
                    spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * orts.SettingGame.ROAD_WIDTH * this.width / 2);
                    spriteY = segment.p1.screen.y;
                    orts.Drawing2D.sprite(this.ctx, this.width, this.height, this.resolution, orts.SettingGame.ROAD_WIDTH, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
                }

                if (segment === playerSegment) {
                    orts.Drawing2D.player(this.ctx, this.width, this.height, this.resolution, orts.SettingGame.ROAD_WIDTH, this.speed / orts.SettingGame.MAX_SPEED,
                        this.cameraDepth / this.playerZ,
                        this.width / 2,
                        (this.height / 2) - (this.cameraDepth / this.playerZ * orts.MathUtil.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * this.height / 2),
                        this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
                }
            }
        }

        /** ************************************************************************************************************
        *   Finds the segment with the specified index.
        ***************************************************************************************************************/
        private findSegment( z )
        {
            return this.segments[Math.floor(z / orts.SettingGame.SEGMENT_LENGTH) % this.segments.length];
        }

        // =========================================================================
        // BUILD ROAD GEOMETRY
        // =========================================================================

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private lastY()
        {
            return (this.segments.length === 0) ? 0 : this.segments[this.segments.length - 1].p2.world.y;
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addSegment( curve, y )
        {
            var n = this.segments.length;
            this.segments.push({
                index: n,
                p1: {world: {y: this.lastY(), z: n * orts.SettingGame.SEGMENT_LENGTH}, camera: {}, screen: {}},
                p2: {world: {y: y, z: (n + 1) * orts.SettingGame.SEGMENT_LENGTH}, camera: {}, screen: {}},
                curve: curve,
                sprites: [],
                cars: [],
                color: Math.floor(n / orts.SettingGame.RUMBLE_LENGTH) % 2 ? orts.SettingColor.DARK : orts.SettingColor.LIGHT
            });
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addSprite( n, sprite, offset )
        {
            this.segments[n].sprites.push({source: sprite, offset: offset});
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addRoad( enter, hold, leave, curve, y )
        {
            var startY = this.lastY();
            var endY = startY + (orts.MathUtil.toInt(y) * orts.SettingGame.SEGMENT_LENGTH);
            var n, total = enter + hold + leave;
            for (n = 0; n < enter; n++)
                this.addSegment(orts.MathUtil.easeIn(0, curve, n / enter), orts.MathUtil.easeInOut(startY, endY, n / total));
            for (n = 0; n < hold; n++)
                this.addSegment(curve, orts.MathUtil.easeInOut(startY, endY, (enter + n) / total));
            for (n = 0; n < leave; n++)
                this.addSegment(orts.MathUtil.easeInOut(curve, 0, n / leave), orts.MathUtil.easeInOut(startY, endY, (enter + hold + n) / total));
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private ROAD = {
            LENGTH: {NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100},
            HILL: {NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60},
            CURVE: {NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6}
        };

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addStraight( num )
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            this.addRoad(num, num, num, 0, 0);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addHill( num, height )
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            height = height || this.ROAD.HILL.MEDIUM;
            this.addRoad(num, num, num, 0, height);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addCurve( num, curve, height )
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            curve = curve || this.ROAD.CURVE.MEDIUM;
            height = height || this.ROAD.HILL.NONE;
            this.addRoad(num, num, num, curve, height);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addLowRollingHills( num, height )
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
        private addSCurves()
        {
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.EASY, this.ROAD.HILL.NONE);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.MEDIUM, this.ROAD.HILL.MEDIUM);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.EASY, -this.ROAD.HILL.LOW);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.EASY, this.ROAD.HILL.MEDIUM);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.MEDIUM, -this.ROAD.HILL.MEDIUM);
        };

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private addBumps()
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
        private addDownhillToEnd( num )
        {
            num = num || 200;
            this.addRoad(num, num, num, -this.ROAD.CURVE.EASY, -this.lastY() / orts.SettingGame.SEGMENT_LENGTH);
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private resetRoad()
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

            this.segments[this.findSegment(this.playerZ).index + 2].color = orts.SettingColor.START;
            this.segments[this.findSegment(this.playerZ).index + 3].color = orts.SettingColor.START;
            for (var n = 0; n < orts.SettingGame.RUMBLE_LENGTH; n++)
                this.segments[this.segments.length - 1 - n].color = orts.SettingColor.FINISH;

            this.trackLength = this.segments.length * orts.SettingGame.SEGMENT_LENGTH;
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private resetSprites()
        {
            var n, i;

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

            for (n = 10; n < 200; n += 4 + Math.floor(n / 100)) {
                this.addSprite(n, orts.ImageFile.PALM_TREE, 0.5 + Math.random() * 0.5);
                this.addSprite(n, orts.ImageFile.PALM_TREE, 1 + Math.random() * 2);
            }

            for (n = 250; n < 1000; n += 5) {
                this.addSprite(n, orts.ImageFile.COLUMN, 1.1);
                this.addSprite(n + orts.MathUtil.randomInt(0, 5), orts.ImageFile.TREE1, -1 - (Math.random() * 2));
                this.addSprite(n + orts.MathUtil.randomInt(0, 5), orts.ImageFile.TREE2, -1 - (Math.random() * 2));
            }

            for (n = 200; n < this.segments.length; n += 3) {
                this.addSprite(n, orts.MathUtil.randomChoice(orts.SettingGame.PLANTS), orts.MathUtil.randomChoice([1, -1]) * (2 + Math.random() * 5));
            }

            var side, sprite, offset;
            for (n = 1000; n < (this.segments.length - 50); n += 100) {
                side = orts.MathUtil.randomChoice([1, -1]);
                this.addSprite(n + orts.MathUtil.randomInt(0, 50), orts.MathUtil.randomChoice(orts.SettingGame.BILLBOARDS), -side);
                for (i = 0; i < 20; i++) {
                    sprite = orts.MathUtil.randomChoice(orts.SettingGame.PLANTS);
                    offset = side * (1.5 + Math.random());
                    this.addSprite(n + orts.MathUtil.randomInt(0, 50), sprite, offset);
                }
            }
        }

        /** ************************************************************************************************************
        *
        ***************************************************************************************************************/
        private resetCars()
        {
            this.cars = [];
            var car, segment, offset, z, sprite, speed;
            for (var n = 0; n < orts.SettingGame.TOTAL_CARS; n++) {
                offset = Math.random() * orts.MathUtil.randomChoice([-0.8, 0.8]);
                z = Math.floor(Math.random() * this.segments.length) * orts.SettingGame.SEGMENT_LENGTH;
                sprite = orts.MathUtil.randomChoice(orts.SettingGame.CARS);
                speed = orts.SettingGame.MAX_SPEED / 4 + Math.random() * orts.SettingGame.MAX_SPEED / (sprite === orts.ImageFile.SEMI ? 4 : 2);
                car = {offset: offset, z: z, sprite: sprite, speed: speed};
                segment = this.findSegment(car.z);
                segment.cars.push(car);
                this.cars.push(car);
            }
        }
    }
