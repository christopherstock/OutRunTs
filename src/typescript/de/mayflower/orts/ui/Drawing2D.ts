
    import * as orts from '../index'

    /** ****************************************************************************************************************
    *   canvas rendering helpers.
    *******************************************************************************************************************/
    // tslint:disable:max-line-length
    export class Drawing2D
    {
        public static rect( ctx:CanvasRenderingContext2D, left:number, top:number, width:number, height:number, color:string ) : void
        {
            ctx.fillStyle = color;
            ctx.fillRect( left, top, width, height );
        }

        public static polygon( ctx:CanvasRenderingContext2D, x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number, color:string ) : void
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

        public static segment( ctx:CanvasRenderingContext2D, width:number, lanes:number, x1:number, y1:number, w1:number, x2:number, y2:number, w2:number, fog:number, color:any ) : void
        {
            const r1 :number = Drawing2D.rumbleWidth(w1, lanes);
            const r2 :number = Drawing2D.rumbleWidth(w2, lanes);
            const l1 :number = Drawing2D.laneMarkerWidth(w1, lanes);
            const l2 :number = Drawing2D.laneMarkerWidth(w2, lanes);

            let lanew1 :number = 0;
            let lanew2 :number = 0;
            let lanex1 :number = 0;
            let lanex2 :number = 0;

            ctx.fillStyle = color.grass;
            ctx.fillRect(0, y2, width, y1 - y2);

            Drawing2D.polygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
            Drawing2D.polygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
            Drawing2D.polygon(ctx, x1-w1,    y1, x1+w1, y1, x2+w2, y2, x2-w2,    y2, color.road);

            if (color.lane) {
                lanew1 = w1*2/lanes;
                lanew2 = w2*2/lanes;
                lanex1 = x1 - w1 + lanew1;
                lanex2 = x2 - w2 + lanew2;
                for ( let lane:number = 1; lane < lanes; lane++)
                {
                    Drawing2D.polygon(ctx, lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, color.lane);

                    lanex1 += lanew1;
                    lanex2 += lanew2;
                }
            }

            Drawing2D.fog( ctx, 0, y1, width, y2-y1, fog );
        }

        public static background( ctx:CanvasRenderingContext2D, width:number, height:number, sprite:string, rotation:number, offset:number ) : void
        {
            const image:HTMLImageElement = orts.Main.game.imageSystem.getImage( sprite );

            rotation = rotation || 0;
            offset   = offset   || 0;

            const imageW:number = image.width / 2;
            const imageH:number = image.height;

            const sourceX:number = Math.floor( image.width * rotation );
            const sourceY:number = 0;
            const sourceW:number = Math.min( imageW, image.width - sourceX );
            const sourceH:number = imageH;

            const destX:number = 0;
            const destY:number = offset;
            const destW:number = Math.floor( width * ( sourceW / imageW ) );
            const destH:number = height;

            ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
            if ( sourceW < imageW )
            {
                ctx.drawImage(image, 0, sourceY, imageW - sourceW, sourceH, destW - 1, destY, width - destW, destH);
            }
        }

        public static sprite( ctx:CanvasRenderingContext2D, width:number, height:number, resolution:number, roadWidth:number, sprite:string, scale:number, destX:number, destY:number, offsetX:number, offsetY:number, clipY:number ) : void
        {
            const image:HTMLImageElement = orts.Main.game.imageSystem.getImage( sprite );

            //  scale for projection AND relative to roadWidth (for tweakUI)
            const destW:number  = (image.width  * scale * width/2) * (orts.SettingGame.SPRITE_SCALE * roadWidth);
            const destH:number  = (image.height * scale * width/2) * (orts.SettingGame.SPRITE_SCALE * roadWidth);

            destX = destX + (destW * (offsetX || 0));
            destY = destY + (destH * (offsetY || 0));

            const clipH:number = clipY ? Math.max( 0, destY + destH - clipY ) : 0;
            if (clipH < destH)
            {
                ctx.drawImage(image, 0, 0, image.width, image.height - (image.height * clipH/destH), destX, destY, destW, destH - clipH);
            }
        }

        public static player( ctx:CanvasRenderingContext2D, width:number, height:number, resolution:number, roadWidth:number, speedPercent:number, scale:number, destX:number, destY:number, steer:number, updown:number ) : void
        {
            const bounce :number = ( 1.5 * Math.random() * speedPercent * resolution ) * orts.MathUtil.randomChoice( [ -1, 1 ] );
            let   sprite :string;

            if ( steer < 0 )
            {
                sprite = ( updown > 0 ) ? orts.ImageFile.PLAYER_UPHILL_LEFT : orts.ImageFile.PLAYER_LEFT;
            }
            else if ( steer > 0 )
            {
                sprite = ( updown > 0 ) ? orts.ImageFile.PLAYER_UPHILL_RIGHT : orts.ImageFile.PLAYER_RIGHT;
            }
            else
            {
                sprite = ( updown > 0 ) ? orts.ImageFile.PLAYER_UPHILL_STRAIGHT : orts.ImageFile.PLAYER_STRAIGHT;
            }

            Drawing2D.sprite( ctx, width, height, resolution, roadWidth, sprite, scale, destX, destY + bounce, -0.5, -1, 0 );
        }

        public static fog( ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number, fog:number ) : void
        {
            if ( fog < 1 ) {
                ctx.globalAlpha = ( 1 - fog );
                ctx.fillStyle = orts.SettingColor.FOG;
                ctx.fillRect(x, y, width, height);
                ctx.globalAlpha = 1;
            }
        }

        public static rumbleWidth( projectedRoadWidth:number, lanes:number ) : number
        {
            return ( projectedRoadWidth / Math.max( 6,  2 * lanes ) );
        }

        public static laneMarkerWidth( projectedRoadWidth:number, lanes:number ) : number
        {
            return ( projectedRoadWidth / Math.max( 32, 8 * lanes ) );
        }
    }
