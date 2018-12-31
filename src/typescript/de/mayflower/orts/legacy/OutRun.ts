
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   The main legacy game engine.
    *******************************************************************************************************************/
    // tslint:disable:max-line-length
    export class OutRun
    {
        /** The 2D drawing context for the canvas. */
        private     readonly    ctx                 :CanvasRenderingContext2D   = null;

        /** The player. */
        private                 player              :orts.Player                = null;
        /** The game stage. */
        private                 stage               :orts.Stage                 = null;
        /** The stage background. */
        private                 background          :orts.Background            = null;
        /** The stage camera. */
        private                 camera              :orts.Camera                = null;

        // ?

        /** logical canvas width */
        private                 width               :number                     = 1024;
        /** logical canvas height */
        private                 height              :number                     = 768;
        /** scaling factor to provide resolution independence (computed) */
        private                 resolution          :number                     = null;

        // player!

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
            // create the player
            this.player = new orts.Player();

            // create the camera
            this.camera = new orts.Camera();


            this.camera.cameraDepth = 1 / Math.tan((orts.SettingGame.FIELD_OF_VIEW / 2) * Math.PI / 180);
            this.player.playerZ = (orts.SettingGame.CAMERA_HEIGHT * this.camera.cameraDepth);

            this.width = orts.Main.game.canvasSystem.getWidth();
            this.height = orts.Main.game.canvasSystem.getHeight();

            this.resolution = this.height / 480;


            // rebuild the stage
            this.stage = new orts.Stage();
            this.stage.resetRoad( this.player.playerZ );

            // create the background
            this.background = new orts.Background();
        }

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
            var playerSegment = this.stage.findSegment(this.camera.cameraZ + this.player.playerZ);
            var playerW = 80 * orts.SettingGame.SPRITE_SCALE;
            var speedPercent = this.player.speed / orts.SettingGame.MAX_SPEED;
            var dx = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
            var startPosition = this.camera.cameraZ;

            this.updateCars(dt, playerSegment, playerW);

            this.camera.cameraZ = orts.MathUtil.increase(this.camera.cameraZ, dt * this.player.speed, this.stage.trackLength);

            // check pressed keys
            this.keyLeft = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_LEFT);
            this.keyRight = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_RIGHT);
            this.keyFaster = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_UP);
            this.keySlower = orts.Main.game.keySystem.isPressed(orts.KeyCodes.KEY_DOWN);

            if (this.keyLeft)
                this.player.playerX = this.player.playerX - dx;
            else if (this.keyRight)
                this.player.playerX = this.player.playerX + dx;

            this.player.playerX = this.player.playerX - (dx * speedPercent * playerSegment.curve * orts.SettingGame.CENTRIFUGAL);

            if (this.keyFaster)
                this.player.speed = orts.MathUtil.accelerate(this.player.speed, orts.SettingGame.ACCELERATION_RATE, dt);
            else if (this.keySlower)
                this.player.speed = orts.MathUtil.accelerate(this.player.speed, orts.SettingGame.BREAKING_RATE, dt);
            else
                this.player.speed = orts.MathUtil.accelerate(this.player.speed, orts.SettingGame.NATURAL_DECELERATION_RATE, dt);

            if ((this.player.playerX < -1) || (this.player.playerX > 1)) {

                if (this.player.speed > orts.SettingGame.OFF_ROAD_LIMIT)
                    this.player.speed = orts.MathUtil.accelerate(this.player.speed, orts.SettingGame.OFF_ROAD_DECELERATION, dt);

                for (n = 0; n < playerSegment.sprites.length; n++) {
                    sprite = playerSegment.sprites[n];
                    spriteW = orts.Main.game.imageSystem.getImage(sprite.source).width * orts.SettingGame.SPRITE_SCALE;

                    if (orts.MathUtil.overlap(this.player.playerX, playerW, sprite.offset + spriteW / 2 * (sprite.offset > 0 ? 1 : -1), spriteW, 0)) {
                        this.player.speed = orts.SettingGame.MAX_SPEED / 5;
                        this.camera.cameraZ = orts.MathUtil.increase(playerSegment.p1.world.z, -this.player.playerZ, this.stage.trackLength); // stop in front of sprite (at front of segment)
                        break;
                    }
                }
            }

            for (n = 0; n < playerSegment.cars.length; n++) {
                car = playerSegment.cars[n];
                carW = orts.Main.game.imageSystem.getImage(car.sprite).width * orts.SettingGame.SPRITE_SCALE;
                if (this.player.speed > car.speed) {
                    if (orts.MathUtil.overlap(this.player.playerX, playerW, car.offset, carW, 0.8)) {
                        this.player.speed = car.speed * (car.speed / this.player.speed);
                        this.camera.cameraZ = orts.MathUtil.increase(car.z, -this.player.playerZ, this.stage.trackLength);
                        break;
                    }
                }
            }

            this.player.playerX = orts.MathUtil.limit(this.player.playerX, -3, 3);     // dont ever let it go too far out of bounds
            this.player.speed = orts.MathUtil.limit(this.player.speed, 0, orts.SettingGame.MAX_SPEED); // or exceed maxSpeed

            this.background.skyOffset = orts.MathUtil.increase(this.background.skyOffset, orts.SettingGame.SKY_SPEED * playerSegment.curve * (this.camera.cameraZ - startPosition) / orts.SettingGame.SEGMENT_LENGTH, 1);
            this.background.hillOffset = orts.MathUtil.increase(this.background.hillOffset, orts.SettingGame.HILL_SPEED * playerSegment.curve * (this.camera.cameraZ - startPosition) / orts.SettingGame.SEGMENT_LENGTH, 1);
            this.background.treeOffset = orts.MathUtil.increase(this.background.treeOffset, orts.SettingGame.TREE_SPEED * playerSegment.curve * (this.camera.cameraZ - startPosition) / orts.SettingGame.SEGMENT_LENGTH, 1);
        }

        /** ************************************************************************************************************
        *   Updates the cars in the game world.
        *
        *   @param dt The delta time to update the game.
        ***************************************************************************************************************/
        private updateCars( dt, playerSegment, playerW )
        {
            var n, car, oldSegment, newSegment;
            for (n = 0; n < this.stage.cars.length; n++) {
                car = this.stage.cars[n];
                oldSegment = this.stage.findSegment(car.z);
                car.offset = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerW);
                car.z = orts.MathUtil.increase(car.z, dt * car.speed, this.stage.trackLength);
                car.percent = orts.MathUtil.percentRemaining(car.z, orts.SettingGame.SEGMENT_LENGTH); // useful for interpolation during rendering phase
                newSegment = this.stage.findSegment(car.z);
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
                segment = this.stage.segments[(carSegment.index + i) % this.stage.segments.length];

                if ((segment === playerSegment) && (car.speed > this.player.speed) && (orts.MathUtil.overlap(this.player.playerX, playerW, car.offset, carW, 1.2))) {
                    if (this.player.playerX > 0.5)
                        dir = -1;
                    else if (this.player.playerX < -0.5)
                        dir = 1;
                    else
                        dir = (car.offset > this.player.playerX) ? 1 : -1;
                    return dir * 1 / i * (car.speed - this.player.speed) / orts.SettingGame.MAX_SPEED; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
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
            var baseSegment = this.stage.findSegment(this.camera.cameraZ);
            var basePercent = orts.MathUtil.percentRemaining(this.camera.cameraZ, orts.SettingGame.SEGMENT_LENGTH);
            var playerSegment = this.stage.findSegment(this.camera.cameraZ + this.player.playerZ);
            var playerPercent = orts.MathUtil.percentRemaining(this.camera.cameraZ + this.player.playerZ, orts.SettingGame.SEGMENT_LENGTH);
            var playerY = orts.MathUtil.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
            var maxy = this.height;

            var x = 0;
            var dx = -(baseSegment.curve * basePercent);

            // clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);

            // fill canvas with sky color
            orts.Drawing2D.rect(this.ctx, 0, 0, this.width, this.height, orts.SettingColor.SKY);

            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.SKY, this.background.skyOffset, this.resolution * orts.SettingGame.SKY_SPEED * playerY);
            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.HILLS, this.background.hillOffset, this.resolution * orts.SettingGame.HILL_SPEED * playerY);
            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.TREES, this.background.treeOffset, this.resolution * orts.SettingGame.TREE_SPEED * playerY);

            var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;

            for (n = 0; n < orts.SettingGame.DRAW_DISTANCE; n++) {

                segment = this.stage.segments[(baseSegment.index + n) % this.stage.segments.length];
                segment.looped = segment.index < baseSegment.index;
                segment.fog = orts.MathUtil.exponentialFog(n / orts.SettingGame.DRAW_DISTANCE, orts.SettingGame.FOG_DENSITY);
                segment.clip = maxy;

                orts.MathUtil.project(segment.p1, (this.player.playerX * orts.SettingGame.ROAD_WIDTH) - x, playerY + orts.SettingGame.CAMERA_HEIGHT, this.camera.cameraZ - (segment.looped ? this.stage.trackLength : 0), this.camera.cameraDepth, this.width, this.height, orts.SettingGame.ROAD_WIDTH);
                orts.MathUtil.project(segment.p2, (this.player.playerX * orts.SettingGame.ROAD_WIDTH) - x - dx, playerY + orts.SettingGame.CAMERA_HEIGHT, this.camera.cameraZ - (segment.looped ? this.stage.trackLength : 0), this.camera.cameraDepth, this.width, this.height, orts.SettingGame.ROAD_WIDTH);

                x = x + dx;
                dx = dx + segment.curve;

                if ((segment.p1.camera.z <= this.camera.cameraDepth) || // behind us
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
                segment = this.stage.segments[(baseSegment.index + n) % this.stage.segments.length];

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
                    orts.Drawing2D.player(this.ctx, this.width, this.height, this.resolution, orts.SettingGame.ROAD_WIDTH, this.player.speed / orts.SettingGame.MAX_SPEED,
                        this.camera.cameraDepth / this.player.playerZ,
                        this.width / 2,
                        (this.height / 2) - (this.camera.cameraDepth / this.player.playerZ * orts.MathUtil.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * this.height / 2),
                        this.player.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
                }
            }
        }
    }
