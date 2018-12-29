
    import * as orts from '..'

    /** ****************************************************************************************************************
    *   GAME LOOP helpers
    *******************************************************************************************************************/
    export class Game
    {
        outRun :orts.OutRun = null;

        run()
        {
            this.outRun = new orts.OutRun();

            const options :any = {
                render: this.outRun.render,
                update: this.outRun.update,
                step: this.outRun.step,
            };

            this.outRun.reset();

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
        };
    }
