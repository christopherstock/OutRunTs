
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   The main legacy game engine.
    *******************************************************************************************************************/
    // tslint:disable:max-line-length
    export class OutRun
    {
        private     readonly    fps                 :number                     = 60;                               // how many 'update' frames per second
        private     readonly    step                :number                     = 1 / this.fps;                     // how long is each frame (in seconds)
        private     readonly    centrifugal         :number                     = 0.3;                              // centrifugal force multiplier when going around curves
        private     readonly    skySpeed            :number                     = 0.001;                            // background sky layer scroll speed when going around curve (or up hill)
        private     readonly    hillSpeed           :number                     = 0.002;                            // background hill layer scroll speed when going around curve (or up hill)
        private     readonly    treeSpeed           :number                     = 0.003;                            // background tree layer scroll speed when going around curve (or up hill)
        private     readonly    ctx                 :CanvasRenderingContext2D   = orts.Main.game.canvasSystem.getCanvasContext(); // ...and its drawing context
        private     readonly    roadWidth           :number                     = 2000;                             // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
        private     readonly    segmentLength       :number                     = 200;                              // length of a single segment
        private     readonly    rumbleLength        :number                     = 3;                                // number of segments per red/white rumble strip
        private     readonly    lanes               :number                     = 4;                                // number of lanes
        private     readonly    fieldOfView         :number                     = 100;                              // angle (degrees) for field of view
        private     readonly    cameraHeight        :number                     = 1000;                             // z height of camera
        private     readonly    drawDistance        :number                     = 300;                              // number of segments to draw
        private     readonly    fogDensity          :number                     = 5;                                // exponential fog density
        private     readonly    maxSpeed            :number                     = this.segmentLength / this.step;   // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
        private     readonly    accel               :number                     = this.maxSpeed / 5;                // acceleration rate - tuned until it 'felt' right
        private     readonly    breaking            :number                     = -this.maxSpeed;                   // deceleration rate when braking
        private     readonly    decel               :number                     = -this.maxSpeed / 5;               // 'natural' deceleration rate when neither accelerating, nor braking
        private     readonly    offRoadDecel        :number                     = -this.maxSpeed / 2;               // speed multiploier for off road - off road deceleration is somewhere in between
        private     readonly    offRoadLimit        :number                     = this.maxSpeed / 4;                // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
        private     readonly    totalCars           :number                     = 200;                              // total number of cars on the road

        private                 width               :number                     = 1024;                             // logical canvas width
        private                 height              :number                     = 768;                              // logical canvas height
        private                 skyOffset           :number                     = 0;                                // current sky scroll offset
        private                 hillOffset          :number                     = 0;                                // current hill scroll offset
        private                 treeOffset          :number                     = 0;                                // current tree scroll offset
        private                 segments            :any[]                      = [];                               // array of road segments
        private                 cars                :any[]                      = [];                               // array of cars on the road
        private                 resolution          :number                     = null;                             // scaling factor to provide resolution independence (computed)
        private                 trackLength         :number                     = null;                             // z length of entire track (computed)
        private                 cameraDepth         :number                     = null;                             // z distance camera is from screen (computed)
        private                 playerX             :number                     = 0;                                // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
        private                 playerZ             :number                     = null;                             // player relative z distance from camera (computed)
        private                 position            :number                     = 0;                                // current camera Z position (add playerZ to get player's absolute Z position)
        private                 speed               :number                     = 0;                                // current speed

        private                 keyLeft             :boolean                    = false;
        private                 keyRight            :boolean                    = false;
        private                 keyFaster           :boolean                    = false;
        private                 keySlower           :boolean                    = false;

        public reset() : void
        {
            this.cameraDepth = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180);
            this.playerZ = (this.cameraHeight * this.cameraDepth);

            this.width = orts.Main.game.canvasSystem.getWidth();
            this.height = orts.Main.game.canvasSystem.getHeight();

            this.resolution = this.height / 480;

            if ((this.segments.length === 0))
                this.resetRoad(); // only rebuild road when necessary
        };

        public start() : void
        {
            /*
                        const frame:()=>void = (): void =>
                        {
                            this.update( this.step );
                            this.render();

                            requestAnimationFrame( frame );
                        };
                        frame();
            */

            var now = null;
            var last = new Date().getTime();
            var dt = 0;
            var gdt = 0;

            const frame=():void=>
            {
                now = new Date().getTime();

                // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
                dt = Math.min(1, (now - last) / 1000);

                gdt = gdt + dt;
                while (gdt > this.step) {
                    gdt = gdt - this.step;
                    this.update(this.step);
                }
                this.render();
                last = now;
                requestAnimationFrame( frame );
            };
            frame(); // lets get this party started
        };

        //=========================================================================
        // UPDATE THE GAME WORLD
        //=========================================================================

        private update( dt )
        {
            var n, car, carW, sprite, spriteW;
            var playerSegment = this.findSegment(this.position + this.playerZ);
            var playerW = 80 * orts.SettingGame.SPRITE_SCALE;
            var speedPercent = this.speed / this.maxSpeed;
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

            this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.centrifugal);

            if (this.keyFaster)
                this.speed = orts.MathUtil.accelerate(this.speed, this.accel, dt);
            else if (this.keySlower)
                this.speed = orts.MathUtil.accelerate(this.speed, this.breaking, dt);
            else
                this.speed = orts.MathUtil.accelerate(this.speed, this.decel, dt);


            if ((this.playerX < -1) || (this.playerX > 1)) {

                if (this.speed > this.offRoadLimit)
                    this.speed = orts.MathUtil.accelerate(this.speed, this.offRoadDecel, dt);

                for (n = 0; n < playerSegment.sprites.length; n++) {
                    sprite = playerSegment.sprites[n];
                    spriteW = orts.Main.game.imageSystem.getImage(sprite.source).width * orts.SettingGame.SPRITE_SCALE;

                    if (orts.MathUtil.overlap(this.playerX, playerW, sprite.offset + spriteW / 2 * (sprite.offset > 0 ? 1 : -1), spriteW, 0)) {
                        this.speed = this.maxSpeed / 5;
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
            this.speed = orts.MathUtil.limit(this.speed, 0, this.maxSpeed); // or exceed maxSpeed

            this.skyOffset = orts.MathUtil.increase(this.skyOffset, this.skySpeed * playerSegment.curve * (this.position - startPosition) / this.segmentLength, 1);
            this.hillOffset = orts.MathUtil.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * (this.position - startPosition) / this.segmentLength, 1);
            this.treeOffset = orts.MathUtil.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * (this.position - startPosition) / this.segmentLength, 1);
        }

        private updateCars( dt, playerSegment, playerW )
        {
            var n, car, oldSegment, newSegment;
            for (n = 0; n < this.cars.length; n++) {
                car = this.cars[n];
                oldSegment = this.findSegment(car.z);
                car.offset = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerW);
                car.z = orts.MathUtil.increase(car.z, dt * car.speed, this.trackLength);
                car.percent = orts.MathUtil.percentRemaining(car.z, this.segmentLength); // useful for interpolation during rendering phase
                newSegment = this.findSegment(car.z);
                if (oldSegment !== newSegment) {
                    var index = oldSegment.cars.indexOf(car);
                    oldSegment.cars.splice(index, 1);
                    newSegment.cars.push(car);
                }
            }
        }

        private updateCarOffset( car, carSegment, playerSegment, playerW )
        {
            var i, j, dir, segment, otherCar, otherCarW, lookahead = 20,
                carW = orts.Main.game.imageSystem.getImage(car.sprite).width * orts.SettingGame.SPRITE_SCALE;

            // optimization, dont bother steering around other cars when 'out of sight' of the player
            if ((carSegment.index - playerSegment.index) > this.drawDistance)
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
                    return dir * 1 / i * (car.speed - this.speed) / this.maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
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
                        return dir * 1 / i * (car.speed - otherCar.speed) / this.maxSpeed;
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

        //=========================================================================
        // RENDER THE GAME WORLD
        //=========================================================================

        private render()
        {
            var baseSegment = this.findSegment(this.position);
            var basePercent = orts.MathUtil.percentRemaining(this.position, this.segmentLength);
            var playerSegment = this.findSegment(this.position + this.playerZ);
            var playerPercent = orts.MathUtil.percentRemaining(this.position + this.playerZ, this.segmentLength);
            var playerY = orts.MathUtil.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
            var maxy = this.height;

            var x = 0;
            var dx = -(baseSegment.curve * basePercent);

            // clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);

            // fill canvas with sky color
            orts.Drawing2D.rect(this.ctx, 0, 0, this.width, this.height, orts.SettingColor.SKY);

            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.SKY, this.skyOffset, this.resolution * this.skySpeed * playerY);
            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.HILLS, this.hillOffset, this.resolution * this.hillSpeed * playerY);
            orts.Drawing2D.background(this.ctx, this.width, this.height, orts.ImageFile.TREES, this.treeOffset, this.resolution * this.treeSpeed * playerY);

            var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;

            for (n = 0; n < this.drawDistance; n++) {

                segment = this.segments[(baseSegment.index + n) % this.segments.length];
                segment.looped = segment.index < baseSegment.index;
                segment.fog = orts.MathUtil.exponentialFog(n / this.drawDistance, this.fogDensity);
                segment.clip = maxy;

                orts.MathUtil.project(segment.p1, (this.playerX * this.roadWidth) - x, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);
                orts.MathUtil.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);

                x = x + dx;
                dx = dx + segment.curve;

                if ((segment.p1.camera.z <= this.cameraDepth) || // behind us
                    (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
                    (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
                    continue;

                orts.Drawing2D.segment(this.ctx, this.width, this.lanes,
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

            for (n = (this.drawDistance - 1); n > 0; n--) {
                segment = this.segments[(baseSegment.index + n) % this.segments.length];

                for (i = 0; i < segment.cars.length; i++) {
                    car = segment.cars[i];
                    sprite = car.sprite;
                    spriteScale = orts.MathUtil.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
                    spriteX = orts.MathUtil.interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + (spriteScale * car.offset * this.roadWidth * this.width / 2);
                    spriteY = orts.MathUtil.interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent);
                    orts.Drawing2D.sprite(this.ctx, this.width, this.height, this.resolution, this.roadWidth, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
                }

                for (i = 0; i < segment.sprites.length; i++) {
                    sprite = segment.sprites[i];
                    spriteScale = segment.p1.screen.scale;
                    spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * this.roadWidth * this.width / 2);
                    spriteY = segment.p1.screen.y;
                    orts.Drawing2D.sprite(this.ctx, this.width, this.height, this.resolution, this.roadWidth, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
                }

                if (segment === playerSegment) {
                    orts.Drawing2D.player(this.ctx, this.width, this.height, this.resolution, this.roadWidth, this.speed / this.maxSpeed,
                        this.cameraDepth / this.playerZ,
                        this.width / 2,
                        (this.height / 2) - (this.cameraDepth / this.playerZ * orts.MathUtil.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * this.height / 2),
                        this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
                }
            }
        }

        private findSegment( z )
        {
            return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
        }

        //=========================================================================
        // BUILD ROAD GEOMETRY
        //=========================================================================

        private lastY()
        {
            return (this.segments.length === 0) ? 0 : this.segments[this.segments.length - 1].p2.world.y;
        }

        private addSegment( curve, y )
        {
            var n = this.segments.length;
            this.segments.push({
                index: n,
                p1: {world: {y: this.lastY(), z: n * this.segmentLength}, camera: {}, screen: {}},
                p2: {world: {y: y, z: (n + 1) * this.segmentLength}, camera: {}, screen: {}},
                curve: curve,
                sprites: [],
                cars: [],
                color: Math.floor(n / this.rumbleLength) % 2 ? orts.SettingColor.DARK : orts.SettingColor.LIGHT
            });
        }

        private addSprite( n, sprite, offset )
        {
            this.segments[n].sprites.push({source: sprite, offset: offset});
        }

        private addRoad( enter, hold, leave, curve, y )
        {
            var startY = this.lastY();
            var endY = startY + (orts.MathUtil.toInt(y) * this.segmentLength);
            var n, total = enter + hold + leave;
            for (n = 0; n < enter; n++)
                this.addSegment(orts.MathUtil.easeIn(0, curve, n / enter), orts.MathUtil.easeInOut(startY, endY, n / total));
            for (n = 0; n < hold; n++)
                this.addSegment(curve, orts.MathUtil.easeInOut(startY, endY, (enter + n) / total));
            for (n = 0; n < leave; n++)
                this.addSegment(orts.MathUtil.easeInOut(curve, 0, n / leave), orts.MathUtil.easeInOut(startY, endY, (enter + hold + n) / total));
        }

        private ROAD = {
            LENGTH: {NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100},
            HILL: {NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60},
            CURVE: {NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6}
        };

        private addStraight( num )
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            this.addRoad(num, num, num, 0, 0);
        }

        private addHill( num, height )
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            height = height || this.ROAD.HILL.MEDIUM;
            this.addRoad(num, num, num, 0, height);
        }

        private addCurve( num, curve, height )
        {
            num = num || this.ROAD.LENGTH.MEDIUM;
            curve = curve || this.ROAD.CURVE.MEDIUM;
            height = height || this.ROAD.HILL.NONE;
            this.addRoad(num, num, num, curve, height);
        }

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

        private addSCurves()
        {
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.EASY, this.ROAD.HILL.NONE);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.MEDIUM, this.ROAD.HILL.MEDIUM);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.EASY, -this.ROAD.HILL.LOW);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.EASY, this.ROAD.HILL.MEDIUM);
            this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, -this.ROAD.CURVE.MEDIUM, -this.ROAD.HILL.MEDIUM);
        };

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

        private addDownhillToEnd( num )
        {
            num = num || 200;
            this.addRoad(num, num, num, -this.ROAD.CURVE.EASY, -this.lastY() / this.segmentLength);
        }

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
            for (var n = 0; n < this.rumbleLength; n++)
                this.segments[this.segments.length - 1 - n].color = orts.SettingColor.FINISH;

            this.trackLength = this.segments.length * this.segmentLength;
        }

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

        private resetCars()
        {
            this.cars = [];
            var car, segment, offset, z, sprite, speed;
            for (var n = 0; n < this.totalCars; n++) {
                offset = Math.random() * orts.MathUtil.randomChoice([-0.8, 0.8]);
                z = Math.floor(Math.random() * this.segments.length) * this.segmentLength;
                sprite = orts.MathUtil.randomChoice(orts.SettingGame.CARS);
                speed = this.maxSpeed / 4 + Math.random() * this.maxSpeed / (sprite === orts.ImageFile.SEMI ? 4 : 2);
                car = {offset: offset, z: z, sprite: sprite, speed: speed};
                segment = this.findSegment(car.z);
                segment.cars.push(car);
                this.cars.push(car);
            }
        }
    }
