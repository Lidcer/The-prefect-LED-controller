import { EventEmitter } from "events";
import { random, sample } from "lodash";
import { MODES } from "../../shared/constants";
import { LedPattern, LedPatternItem } from "../../shared/interfaces";
import { Logger } from "../../shared/logger";
import { cloneDeep, removeFromArray } from "../../shared/utils";
import { LightSocket } from "./Socket";

export class PatternService {
    private ledPattern: LedPattern[] = [];
    private fetched = false;
    private eventEmitter = new EventEmitter();

    constructor(private lightSocket: LightSocket) {
        lightSocket.clientSocket.on("patterns-update", this.patternUpdate);
    }

    async fetchPattern(force = false) {
        if (this.fetched && !force) {
            return this.ledPattern;
        }
        try {
            const result = await this.lightSocket.emitPromiseIfPossible<LedPattern[], []>("patterns-get");
            this.ledPattern = result;
        } catch (error) {
            DEV && Logger.debug("Fetch pattern", error);
        }
        return this.ledPattern;
    }

    on(type: "update", listener: (patterns: LedPattern[]) => void): void;
    on(type: string, listener: (patterns: LedPattern[]) => void) {
        return this.eventEmitter.on(type, listener);
    }
    off(type: "update", listener: (patterns: LedPattern[]) => void): void;
    off(type: string, listener: (patterns: LedPattern[]) => void) {
        return this.eventEmitter.off(type, listener);
    }

    patternUpdate = (ledPattern: LedPattern[]) => {
        this.ledPattern = ledPattern;
        this.eventEmitter.emit("update", this.ledPattern);
    };

    update() {
        return this.lightSocket.emitPromiseIfPossible<any, [LedPattern[]]>("pattern-set", this.ledPattern);
    }
    get patterns() {
        return this.ledPattern;
    }

    setPattern(ledPattern: LedPattern) {
        const led = this.ledPattern.find(e => e.name === ledPattern.name);
        if (led) {
            led.ledPattern = ledPattern.ledPattern;
        } else {
            this.ledPattern.push(ledPattern);
        }
    }

    async sendPatterns() {
        await this.lightSocket.emitPromiseIfPossible<void, [LedPattern[]]>("patterns-set", this.ledPattern);
    }

    deletePattern(name: string) {
        const led = this.ledPattern.find(e => e.name === name);
        if (led) {
            removeFromArray(this.ledPattern, led);
        }
    }
    getRandomPatternItem() {
        const ledPattern: LedPatternItem = {
            delay: random(500, 1000),
            mode: sample(MODES),
            rgb: {
                r: random(0, 255),
                g: random(0, 255),
                b: random(0, 255),
            },
        };
        return ledPattern;
    }

    newPattern() {
        const name = "New pattern";
        const pattern: LedPattern = {
            ledPattern: [this.getRandomPatternItem()],
            name,
        };
        this.changeName(pattern, name);
        return pattern;
    }

    clonePattern(ledPattern: LedPattern) {
        const clone = cloneDeep(ledPattern);
        this.changeName(clone, clone.name);
        this.patterns.push(clone);
        return clone;
    }

    changeName(ledPattern: LedPattern, name: string) {
        if (!name) {
            return;
        }
        const originalName = name;
        let i = 1;
        while (this.patterns.find(e => e.name.toLowerCase() === name.toLowerCase())) {
            name = `${originalName} (${i})`;
            i++;
        }
        ledPattern.name = name;
    }
    destroy() {
        this.lightSocket.clientSocket.off("patterns-update", this.patternUpdate);
    }
}
