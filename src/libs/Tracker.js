class Tracker {
    constructor(player, target, callback) {
        this.player = player;
        this.target = target;
        this.callback = callback;

        this.timer = null;
    }

    start = () => {
        this.timer = setInterval(() => this.check(), 200);
    }

    check = () => {
        if (!this.player) {
            return;
        }
        var promise = Promise.resolve(this.player.getCurrentTime());

        promise.then(currentTime => {
            currentTime = parseInt(currentTime, 10);
            console.log(currentTime, this.target);
            if (this.target > (currentTime - 1) && this.target < (currentTime + 1)) {
                this.cancel();
                this.callback();
            }
        });
    }

    cancel = () => {
        clearInterval(this.timer); // idempotent
    }

    //TODO check up on garbage collector 
    destroy = () => {
        this.cancel();
        this.player = null;
        this.callback = null;
        this.timer = null;
    }

}

export default Tracker;