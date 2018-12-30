
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   canvas rendering helpers.
    *******************************************************************************************************************/
    export class Render
    {
        public static rect( ctx:CanvasRenderingContext2D, left, top, width, height, color ) : void
        {
            ctx.fillStyle = color;
            ctx.fillRect( left, top, width, height );
        }

        public static polygon( ctx, x1, y1, x2, y2, x3, y3, x4, y4, color ) : void
        {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.closePath();
            ctx.fill();
        }

        public static segment( ctx, width, lanes, x1, y1, w1, x2, y2, w2, fog, color ) : void
        {
            var r1 = Render.rumbleWidth(w1, lanes),
                r2 = Render.rumbleWidth(w2, lanes),
                l1 = Render.laneMarkerWidth(w1, lanes),
                l2 = Render.laneMarkerWidth(w2, lanes),
                lanew1, lanew2, lanex1, lanex2, lane;

            ctx.fillStyle = color.grass;
            ctx.fillRect(0, y2, width, y1 - y2);

            Render.polygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
            Render.polygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
            Render.polygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);

            if (color.lane) {
                lanew1 = w1*2/lanes;
                lanew2 = w2*2/lanes;
                lanex1 = x1 - w1 + lanew1;
                lanex2 = x2 - w2 + lanew2;
                for (lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
                {
                    Render.polygon(ctx, lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, color.lane);
                }
            }

            Render.fog( ctx, 0, y1, width, y2-y1, fog );
        }

        public static background( ctx, width, height, sprite, rotation, offset ) : void
        {
            const image = orts.Main.game.imageSystem.getImage( sprite );

            rotation = rotation || 0;
            offset   = offset   || 0;

            var imageW = image.width / 2;
            var imageH = image.height;

            var sourceX = 0 + Math.floor( image.width * rotation );
            var sourceY = 0;
            var sourceW = Math.min( imageW, 0 + image.width - sourceX );
            var sourceH = imageH;

            var destX = 0;
            var destY = offset;
            var destW = Math.floor( width * ( sourceW / imageW ) );
            var destH = height;

            ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
            if ( sourceW < imageW )
            {
                ctx.drawImage(image, 0, sourceY, imageW - sourceW, sourceH, destW - 1, destY, width - destW, destH);
            }
        }

        public static sprite( ctx, width, height, resolution, roadWidth, sprite, scale, destX, destY, offsetX, offsetY, clipY ) : void
        {
            const image = orts.Main.game.imageSystem.getImage( sprite );

            //  scale for projection AND relative to roadWidth (for tweakUI)
            var destW  = (image.width  * scale * width/2) * (orts.SettingGame.SPRITE_SCALE * roadWidth);
            var destH  = (image.height * scale * width/2) * (orts.SettingGame.SPRITE_SCALE * roadWidth);

            destX = destX + (destW * (offsetX || 0));
            destY = destY + (destH * (offsetY || 0));

            var clipH = clipY ? Math.max(0, destY+destH-clipY) : 0;
            if (clipH < destH)
            {
                ctx.drawImage(image, 0, 0, image.width, image.height - (image.height * clipH/destH), destX, destY, destW, destH - clipH);
            }
        }

        public static player( ctx, width, height, resolution, roadWidth, speedPercent, scale, destX, destY, steer, updown ) : void
        {
            var bounce = (1.5 * Math.random() * speedPercent * resolution) * orts.MathUtil.randomChoice([-1,1]);
            var sprite;
            if (steer < 0)
            {
                sprite = (updown > 0) ? orts.ImageFile.PLAYER_UPHILL_LEFT : orts.ImageFile.PLAYER_LEFT;
            }
            else if (steer > 0)
            {
                sprite = (updown > 0) ? orts.ImageFile.PLAYER_UPHILL_RIGHT : orts.ImageFile.PLAYER_RIGHT;
            }
            else
            {
                sprite = (updown > 0) ? orts.ImageFile.PLAYER_UPHILL_STRAIGHT : orts.ImageFile.PLAYER_STRAIGHT;
            }

            Render.sprite(ctx, width, height, resolution, roadWidth, sprite, scale, destX, destY + bounce, -0.5, -1, 0);
        }

        public static fog( ctx, x, y, width, height, fog ) : void
        {
            if ( fog < 1 ) {
                ctx.globalAlpha = ( 1 - fog );
                ctx.fillStyle = orts.SettingColor.FOG;
                ctx.fillRect(x, y, width, height);
                ctx.globalAlpha = 1;
            }
        }

        public static rumbleWidth( projectedRoadWidth, lanes ) : number
        {
            return ( projectedRoadWidth / Math.max( 6,  2 * lanes ) );
        }

        public static laneMarkerWidth( projectedRoadWidth, lanes ) : number
        {
            return ( projectedRoadWidth / Math.max( 32, 8 * lanes ) );
        }
    }
