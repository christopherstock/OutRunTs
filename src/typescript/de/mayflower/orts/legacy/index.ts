
import * as orts from '..'

var fps            = 60;                      // how many 'update' frames per second
var step           = 1/fps;                   // how long is each frame (in seconds)
var width          = 1024;                    // logical canvas width
var height         = 768;                     // logical canvas height
var centrifugal    = 0.3;                     // centrifugal force multiplier when going around curves
var skySpeed       = 0.001;                   // background sky layer scroll speed when going around curve (or up hill)
var hillSpeed      = 0.002;                   // background hill layer scroll speed when going around curve (or up hill)
var treeSpeed      = 0.003;                   // background tree layer scroll speed when going around curve (or up hill)
var skyOffset      = 0;                       // current sky scroll offset
var hillOffset     = 0;                       // current hill scroll offset
var treeOffset     = 0;                       // current tree scroll offset
var segments       = [];                      // array of road segments
var cars           = [];                      // array of cars on the road
var canvas :HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;     // our canvas...
var ctx            = canvas.getContext('2d'); // ...and its drawing context
var background     = null;                    // our background image (loaded below)
var sprites        = null;                    // our spritesheet (loaded below)
var resolution     = null;                    // scaling factor to provide resolution independence (computed)
var roadWidth      = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
var segmentLength  = 200;                     // length of a single segment
var rumbleLength   = 3;                       // number of segments per red/white rumble strip
var trackLength    = null;                    // z length of entire track (computed)
var lanes          = 4;                       // number of lanes
var fieldOfView    = 100;                     // angle (degrees) for field of view
var cameraHeight   = 1000;                    // z height of camera
var cameraDepth    = null;                    // z distance camera is from screen (computed)
var drawDistance   = 300;                     // number of segments to draw
var playerX        = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
var playerZ        = null;                    // player relative z distance from camera (computed)
var fogDensity     = 5;                       // exponential fog density
var position       = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
var speed          = 0;                       // current speed
var maxSpeed       = segmentLength/step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
var accel          =  maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
var breaking       = -maxSpeed;               // deceleration rate when braking
var decel          = -maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
var offRoadDecel   = -maxSpeed/2;             // speed multiploier for off road - off road deceleration is somewhere in between
var offRoadLimit   =  maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
var totalCars      = 200;                     // total number of cars on the road
var currentLapTime = 0;                       // current lap time
var lastLapTime    = null;                    // last lap time

var keyLeft        = false;
var keyRight       = false;
var keyFaster      = false;
var keySlower      = false;

//=========================================================================
// UPDATE THE GAME WORLD
//=========================================================================

function update(dt) {

  var n, car, carW, sprite, spriteW;
  var playerSegment = findSegment(position+playerZ);
  var playerW       = orts.SPRITES.PLAYER_STRAIGHT.w * orts.SPRITES.SCALE;
  var speedPercent  = speed/maxSpeed;
  var dx            = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
  var startPosition = position;

  updateCars(dt, playerSegment, playerW);

  position = orts.Util.increase(position, dt * speed, trackLength);

  if (keyLeft)
    playerX = playerX - dx;
  else if (keyRight)
    playerX = playerX + dx;

  playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

  if (keyFaster)
    speed = orts.Util.accelerate(speed, accel, dt);
  else if (keySlower)
    speed = orts.Util.accelerate(speed, breaking, dt);
  else
    speed = orts.Util.accelerate(speed, decel, dt);


  if ((playerX < -1) || (playerX > 1)) {

    if (speed > offRoadLimit)
      speed = orts.Util.accelerate(speed, offRoadDecel, dt);

    for(n = 0 ; n < playerSegment.sprites.length ; n++) {
      sprite  = playerSegment.sprites[n];
      spriteW = sprite.source.w * orts.SPRITES.SCALE;
      if (orts.Util.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW, 0)) {
        speed = maxSpeed/5;
        position = orts.Util.increase(playerSegment.p1.world.z, -playerZ, trackLength); // stop in front of sprite (at front of segment)
        break;
      }
    }
  }

  for(n = 0 ; n < playerSegment.cars.length ; n++) {
    car  = playerSegment.cars[n];
    carW = car.sprite.w * orts.SPRITES.SCALE;
    if (speed > car.speed) {
      if (orts.Util.overlap(playerX, playerW, car.offset, carW, 0.8)) {
        speed    = car.speed * (car.speed/speed);
        position = orts.Util.increase(car.z, -playerZ, trackLength);
        break;
      }
    }
  }

  playerX = orts.Util.limit(playerX, -3, 3);     // dont ever let it go too far out of bounds
  speed   = orts.Util.limit(speed, 0, maxSpeed); // or exceed maxSpeed

  skyOffset  = orts.Util.increase(skyOffset,  skySpeed  * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  hillOffset = orts.Util.increase(hillOffset, hillSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
  treeOffset = orts.Util.increase(treeOffset, treeSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);

  if (position > playerZ) {
    if (currentLapTime && (startPosition < playerZ)) {
      lastLapTime    = currentLapTime;
      currentLapTime = 0;
/*
      if (lastLapTime <= orts.Util.toFloat(Dom.storage.fast_lap_time)) {
        Dom.storage.fast_lap_time = lastLapTime;
      }
*/
    }
    else {
      currentLapTime += dt;
    }
  }
}

//-------------------------------------------------------------------------

function updateCars(dt, playerSegment, playerW) {
  var n, car, oldSegment, newSegment;
  for(n = 0 ; n < cars.length ; n++) {
    car         = cars[n];
    oldSegment  = findSegment(car.z);
    car.offset  = car.offset + updateCarOffset(car, oldSegment, playerSegment, playerW);
    car.z       = orts.Util.increase(car.z, dt * car.speed, trackLength);
    car.percent = orts.Util.percentRemaining(car.z, segmentLength); // useful for interpolation during rendering phase
    newSegment  = findSegment(car.z);
    if (oldSegment !== newSegment) {
      var index = oldSegment.cars.indexOf(car);
      oldSegment.cars.splice(index, 1);
      newSegment.cars.push(car);
    }
  }
}

function updateCarOffset(car, carSegment, playerSegment, playerW) {

  var i, j, dir, segment, otherCar, otherCarW, lookahead = 20, carW = car.sprite.w * orts.SPRITES.SCALE;

  // optimization, dont bother steering around other cars when 'out of sight' of the player
  if ((carSegment.index - playerSegment.index) > drawDistance)
    return 0;

  for(i = 1 ; i < lookahead ; i++) {
    segment = segments[(carSegment.index+i)%segments.length];

    if ((segment === playerSegment) && (car.speed > speed) && (orts.Util.overlap(playerX, playerW, car.offset, carW, 1.2))) {
      if (playerX > 0.5)
        dir = -1;
      else if (playerX < -0.5)
        dir = 1;
      else
        dir = (car.offset > playerX) ? 1 : -1;
      return dir * 1/i * (car.speed-speed)/maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
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
        return dir * 1/i * (car.speed-otherCar.speed)/maxSpeed;
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

function render() {

  var baseSegment   = findSegment(position);
  var basePercent   = orts.Util.percentRemaining(position, segmentLength);
  var playerSegment = findSegment(position+playerZ);
  var playerPercent = orts.Util.percentRemaining(position+playerZ, segmentLength);
  var playerY       = orts.Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
  var maxy          = height;

  var x  = 0;
  var dx = - (baseSegment.curve * basePercent);

  ctx.clearRect(0, 0, width, height);

  orts.Render.background(ctx, background, width, height, orts.BACKGROUND.SKY,   skyOffset,  resolution * skySpeed  * playerY);
  orts.Render.background(ctx, background, width, height, orts.BACKGROUND.HILLS, hillOffset, resolution * hillSpeed * playerY);
  orts.Render.background(ctx, background, width, height, orts.BACKGROUND.TREES, treeOffset, resolution * treeSpeed * playerY);

  var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;

  for(n = 0 ; n < drawDistance ; n++) {

    segment        = segments[(baseSegment.index + n) % segments.length];
    segment.looped = segment.index < baseSegment.index;
    segment.fog    = orts.Util.exponentialFog(n/drawDistance, fogDensity);
    segment.clip   = maxy;

    orts.Util.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
    orts.Util.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

    x  = x + dx;
    dx = dx + segment.curve;

    if ((segment.p1.camera.z <= cameraDepth)         || // behind us
        (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
        (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
      continue;

    orts.Render.segment(ctx, width, lanes,
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

  for(n = (drawDistance-1) ; n > 0 ; n--) {
    segment = segments[(baseSegment.index + n) % segments.length];

    for(i = 0 ; i < segment.cars.length ; i++) {
      car         = segment.cars[i];
      sprite      = car.sprite;
      spriteScale = orts.Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
      spriteX     = orts.Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
      spriteY     = orts.Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
      orts.Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
    }

    for(i = 0 ; i < segment.sprites.length ; i++) {
      sprite      = segment.sprites[i];
      spriteScale = segment.p1.screen.scale;
      spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
      spriteY     = segment.p1.screen.y;
      orts.Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
    }

    if (segment === playerSegment) {
      orts.Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                    cameraDepth/playerZ,
                    width/2,
                    (height/2) - (cameraDepth/playerZ * orts.Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                    speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                    playerSegment.p2.world.y - playerSegment.p1.world.y);
    }
  }
}

function findSegment(z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}

//=========================================================================
// BUILD ROAD GEOMETRY
//=========================================================================

function lastY() { return (segments.length === 0) ? 0 : segments[segments.length-1].p2.world.y; }

function addSegment(curve, y) {
  var n = segments.length;
  segments.push({
      index: n,
         p1: { world: { y: lastY(), z:  n   *segmentLength }, camera: {}, screen: {} },
         p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {} },
      curve: curve,
    sprites: [],
       cars: [],
      color: Math.floor(n/rumbleLength)%2 ? orts.COLORS.DARK : orts.COLORS.LIGHT
  });
}

function addSprite(n, sprite, offset) {
  segments[n].sprites.push({ source: sprite, offset: offset });
}

function addRoad(enter, hold, leave, curve, y) {
  var startY   = lastY();
  var endY     = startY + (orts.Util.toInt(y, 0) * segmentLength);
  var n, total = enter + hold + leave;
  for(n = 0 ; n < enter ; n++)
    addSegment(orts.Util.easeIn(0, curve, n/enter), orts.Util.easeInOut(startY, endY, n/total));
  for(n = 0 ; n < hold  ; n++)
    addSegment(curve, orts.Util.easeInOut(startY, endY, (enter+n)/total));
  for(n = 0 ; n < leave ; n++)
    addSegment(orts.Util.easeInOut(curve, 0, n/leave), orts.Util.easeInOut(startY, endY, (enter+hold+n)/total));
}

var ROAD = {
  LENGTH: { NONE: 0, SHORT:  25, MEDIUM:   50, LONG:  100 },
  HILL:   { NONE: 0, LOW:    20, MEDIUM:   40, HIGH:   60 },
  CURVE:  { NONE: 0, EASY:    2, MEDIUM:    4, HARD:    6 }
};

function addStraight(num) {
  num = num || ROAD.LENGTH.MEDIUM;
  addRoad(num, num, num, 0, 0);
}

function addHill(num, height) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  height = height || ROAD.HILL.MEDIUM;
  addRoad(num, num, num, 0, height);
}

function addCurve(num, curve, height) {
  num    = num    || ROAD.LENGTH.MEDIUM;
  curve  = curve  || ROAD.CURVE.MEDIUM;
  height = height || ROAD.HILL.NONE;
  addRoad(num, num, num, curve, height);
}

function addLowRollingHills(num, height) {
  num    = num    || ROAD.LENGTH.SHORT;
  height = height || ROAD.HILL.LOW;
  addRoad(num, num, num,  0,                height/2);
  addRoad(num, num, num,  0,               -height);
  addRoad(num, num, num,  ROAD.CURVE.EASY,  height);
  addRoad(num, num, num,  0,                0);
  addRoad(num, num, num, -ROAD.CURVE.EASY,  height/2);
  addRoad(num, num, num,  0,                0);
}

function addSCurves() {
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM);
  addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
}

function addBumps() {
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -2);
  addRoad(10, 10, 10, 0, -5);
  addRoad(10, 10, 10, 0,  8);
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -7);
  addRoad(10, 10, 10, 0,  5);
  addRoad(10, 10, 10, 0, -2);
}

function addDownhillToEnd(num) {
  num = num || 200;
  addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY()/segmentLength);
}

function resetRoad() {
  segments = [];

  addStraight(ROAD.LENGTH.SHORT);
  addLowRollingHills(0, 0);
  addSCurves();
  addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
  addBumps();
  addLowRollingHills(0, 0);
  addCurve(ROAD.LENGTH.LONG*2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
  addStraight(0);
  addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
  addSCurves();
  addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
  addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
  addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
  addBumps();
  addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
  addStraight(0);
  addSCurves();
  addDownhillToEnd(0);

  resetSprites();
  resetCars();

  segments[findSegment(playerZ).index + 2].color = orts.COLORS.START;
  segments[findSegment(playerZ).index + 3].color = orts.COLORS.START;
  for(var n = 0 ; n < rumbleLength ; n++)
    segments[segments.length-1-n].color = orts.COLORS.FINISH;

  trackLength = segments.length * segmentLength;
}

function resetSprites() {
  var n, i;

  addSprite(20,  orts.SPRITES.BILLBOARD07, -1);
  addSprite(40,  orts.SPRITES.BILLBOARD06, -1);
  addSprite(60,  orts.SPRITES.BILLBOARD08, -1);
  addSprite(80,  orts.SPRITES.BILLBOARD09, -1);
  addSprite(100, orts.SPRITES.BILLBOARD01, -1);
  addSprite(120, orts.SPRITES.BILLBOARD02, -1);
  addSprite(140, orts.SPRITES.BILLBOARD03, -1);
  addSprite(160, orts.SPRITES.BILLBOARD04, -1);
  addSprite(180, orts.SPRITES.BILLBOARD05, -1);

  addSprite(240,                  orts.SPRITES.BILLBOARD07, -1.2);
  addSprite(240,                  orts.SPRITES.BILLBOARD06,  1.2);
  addSprite(segments.length - 25, orts.SPRITES.BILLBOARD07, -1.2);
  addSprite(segments.length - 25, orts.SPRITES.BILLBOARD06,  1.2);

  for(n = 10 ; n < 200 ; n += 4 + Math.floor(n/100)) {
    addSprite(n, orts.SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
    addSprite(n, orts.SPRITES.PALM_TREE,   1 + Math.random()*2);
  }

  for(n = 250 ; n < 1000 ; n += 5) {
    addSprite(n,     orts.SPRITES.COLUMN, 1.1);
    addSprite(n + orts.Util.randomInt(0,5), orts.SPRITES.TREE1, -1 - (Math.random() * 2));
    addSprite(n + orts.Util.randomInt(0,5), orts.SPRITES.TREE2, -1 - (Math.random() * 2));
  }

  for(n = 200 ; n < segments.length ; n += 3) {
    addSprite(n, orts.Util.randomChoice(orts.SPRITES.PLANTS), orts.Util.randomChoice([1,-1]) * (2 + Math.random() * 5));
  }

  var side, sprite, offset;
  for(n = 1000 ; n < (segments.length-50) ; n += 100) {
    side      = orts.Util.randomChoice([1, -1]);
    addSprite(n + orts.Util.randomInt(0, 50), orts.Util.randomChoice(orts.SPRITES.BILLBOARDS), -side);
    for(i = 0 ; i < 20 ; i++) {
      sprite = orts.Util.randomChoice(orts.SPRITES.PLANTS);
      offset = side * (1.5 + Math.random());
      addSprite(n + orts.Util.randomInt(0, 50), sprite, offset);
    }

  }

}

function resetCars() {
  cars = [];
  var car, segment, offset, z, sprite, speed;
  for (var n = 0 ; n < totalCars ; n++) {
    offset = Math.random() * orts.Util.randomChoice([-0.8, 0.8]);
    z      = Math.floor(Math.random() * segments.length) * segmentLength;
    sprite = orts.Util.randomChoice(orts.SPRITES.CARS);
    speed  = maxSpeed/4 + Math.random() * maxSpeed/(sprite === orts.SPRITES.SEMI ? 4 : 2);
    car = { offset: offset, z: z, sprite: sprite, speed: speed };
    segment = findSegment(car.z);
    segment.cars.push(car);
    cars.push(car);
  }
}

function reset(options) {
  options       = options || {};
  canvas.width  = width  = orts.Util.toInt(options.width,          width);
  canvas.height = height = orts.Util.toInt(options.height,         height);
  cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
  playerZ                = (cameraHeight * cameraDepth);
  resolution             = height/480;

  if ((segments.length === 0))
    resetRoad(); // only rebuild road when necessary
}

//=========================================================================
// THE GAME LOOP
//=========================================================================

orts.Game.run({
    canvas: canvas, render: render, update: update, step: step,
    images: ["background", "sprites"],
    keys: [
        { keys: [orts.KEY.LEFT,  orts.KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
        { keys: [orts.KEY.RIGHT, orts.KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
        { keys: [orts.KEY.UP,    orts.KEY.W], mode: 'down', action: function() { keyFaster = true;  } },
        { keys: [orts.KEY.DOWN,  orts.KEY.S], mode: 'down', action: function() { keySlower = true;  } },
        { keys: [orts.KEY.LEFT,  orts.KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
        { keys: [orts.KEY.RIGHT, orts.KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
        { keys: [orts.KEY.UP,    orts.KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
        { keys: [orts.KEY.DOWN,  orts.KEY.S], mode: 'up',   action: function() { keySlower = false; } }
    ],
    ready: function(images) {
        background = images[0];
        sprites    = images[1];
        reset({});
    }
});
