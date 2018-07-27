class Tracker {
    constructor(player, targetTime, callback, interval = 200) {
        this.player = player;
        this.targetTime = targetTime;
        this.callback = callback;
        this.interval = interval;

        this.timer = null;
    }

    start = () => {
        this.timer = setInterval(() => this.check(), this.interval);
    }

    check = () => {
        if (!this.player) {
            return;
        }
        var promise = Promise.resolve(this.player.getCurrentTime());

        promise.then(currentTime => {
            currentTime = parseInt(currentTime, 10);
            console.log(currentTime, this.targetTime);
            if (this.targetTime > (currentTime - 1) && this.targetTime < (currentTime + 1)) {
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