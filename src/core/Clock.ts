type TimerCallback = (arg0: string) => void;

export default class Clock {

    private readonly _onTickCallback: TimerCallback;
    private _elapsedSeconds: number;

    constructor(onTickCallback: TimerCallback) {
        this._onTickCallback = onTickCallback;
        this._elapsedSeconds = 0;
    }

    Run(): void {
        setInterval(() => {
            let now = new Date();
            this._onTickCallback(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
        }, 1000);
    }

}