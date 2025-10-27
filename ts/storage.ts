import { TimeSpan } from "./timespan";

export const storage = {
    EXPIRATION_TIMES_KEY: '_STORAGE_EXPIRATION_TIMES',
    cleanupExpired(key?: string): void {
        const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};

        const keysToCheck = key !== undefined ? [key]
            : Object.keys(expirationTimes);

        let expTimesChanged = false;
        keysToCheck.forEach(key => {
            const expTime = expirationTimes[key] ?? Infinity;
            if (expTime < Date.now()) {
                localStorage.removeItem(key);
                delete expirationTimes[key];
                expTimesChanged = true;
            }
        });

        if (expTimesChanged) {
            write(this.EXPIRATION_TIMES_KEY, expirationTimes);
        }
    },
    getExpirationDate(key: string): Date | undefined {
        this.cleanupExpired(key);
        const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};

        return expirationTimes[key];
    },
    getLifespan(key: string): TimeSpan {
        const expDate = this.getExpirationDate(key);
        return expDate ? TimeSpan.untilNow(expDate)
            : TimeSpan.infinite();
    },
    get(key: string): any {
        this.cleanupExpired(key);
        return read(key);
    },
    set(key: string, value: any, lifespan:TimeSpan = TimeSpan.infinite()): void {
        if (lifespan.isPositive()) {
            write(key, value);
            if (!lifespan.isInfinite()) {
                const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};
                expirationTimes[key] = Date.now() + lifespan.totalMillis();
                write(this.EXPIRATION_TIMES_KEY, expirationTimes);
            }
        }
        this.cleanupExpired(key);
    },
    remove(key: string): void {;
        localStorage.removeItem(key);
        const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};
        delete expirationTimes[key];
        write(this.EXPIRATION_TIMES_KEY, expirationTimes);
    },
    exists(key: string): boolean {
        this.cleanupExpired(key);
        return Object.keys(localStorage).includes(key);
    },
    list(): void {
        this.cleanupExpired();

        console.log("%cLocal storage", 'font-size: 22px');
        Object.keys(localStorage)
            .map(key => ({
                key: key,
                value: read(key),
                lifespan: this.getLifespan(key)
            }))
            .sort((a, b) =>
                TimeSpan.sortByAscending(a.lifespan, b.lifespan)
                || a.key.localeCompare(b.key)
            )
            .forEach(entry => {
                if (!entry.lifespan.isInfinite()) {
                    console.log(`%c${entry.key} %c[${entry.lifespan}]%c:`, 'font-weight: bold; font-size: 12px', 'color: #ecc32cff', 'color: black', entry.value);
                }
                else {
                    console.log(`%c${entry.key}:`, 'font-weight: bold; font-size: 12px', entry.value);
                }
            });
    },
    clear(): void {
        localStorage.clear();
    }
};

localStorage.__proto__['list'] = function() {
    storage.list();
};

function read(key: string): any {
    const value = localStorage.getItem(key);

    if (value === null)
        return null;

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}
function write(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
}