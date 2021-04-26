export function cloneDeep<A>(object: A) {
    return JSON.parse(JSON.stringify(object)) as A;
}

export function getClosest(counts: number[], goal: number) {
    return counts.reduce((prev, curr) => {
        return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
    });
}

export function randomString(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function removeFromArray<I = any>(array: I[], item: I): boolean {
    const indexOf = array.indexOf(item);

    if (indexOf === -1) {
        return false;
    }

    array.splice(indexOf, 1);
    return true;
}
export function includes<I = any>(array: I[], item: I): boolean {
    return array.indexOf(item) !== -1;
}

export function pushUniqToArray<I = any>(array: I[], item: I): boolean {
    const indexOf = array.indexOf(item);

    if (indexOf === -1) {
        array.push(item);
        return true;
    }
    return false;
}

export class Stringify {
    private readonly MAX_DEPTH = 100;
    private _result: any;
    private map = new Map<any, string>();
    constructor(private anything: any, private ignoreEmpty: boolean) {}
    private process() {
        if (this._result) return this._result;
        this._result = this.stringify(this.anything);
        return this._result;
    }

    private stringify(something: any): string {
        if (this.map.size === this.MAX_DEPTH) return "<Failed: object to large>";
        const r = this.map.get(something);
        if (r) return r;
        if (something === null) return "null";
        const type = typeof something;
        switch (type) {
            case "string":
                return something;
            case "number":
            case "bigint":
                return (something as number | bigint).toString();
            case "undefined":
                return "undefined";
            case "symbol":
                return "Symbol()";
            case "function":
                const fun = something as Function;
                try {
                    const name = fun.name || "<anonymous>";
                    return `${name}()`;
                } catch (error) {
                    return `function();`;
                }
            case "object":
                this.map.set(something, "<repeated>");
                if (Array.isArray(something)) {
                    if (something.length === 0) {
                        const result = this.ignoreEmpty ? "" : "[]";
                        this.map.set(something, result);
                        return result;
                    }
                    const result = `[\n${something.map(e => `   ${this.stringify(e)}`).join("\n")}]\n`;
                    this.map.set(something, result);
                    return result;
                }
                try {
                    const keys = Object.keys(something);
                    if (keys.length === 0) {
                        const result = this.ignoreEmpty ? "" : "{}";
                        this.map.set(something, result);
                        return result;
                    }

                    const mapped = keys.map(k => `${k} : ${this.stringify(something[k])}`).join("\n");
                    const result = `{\n${mapped}\n}`;
                    this.map.set(something, result);
                    return result;
                } catch (error) {
                    return `<Failed: ${error.message}>`;
                }
            default:
                return "<unknown>";
        }
    }

    get result() {
        return this._result;
    }

    static do(something: any, ignoreEmpty = false) {
        const string = new Stringify(something, ignoreEmpty);
        return string.process();
    }
}

export function toInt(number: any, fallback = 0) {
    const type = typeof number;
    switch (type) {
        case "bigint":
        case "number":
            return Math.round(number);
        case "string":
            const parsed = parseInt(number);
            return isNaN(parsed) ? fallback : parsed;
    }

    return fallback;
}

export function range(iterations: number, callback: (i: number) => void) {
    for (let i = 0; i < iterations; i++) {
        callback(i);
    }
}

export function array<T = any>(length: number, value: (index: number) => T): T[] {
    const arr: T[] = [];
    for (let i = 0; i < length; i++) {
        arr[i] = value(i);
    }
    return arr;
}

export function sleep(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export function getDayString(date: Date) {
    const dateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
    return dateString;
}
