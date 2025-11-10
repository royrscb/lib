import { TimeSpan } from "./timespan";

/**
 * Possible storage actions.
 * - 'set'     : a key was created or updated.
 * - 'remove'  : a key was removed.
 * - 'clear'   : all keys were removed.
 * - 'expired' : a key expired and was automatically deleted.
 */
export type StorageAction = 'set' | 'remove' | 'clear' | 'expired';

// eslint-disable-next-line no-unused-vars
/**
 * Callback for storage events.
 * @param change - Describes the change (action, key, value).
 * @param eventName - Name of the event triggered.
 */
export type StorageEventCallback = (change: StorageChange, eventName: string) => void;

/**
 * Describes a storage change.
 * - action: the type of change.
 * - key   : the affected key (optional).
 * - value : the associated value (optional, e.g. for 'set').
 */
export interface StorageChange {
    action: StorageAction;
    key?: string;
    value?: any;
}

/**
 * High-level wrapper for `localStorage` with:
 * - automatic expiration handling
 * - event-based change notifications
 * - typed helper methods.
 *
 * Notes:
 * - Expiration times are stored under `_STORAGE_EXPIRATION_TIMES`.
 * - Custom events are dispatched via `window.dispatchEvent`.
 */
export const storage = {
    /** Internal key where expiration times are stored. */
    EXPIRATION_TIMES_KEY: '_STORAGE_EXPIRATION_TIMES',

    /**
     * Removes expired keys from localStorage.
     * If a specific key is provided, only that key is checked.
     * @param key - Key to check (optional).
     */
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

                this.dispatchEvent({ action: 'expired', key });
            }
        });
    },

    /**
     * Returns the expiration date for a given key.
     * Returns `undefined` if there is no expiration set.
     * @param key - Storage key to check.
     * @returns Expiration date or undefined.
     */
    getExpirationDate(key: string): Date | undefined {
        this.cleanupExpired(key);
        const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};

        return expirationTimes[key];
    },

    /**
     * Returns a `TimeSpan` representing the remaining time until expiration.
     * If the key has no expiration, returns `TimeSpan.infinite()`.
     * @param key - Storage key.
     * @returns Remaining lifespan as a TimeSpan.
     */
    getLifespan(key: string): TimeSpan {
        const expDate = this.getExpirationDate(key);
        return expDate ? TimeSpan.untilNow(expDate)
            : TimeSpan.infinite();
    },

    /**
     * Reads the value from localStorage for the given key.
     * Automatically cleans up expired keys first.
     * @param key - Storage key.
     * @returns Parsed value or null if not found.
     */
    get(key: string): any {
        this.cleanupExpired(key);
        return read(key);
    },

    /**
     * Writes a value to localStorage with an optional expiration time.
     * - If the lifespan is not positive, nothing is written.
     * - If lifespan is finite, an expiration timestamp is stored.
     * Dispatches a 'set' event after writing.
     * @param key - Storage key.
     * @param value - Value to store (JSON-serialized).
     * @param lifespan - Optional lifespan duration (default: infinite).
     */
    set(key: string, value: any, lifespan: TimeSpan = TimeSpan.infinite()): void {
        if (lifespan.isPositive()) {
            write(key, value);
            if (!lifespan.isInfinite()) {
                const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};
                expirationTimes[key] = Date.now() + lifespan.totalMillis();
                write(this.EXPIRATION_TIMES_KEY, expirationTimes);
            }

            this.dispatchEvent({ action: 'set', key, value });
        }
        this.cleanupExpired(key);
    },

    /**
     * Removes a key from localStorage and its expiration entry.
     * Dispatches a 'remove' event.
     * @param key - Storage key to remove.
     */
    remove(key: string): void {
        localStorage.removeItem(key);
        const expirationTimes = read(this.EXPIRATION_TIMES_KEY) ?? {};
        delete expirationTimes[key];
        write(this.EXPIRATION_TIMES_KEY, expirationTimes);

        this.dispatchEvent({ action: 'remove', key });
    },

    /**
     * Checks if a key exists in localStorage (after cleaning expired ones).
     * @param key - Storage key.
     * @returns True if the key exists.
     */
    exists(key: string): boolean {
        this.cleanupExpired(key);
        return Object.keys(localStorage).includes(key);
    },

    /**
     * Logs all localStorage entries to the console,
     * sorted by lifespan and key name.
     * Expiring items are displayed with their remaining time.
     */
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
                } else {
                    console.log(`%c${entry.key}:`, 'font-weight: bold; font-size: 12px', entry.value);
                }
            });
    },

    /**
     * Clears all keys from localStorage and dispatches a 'clear' event.
     */
    clear(): void {
        localStorage.clear();
        this.dispatchEvent({ action: 'clear' });
    },

    /** Internal function reference for event name generation. */
    eventName: eventName,

    /**
     * Dispatches a custom event representing a storage change.
     * Generates event names based on the type and key.
     * @param change - Storage change data.
     */
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

    /** Subscribes to all storage events. */
    onChange(callback: StorageEventCallback): void {
        addListener(eventName(), callback);
    },

    /** Unsubscribes from all storage events. */
    offChange(callback: StorageEventCallback): void {
        removeListener(eventName(), callback);
    },

    /** Subscribes to a specific action type (e.g., 'set', 'remove'). */
    onAction(action: StorageAction, callback: StorageEventCallback): void {
        addListener(eventName(action), callback);
    },

    /** Unsubscribes from a specific action type. */
    offAction(action: StorageAction, callback: StorageEventCallback): void {
        removeListener(eventName(action), callback);
    },

    /** Subscribes to changes for a specific key. */
    onChangeKey(key: string, callback: StorageEventCallback): void {
        addListener(eventName(key), callback);
    },

    /** Unsubscribes from changes for a specific key. */
    offChangeKey(key: string, callback: StorageEventCallback): void {
        removeListener(eventName(key), callback);
    },

    /** Subscribes to a specific action for a specific key. */
    onActionForKey(action: StorageAction, key: string, callback: StorageEventCallback): void {
        addListener(eventName(action, key), callback);
    },

    /** Unsubscribes from a specific action for a specific key. */
    offActionForKey(action: StorageAction, key: string, callback: StorageEventCallback): void {
        removeListener(eventName(action, key), callback);
    },
};

function addListener(eventName: string, callback: StorageEventCallback) {
    const wrapped = (e: Event) => {
        const detail = (e as CustomEvent<StorageChange>).detail;
        if (detail) callback(detail, eventName);
    };
    const meta = (callback as any).__storageListeners ??= {};
    meta[eventName] = wrapped;
    window.addEventListener(eventName, wrapped);
}

function removeListener(eventName: string, callback: StorageEventCallback) {
    const meta = (callback as any).__storageListeners;
    if (!meta) return;
    const wrapped = meta[eventName];
    if (!wrapped) return;

    window.removeEventListener(eventName, wrapped);
    delete meta[eventName];

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
    if (value === null) return null;

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
