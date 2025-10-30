import { TimeSpan } from "./timespan";

export type StorageAction = 'set' | 'remove' | 'clear' | 'expired';
// eslint-disable-next-line no-unused-vars
export type StorageEventCallback = (change: StorageChange, eventName: string) => void;

export interface StorageChange {
    action: StorageAction;
    key?: string;
    value?: any;
}


export const storage = {
    EXPIRATION_TIMES_KEY: '_STORAGE_EXPIRATION_TIMES',

    cleanupExpired(key?: string): void {
        const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};

        const keysToCheck = key !== undefined ? [key]
            : Object.keys(expirationTimes);

        keysToCheck.forEach(key => {
            const expTime = expirationTimes[key] ?? Infinity;
            if (expTime < Date.now()) {
                localStorage.removeItem(key);
                delete expirationTimes[key];
                write(this.EXPIRATION_TIMES_KEY, expirationTimes);

                this.dispatchEvent({action: 'expired', key});
            }
        });
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

            this.dispatchEvent({action: 'set', key, value});
        }
        this.cleanupExpired(key);
    },
    remove(key: string): void {;
        localStorage.removeItem(key);
        const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};
        delete expirationTimes[key];
        write(this.EXPIRATION_TIMES_KEY, expirationTimes);

        this.dispatchEvent({action: 'remove', key});
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
        this.dispatchEvent({action: 'clear'});
    },

    eventName: eventName,
    dispatchEvent(change: StorageChange) {
        const eventNamesToTrigger = [
            eventName(),
            eventName(change.action),
        ];
        if (change.key) {
            eventNamesToTrigger.push(eventName(change.key));
            eventNamesToTrigger.push(eventName(change.action, change.key));
        }
        eventNamesToTrigger.forEach(eventName => {
            window.dispatchEvent(new CustomEvent<StorageChange>(eventName, { detail: change }));
        });
    },
    onChange(callback: StorageEventCallback): void {
        addListener(eventName(), callback);
    },
    offChange(callback: StorageEventCallback): void {
        removeListener(eventName(), callback);
    },

    onAction(action: StorageAction, callback: StorageEventCallback): void {
        addListener(eventName(action), callback);
    },
    offAction(action: StorageAction, callback: StorageEventCallback): void {
        removeListener(eventName(action), callback);
    },

    onChangeKey(key: string, callback: StorageEventCallback): void {
        addListener(eventName(key), callback);
    },
    offChangeKey(key: string, callback: StorageEventCallback): void {
        removeListener(eventName(key), callback);
    },

    onActionForKey(action: StorageAction, key: string, callback: StorageEventCallback): void {
        addListener(eventName(action, key), callback);
    },
    offActionForKey(action: StorageAction, key: string, callback: StorageEventCallback): void {
        removeListener(eventName(action, key), callback);
    },
};

// eslint-disable-next-line no-unused-vars
function addListener(eventName: string, callback: StorageEventCallback) {
    // wrapper que extrae detail y llama al callback
    const wrapped = (e: Event) => {
        const detail = (e as CustomEvent<StorageChange>).detail;
        if (detail) callback(detail, eventName);
    };

    // asignamos referencia para poder quitar luego
    const meta = (callback as any).__storageListeners ??= {};
    meta[eventName] = wrapped;

    window.addEventListener(eventName, wrapped);
}
// eslint-disable-next-line no-unused-vars
function removeListener(eventName: string, callback: StorageEventCallback) {
    const meta = (callback as any).__storageListeners;
    if (!meta) return;
    const wrapped = meta[eventName];
    if (!wrapped) return;

    window.removeEventListener(eventName, wrapped);
    delete meta[eventName];

    // si no quedan listeners asociados al callback, borramos la propiedad
    if (Object.keys(meta).length === 0) delete (callback as any).__storageListeners;
}

function eventName(): string;
// eslint-disable-next-line no-redeclare, no-unused-vars
function eventName(action: StorageAction): string;
// eslint-disable-next-line no-redeclare, no-unused-vars
function eventName(key: string): string;
// eslint-disable-next-line no-redeclare, no-unused-vars
function eventName(action: StorageAction, key: string): string;
// eslint-disable-next-line no-redeclare
function eventName(arg1?: StorageAction | string, arg2?: string): string {
    const name = 'storage-change';

    if (arg1 === undefined)
        return name;

    if (arg2 === undefined)
        return `${name}-${arg1}`;

    return `${name}-${arg1}-${arg2}`;
}


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

localStorage.__proto__['list'] = function() {
    storage.list();
};