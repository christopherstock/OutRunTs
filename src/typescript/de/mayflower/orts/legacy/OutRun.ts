
import * as orts from '..'

export class OutRun
{
    fps            = 60;                      // how many 'update' frames per second
    step           = 1/this.fps;                   // how long is each frame (in seconds)
    width     :number     = 1024;                    // logical canvas width
    height         = 768;                     // logical canvas height
    centrifugal    = 0.3;                     // centrifugal force multiplier when going around curves
    skySpeed       = 0.001;                   // background sky layer scroll speed when going around curve (or up hill)
    hillSpeed      = 0.002;                   // background hill layer scroll speed when going around curve (or up hill)
    treeSpeed      = 0.003;                   // background tree layer scroll speed when going around curve (or up hill)
    skyOffset      = 0;                       // current sky scroll offset
    hillOffset     = 0;                       // current hill scroll offset
    treeOffset     = 0;                       // current tree scroll offset
    segments       = [];                      // array of road segments
    cars           = [];                      // array of cars on the road
    canvas :HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;     // our canvas...
    ctx            = this.canvas.getContext('2d'); // ...and its drawing context
    background     = null;                    // our background image (loaded below)
    sprites        = null;                    // our spritesheet (loaded below)
    resolution     = null;                    // scaling factor to provide resolution independence (computed)
    roadWidth      = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    segmentLength  = 200;                     // length of a single segment
    rumbleLength   = 3;                       // number of segments per red/white rumble strip
    trackLength    = null;                    // z length of entire track (computed)
    lanes          = 4;                       // number of lanes
    fieldOfView    = 100;                     // angle (degrees) for field of view
    cameraHeight   = 1000;                    // z height of camera
    cameraDepth    = null;                    // z distance camera is from screen (computed)
    drawDistance   = 300;                     // number of segments to draw
    playerX        = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    playerZ        = null;                    // player relative z distance from camera (computed)
    fogDensity     = 5;                       // exponential fog density
    position       = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
    speed          = 0;                       // current speed
    maxSpeed       = this.segmentLength/this.step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
    accel          =  this.maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
    breaking       = -this.maxSpeed;               // deceleration rate when braking
    decel          = -this.maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
    offRoadDecel   = -this.maxSpeed/2;             // speed multiploier for off road - off road deceleration is somewhere in between
    offRoadLimit   =  this.maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
    totalCars      = 200;                     // total number of cars on the road
    currentLapTime = 0;                       // current lap time
    lastLapTime    = null;                    // last lap time

    // indicates pressed keys

    keyLeft        = false;
    keyRight       = false;
    keyFaster      = false;
    keySlower      = false;

    //=========================================================================
    // UPDATE THE GAME WORLD
    //=========================================================================

    update=(dt)=> {

      var n, car, carW, sprite, spriteW;
      var playerSegment = this.findSegment(this.position+this.playerZ);
      var playerW       = orts.SPRITES.PLAYER_STRAIGHT.w * orts.SPRITES.SCALE;
      var speedPercent  = this.speed/this.maxSpeed;
      var dx            = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
      var startPosition = this.position;

      this.updateCars(dt, playerSegment, playerW);

      this.position = orts.Util.increase(this.position, dt * this.speed, this.trackLength);

      if (this.keyLeft)
        this.playerX = this.playerX - dx;
      else if (this.keyRight)
        this.playerX = this.playerX + dx;

      this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.centrifugal);

      if (this.keyFaster)
        this.speed = orts.Util.accelerate(this.speed, this.accel, dt);
      else if (this.keySlower)
        this.speed = orts.Util.accelerate(this.speed, this.breaking, dt);
      else
        this.speed = orts.Util.accelerate(this.speed, this.decel, dt);


      if ((this.playerX < -1) || (this.playerX > 1)) {

        if (this.speed > this.offRoadLimit)
          this.speed = orts.Util.accelerate(this.speed, this.offRoadDecel, dt);

        for(n = 0 ; n < playerSegment.sprites.length ; n++) {
          sprite  = playerSegment.sprites[n];
          spriteW = sprite.source.w * orts.SPRITES.SCALE;
          if (orts.Util.overlap(this.playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW, 0)) {
            this.speed = this.maxSpeed/5;
            this.position = orts.Util.increase(playerSegment.p1.world.z, -this.playerZ, this.trackLength); // stop in front of sprite (at front of segment)
            break;
          }
        }
      }

      for(n = 0 ; n < playerSegment.cars.length ; n++) {
        car  = playerSegment.cars[n];
        carW = car.sprite.w * orts.SPRITES.SCALE;
        if (this.speed > car.speed) {
          if (orts.Util.overlap(this.playerX, playerW, car.offset, carW, 0.8)) {
            this.speed    = car.speed * (car.speed/this.speed);
            this.position = orts.Util.increase(car.z, -this.playerZ, this.trackLength);
            break;
          }
        }
      }

      this.playerX = orts.Util.limit(this.playerX, -3, 3);     // dont ever let it go too far out of bounds
      this.speed   = orts.Util.limit(this.speed, 0, this.maxSpeed); // or exceed maxSpeed

      this.skyOffset  = orts.Util.increase(this.skyOffset,  this.skySpeed  * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
      this.hillOffset = orts.Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
      this.treeOffset = orts.Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);

      if (this.position > this.playerZ) {
        if (this.currentLapTime && (startPosition < this.playerZ)) {
          this.lastLapTime    = this.currentLapTime;
          this.currentLapTime = 0;
    /*
          if (lastLapTime <= orts.Util.toFloat(Dom.storage.fast_lap_time)) {
            Dom.storage.fast_lap_time = lastLapTime;
          }
    */
        }
        else {
          this.currentLapTime += dt;
        }
      }
    }

    //-------------------------------------------------------------------------

    updateCars=(dt, playerSegment, playerW)=> {
      var n, car, oldSegment, newSegment;
      for(n = 0 ; n < this.cars.length ; n++) {
        car         = this.cars[n];
        oldSegment  = this.findSegment(car.z);
        car.offset  = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerW);
        car.z       = orts.Util.increase(car.z, dt * car.speed, this.trackLength);
        car.percent = orts.Util.percentRemaining(car.z, this.segmentLength); // useful for interpolation during rendering phase
        newSegment  = this.findSegment(car.z);
        if (oldSegment !== newSegment) {
          var index = oldSegment.cars.indexOf(car);
          oldSegment.cars.splice(index, 1);
          newSegment.cars.push(car);
        }
      }
    }

    updateCarOffset=(car, carSegment, playerSegment, playerW)=> {

      var i, j, dir, segment, otherCar, otherCarW, lookahead = 20, carW = car.sprite.w * orts.SPRITES.SCALE;

      // optimization, dont bother steering around other cars when 'out of sight' of the player
      if ((carSegment.index - playerSegment.index) > this.drawDistance)
        return 0;

      for(i = 1 ; i < lookahead ; i++) {
        segment = this.segments[(carSegment.index+i)%this.segments.length];

        if ((segment === playerSegment) && (car.speed > this.speed) && (orts.Util.overlap(this.playerX, playerW, car.offset, carW, 1.2))) {
          if (this.playerX > 0.5)
            dir = -1;
          else if (this.playerX < -0.5)
            dir = 1;
          else
            dir = (car.offset > this.playerX) ? 1 : -1;
          return dir * 1/i * (car.speed-this.speed)/this.maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
        }

        for(j = 0 ; j < segment.cars.length ; j++) {
          otherCar  = segment.cars[j];
          otherCarW = otherCar.sprite.w * orts.SPRITES.SCALE;
          if ((car.speed > otherCar.speed) && orts.Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
            if (otherCar.offset > 0.5)
              dir = -1;
            else if (otherCar.offset < -0.5)
              dir = 1;
            else
              dir = (car.offset > otherCar.offset) ? 1 : -1;
            return dir * 1/i * (car.speed-otherCar.speed)/this.maxSpeed;
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
    }

    //=========================================================================
    // RENDER THE GAME WORLD
    //=========================================================================

    render=()=> {

      var baseSegment   = this.findSegment(this.position);
      var basePercent   = orts.Util.percentRemaining(this.position, this.segmentLength);
      var playerSegment = this.findSegment(this.position+this.playerZ);
      var playerPercent = orts.Util.percentRemaining(this.position+this.playerZ, this.segmentLength);
      var playerY       = orts.Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
      var maxy          = this.height;

      var x  = 0;
      var dx = - (baseSegment.curve * basePercent);

      this.ctx.clearRect(0, 0, this.width, this.height);

      orts.Render.background(this.ctx, this.background, this.width, this.height, orts.BACKGROUND.SKY,   this.skyOffset,  this.resolution * this.skySpeed  * playerY);
      orts.Render.background(this.ctx, this.background, this.width, this.height, orts.BACKGROUND.HILLS, this.hillOffset, this.resolution * this.hillSpeed * playerY);
      orts.Render.background(this.ctx, this.background, this.width, this.height, orts.BACKGROUND.TREES, this.treeOffset, this.resolution * this.treeSpeed * playerY);

      var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;

      for(n = 0 ; n < this.drawDistance ; n++) {

        segment        = this.segments[(baseSegment.index + n) % this.segments.length];
        segment.looped = segment.index < baseSegment.index;
        segment.fog    = orts.Util.exponentialFog(n/this.drawDistance, this.fogDensity);
        segment.clip   = maxy;

        orts.Util.project(segment.p1, (this.playerX * this.roadWidth) - x,      playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);
        orts.Util.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);

        x  = x + dx;
        dx = dx + segment.curve;

        if ((segment.p1.camera.z <= this.cameraDepth)         || // behind us
            (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
            (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
          continue;

        orts.Render.segment(this.ctx, this.width, this.lanes,
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

      for(n = (this.drawDistance-1) ; n > 0 ; n--) {
        segment = this.segments[(baseSegment.index + n) % this.segments.length];

        for(i = 0 ; i < segment.cars.length ; i++) {
          car         = segment.cars[i];
          sprite      = car.sprite;
          spriteScale = orts.Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
          spriteX     = orts.Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * this.roadWidth * this.width/2);
          spriteY     = orts.Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
          orts.Render.sprite(this.ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
        }

        for(i = 0 ; i < segment.sprites.length ; i++) {
          sprite      = segment.sprites[i];
          spriteScale = segment.p1.screen.scale;
          spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * this.roadWidth * this.width/2);
          spriteY     = segment.p1.screen.y;
          orts.Render.sprite(this.ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
        }

        if (segment === playerSegment) {
          orts.Render.player(this.ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, this.speed/this.maxSpeed,
                        this.cameraDepth/this.playerZ,
                        this.width/2,
                        (this.height/2) - (this.cameraDepth/this.playerZ * orts.Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * this.height/2),
                        this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
        }
      }
    }

    findSegment=(z)=> {
      return this.segments[Math.floor(z/this.segmentLength) % this.segments.length];
    }

    //=========================================================================
    // BUILD ROAD GEOMETRY
    //=========================================================================

    lastY=()=> { return (this.segments.length === 0) ? 0 : this.segments[this.segments.length-1].p2.world.y; }

    addSegment=(curve, y)=> {
      var n = this.segments.length;
      this.segments.push({
          index: n,
             p1: { world: { y: this.lastY(), z:  n   *this.segmentLength }, camera: {}, screen: {} },
             p2: { world: { y: y,       z: (n+1)*this.segmentLength }, camera: {}, screen: {} },
          curve: curve,
        sprites: [],
           cars: [],
          color: Math.floor(n/this.rumbleLength)%2 ? orts.COLORS.DARK : orts.COLORS.LIGHT
      });
    }

    addSprite=(n, sprite, offset)=> {
      this.segments[n].sprites.push({ source: sprite, offset: offset });
    }

    addRoad=(enter, hold, leave, curve, y)=> {
      var startY   = this.lastY();
      var endY     = startY + (orts.Util.toInt(y, 0) * this.segmentLength);
      var n, total = enter + hold + leave;
      for(n = 0 ; n < enter ; n++)
        this.addSegment(orts.Util.easeIn(0, curve, n/enter), orts.Util.easeInOut(startY, endY, n/total));
      for(n = 0 ; n < hold  ; n++)
        this.addSegment(curve, orts.Util.easeInOut(startY, endY, (enter+n)/total));
      for(n = 0 ; n < leave ; n++)
        this.addSegment(orts.Util.easeInOut(curve, 0, n/leave), orts.Util.easeInOut(startY, endY, (enter+hold+n)/total));
    }

    ROAD = {
      LENGTH: { NONE: 0, SHORT:  25, MEDIUM:   50, LONG:  100 },
      HILL:   { NONE: 0, LOW:    20, MEDIUM:   40, HIGH:   60 },
      CURVE:  { NONE: 0, EASY:    2, MEDIUM:    4, HARD:    6 }
    };

    addStraight=(num)=> {
      num = num || this.ROAD.LENGTH.MEDIUM;
      this.addRoad(num, num, num, 0, 0);
    }

    addHill=(num, height)=> {
      num    = num    || this.ROAD.LENGTH.MEDIUM;
      height = height || this.ROAD.HILL.MEDIUM;
      this.addRoad(num, num, num, 0, height);
    }

    addCurve=(num, curve, height)=> {
      num    = num    || this.ROAD.LENGTH.MEDIUM;
      curve  = curve  || this.ROAD.CURVE.MEDIUM;
      height = height || this.ROAD.HILL.NONE;
      this.addRoad(num, num, num, curve, height);
    }

    addLowRollingHills=(num, height)=> {
      num    = num    || this.ROAD.LENGTH.SHORT;
      height = height || this.ROAD.HILL.LOW;
      this.addRoad(num, num, num,  0,                height/2);
      this.addRoad(num, num, num,  0,               -height);
      this.addRoad(num, num, num,  this.ROAD.CURVE.EASY,  height);
      this.addRoad(num, num, num,  0,                0);
      this.addRoad(num, num, num, -this.ROAD.CURVE.EASY,  height/2);
      this.addRoad(num, num, num,  0,                0);
    }

    addSCurves=()=> {
      this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM,  -this.ROAD.CURVE.EASY,    this.ROAD.HILL.NONE);
      this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM,   this.ROAD.CURVE.MEDIUM,  this.ROAD.HILL.MEDIUM);
      this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM,   this.ROAD.CURVE.EASY,   -this.ROAD.HILL.LOW);
      this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM,  -this.ROAD.CURVE.EASY,    this.ROAD.HILL.MEDIUM);
      this.addRoad(this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM, this.ROAD.LENGTH.MEDIUM,  -this.ROAD.CURVE.MEDIUM, -this.ROAD.HILL.MEDIUM);
    }

    addBumps=()=> {
      this.addRoad(10, 10, 10, 0,  5);
      this.addRoad(10, 10, 10, 0, -2);
      this.addRoad(10, 10, 10, 0, -5);
      this.addRoad(10, 10, 10, 0,  8);
      this.addRoad(10, 10, 10, 0,  5);
      this.addRoad(10, 10, 10, 0, -7);
      this.addRoad(10, 10, 10, 0,  5);
      this.addRoad(10, 10, 10, 0, -2);
    }

    addDownhillToEnd=(num)=> {
      num = num || 200;
      this.addRoad(num, num, num, -this.ROAD.CURVE.EASY, -this.lastY()/this.segmentLength);
    }

    resetRoad=()=> {
      this.segments = [];

      this.addStraight(this.ROAD.LENGTH.SHORT);
      this.addLowRollingHills(0, 0);
      this.addSCurves();
      this.addCurve(this.ROAD.LENGTH.MEDIUM, this.ROAD.CURVE.MEDIUM, this.ROAD.HILL.LOW);
      this.addBumps();
      this.addLowRollingHills(0, 0);
      this.addCurve(this.ROAD.LENGTH.LONG*2, this.ROAD.CURVE.MEDIUM, this.ROAD.HILL.MEDIUM);
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

      this.segments[this.findSegment(this.playerZ).index + 2].color = orts.COLORS.START;
      this.segments[this.findSegment(this.playerZ).index + 3].color = orts.COLORS.START;
      for(var n = 0 ; n < this.rumbleLength ; n++)
        this.segments[this.segments.length-1-n].color = orts.COLORS.FINISH;

      this.trackLength = this.segments.length * this.segmentLength;
    }

    resetSprites=()=> {
      var n, i;

      this.addSprite(20,  orts.SPRITES.BILLBOARD07, -1);
      this.addSprite(40,  orts.SPRITES.BILLBOARD06, -1);
      this.addSprite(60,  orts.SPRITES.BILLBOARD08, -1);
      this.addSprite(80,  orts.SPRITES.BILLBOARD09, -1);
      this.addSprite(100, orts.SPRITES.BILLBOARD01, -1);
      this.addSprite(120, orts.SPRITES.BILLBOARD02, -1);
      this.addSprite(140, orts.SPRITES.BILLBOARD03, -1);
      this.addSprite(160, orts.SPRITES.BILLBOARD04, -1);
      this.addSprite(180, orts.SPRITES.BILLBOARD05, -1);

      this.addSprite(240,                  orts.SPRITES.BILLBOARD07, -1.2);
      this.addSprite(240,                  orts.SPRITES.BILLBOARD06,  1.2);
      this.addSprite(this.segments.length - 25, orts.SPRITES.BILLBOARD07, -1.2);
      this.addSprite(this.segments.length - 25, orts.SPRITES.BILLBOARD06,  1.2);

      for(n = 10 ; n < 200 ; n += 4 + Math.floor(n/100)) {
        this.addSprite(n, orts.SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
        this.addSprite(n, orts.SPRITES.PALM_TREE,   1 + Math.random()*2);
      }

      for(n = 250 ; n < 1000 ; n += 5) {
        this.addSprite(n,     orts.SPRITES.COLUMN, 1.1);
        this.addSprite(n + orts.Util.randomInt(0,5), orts.SPRITES.TREE1, -1 - (Math.random() * 2));
        this.addSprite(n + orts.Util.randomInt(0,5), orts.SPRITES.TREE2, -1 - (Math.random() * 2));
      }

      for(n = 200 ; n < this.segments.length ; n += 3) {
        this.addSprite(n, orts.Util.randomChoice(orts.SPRITES.PLANTS), orts.Util.randomChoice([1,-1]) * (2 + Math.random() * 5));
      }

      var side, sprite, offset;
      for(n = 1000 ; n < (this.segments.length-50) ; n += 100) {
        side      = orts.Util.randomChoice([1, -1]);
        this.addSprite(n + orts.Util.randomInt(0, 50), orts.Util.randomChoice(orts.SPRITES.BILLBOARDS), -side);
        for(i = 0 ; i < 20 ; i++) {
          sprite = orts.Util.randomChoice(orts.SPRITES.PLANTS);
          offset = side * (1.5 + Math.random());
          this.addSprite(n + orts.Util.randomInt(0, 50), sprite, offset);
        }

      }

    }

    resetCars=()=> {
      this.cars = [];
      var car, segment, offset, z, sprite, speed;
      for (var n = 0 ; n < this.totalCars ; n++) {
        offset = Math.random() * orts.Util.randomChoice([-0.8, 0.8]);
        z      = Math.floor(Math.random() * this.segments.length) * this.segmentLength;
        sprite = orts.Util.randomChoice(orts.SPRITES.CARS);
        speed  = this.maxSpeed/4 + Math.random() * this.maxSpeed/(sprite === orts.SPRITES.SEMI ? 4 : 2);
        car = { offset: offset, z: z, sprite: sprite, speed: speed };
        segment = this.findSegment(car.z);
        segment.cars.push(car);
        this.cars.push(car);
      }
    }

    reset=(options)=> {
      options       = options || {};
      this.canvas.width  = this.width  = orts.Util.toInt(options.width,          this.width);
      this.canvas.height = this.height = orts.Util.toInt(options.height,         this.height);
      this.cameraDepth            = 1 / Math.tan((this.fieldOfView/2) * Math.PI/180);
      this.playerZ                = (this.cameraHeight * this.cameraDepth);
      this.resolution             = this.height/480;

      if ((this.segments.length === 0))
        this.resetRoad(); // only rebuild road when necessary
    }
}