
import * as orts from '..'

// =========================================================================
// GAME LOOP helpers
// =========================================================================

export var Game = {

    run: function() {

        const outRun :orts.OutRun = new orts.OutRun();
        const options :any = {
            canvas: outRun.canvas, render: outRun.render, update: outRun.update, step: outRun.step,
            ready: (images:string[]) :void => {

                outRun.background = images[ 'background.png' ];
                outRun.sprites    = images[ 'sprites.png' ];


                outRun.reset({});
            }
        };

        const imagesToLoad = [
            'background.png',
            'sprites.png',
        ];

        // TODO merge these two systems

        // browse all sprites



        // browse all backgrounds





        Game.loadImages(
            imagesToLoad,
            function(images) {

            options.ready(images); // tell caller to initialize itself because images are loaded and we're ready to rumble

            // var canvas = options.canvas,    // canvas render target is provided by caller
            var update = options.update;    // method to update game logic is provided by caller
            var render = options.render;    // method to render the game is provided by caller
            var step   = options.step;      // fixed frame step (1/fps) is specified by caller
            var now    = null;
            var last   = orts.Util.timestamp();
            var dt     = 0;
            var gdt    = 0;

            function frame() {
                now = orts.Util.timestamp();
                dt  = Math.min(1, (now - last) / 1000); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
                gdt = gdt + dt;
                while (gdt > step) {
                    gdt = gdt - step;
                    update(step);
                }
                render();
                last = now;
                requestAnimationFrame( frame );
            }
            frame(); // lets get this party started
        });
    },

    loadImages: function(names, callback) { // load multiple images and callback when ALL images have loaded
        var result = [];
        var count  = names.length;

        var onload = function() {
            if (--count === 0)
                callback(result);
        };

        for (let n = 0 ; n < names.length ; n++)
        {
            const name = names[n];

            result[name] = document.createElement('img');
            result[name].addEventListener( 'load', onload );
            result[name].src = 'res/image/legacy/' + name;
        }
    },
};
