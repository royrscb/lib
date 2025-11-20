// Author: royrscb.com
//-***********************************************************************************
//- Build command in this file dir: tsc && sed -i '/^\/\/-/d' ../../js/extensions.js *
//- The second part is to delete this 5 lines comment                                *
//- Output will go to "./tsconfig.json".compilerOptions.outDir                       *
//-***********************************************************************************

//#region Number ----------------------------------------------------------------------------------

/**
 * Rounds the number to the given number of decimals.
 * @param decimals Number of decimal places (default 0)
 * @returns Rounded number
 */
Object.defineProperty(Number.prototype, 'round', {
    value: function(this: number, decimals: number = 0): number {
        const factor = Math.pow(10, decimals);
        return Math.round(this * factor) / factor;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Formats the number as a price string, showing 2 decimals if needed.
 * @returns Price string, e.g. "10" or "10.50"
 */
Object.defineProperty(Number.prototype, 'prettyPrice', {
    value: function(this: number): string {
        const price = Math.round(this*100)/100;
        return Number.isInteger(price) ? price.toString() : price.toFixed(2);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

//#endregion

//#region String ----------------------------------------------------------------------------------

/**
 * Checks if the string is empty.
 * @returns true if string has no length, false otherwise
 */
Object.defineProperty(String.prototype, 'isEmpty', {
    value: function<T>(this: T[]) {
        return this.length == 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Converts the string to a number and rounds it.
 * @param decimals Number of decimal places (default 0)
 * @throws Error if the string cannot be parsed to a number
 * @returns Rounded number
 */
Object.defineProperty(String.prototype, 'round', { 
    value: function(this: string, decimals: number = 0): number {
        const floatNumber = parseFloat(this);
        if (Number.isNaN(floatNumber))
            throw new Error(`String "${this}" can not be parsed into a float`);
        return floatNumber.round(decimals);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Capitalizes the first letter of the string.
 * @returns String with the first character uppercase
 */
Object.defineProperty(String.prototype, 'upperCaseFirst', {
    value: function(this: string): string {
        return this.length == 0 ? ''
            : this[0].toUpperCase() + this.slice(1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Capitalizes words conditionally.
 * Words with length >= minLengthToUpperCaseFirst are capitalized.
 * @param minLengthToUpperCaseFirst Minimum length for words to capitalize (default 4)
 * @returns String with words capitalized according to rule
 */
Object.defineProperty(String.prototype, 'prettyUpperCase', {
    value: function(this: string, minLengthToUpperCaseFirst: number = 4): string {
        return this
            .toLowerCase()
            .upperCaseFirst()
            .split(' ')
            .map(w => w.length < minLengthToUpperCaseFirst ? w : w.upperCaseFirst())
            .join(' ');
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Formats the number as a price string, showing 2 decimals if needed.
 * @throws Error if the string cannot be parsed to a number
 * @returns Price string, e.g. "10" or "10.50"
 */
Object.defineProperty(String.prototype, 'prettyPrice', { 
    value: function(this: string): string {
        const floatNumber = parseFloat(this);
        if (Number.isNaN(floatNumber))
            throw new Error(`String "${this}" can not be parsed into a float`);
        return floatNumber.prettyPrice();
    },
    writable: false,
    configurable: false,
    enumerable: false
});

//#endregion

//#region Array -----------------------------------------------------------------------------------

/**
 * Checks if the array is empty.
 * @returns true if array has no elements, false otherwise
 */
Object.defineProperty(Array.prototype, 'isEmpty', {
    value: function<T>(this: T[]) {
        return this.length == 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if the array has any elements.
 * @returns true if array has at least one element
 */
Object.defineProperty(Array.prototype, 'any', {
    value: function<T>(this: T[]) {
        return this.length > 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the first element of the array.
 * @returns The first element, or undefined if the array is empty
 */
Object.defineProperty(Array.prototype, 'first', {
    value: function<T>(this: T[]): T | undefined {
        if (this.isEmpty()) {
            console.warn("first() called on an empty array")
        }
        return this[0];
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the last element of the array.
 * @returns The last element, or undefined if the array is empty
 */
Object.defineProperty(Array.prototype, 'last', {
    value: function<T>(this: T[]): T | undefined {
        if (this.isEmpty()) {
            console.warn("last() called on an empty array");
        }
        return this[this.length -1];
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns a new array skipping the first `count` elements.
 * @param {number} count - Number of elements to skip from the start.
 * @return {T[]} A new array without the first `count` elements.
 */
Object.defineProperty(Array.prototype, 'skip', {
    value: function<T>(this: T[], count: number): T[] {
        return this.slice(count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new array skipping the last `count` elements.
 * @param {number} count - Number of elements to skip from the end.
 * @return {T[]} A new array without the last `count` elements.
 */
Object.defineProperty(Array.prototype, 'skipLast', {
    value: function<T>(this: T[], count: number): T[] {
        return this.slice(0, -count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns a new array containing the first `count` elements.
 * @param {number} count - Number of elements to take from the start.
 * @return {T[]} A new array with the first `count` elements.
 */
Object.defineProperty(Array.prototype, 'take', {
    value: function<T>(this: T[], count: number): T[] {
        return this.slice(0, count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new array containing the last `count` elements.
 * @param {number} count - Number of elements to take from the end.
 * @return {T[]} A new array with the last `count` elements.
 */
Object.defineProperty(Array.prototype, 'takeLast', {
    value: function<T>(this: T[], count: number): T[] {
        return this.slice(-count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Sorts the array in place based on the value returned by the provided predicate.
 * Special ordering rules:
 * - `undefined` values come first.
 * - `null` values come after `undefined`.
 * - All other values are sorted normally (ascending).
 * @param predicate A function that returns the value used for sorting each element.
 * @returns {T[]} array sorted by predicate return value
 * @note This mutates the array.
 */
Object.defineProperty(Array.prototype, 'sortBy', {
    value: function<T>(this: T[], predicate: (item: T) => boolean | number | string | null | undefined): T[] {
        return this.sort((a, b) => {
            const itemA = predicate(a);
            const itemB = predicate(b);

            if (itemA === undefined && itemB !== undefined) return -1;
            if (itemB === undefined && itemA !== undefined) return 1;
            if (itemA === null && itemB !== null) return -1;
            if (itemB === null && itemA !== null) return 1;

            return typeof itemA == 'string' && typeof itemB == 'string' ? itemA.localeCompare(itemB)
                : (itemA as any) - (itemB as any);
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Shuffle the array in-place using Fisher–Yates.
 * @returns {T[]} shuffled array
 * @note This mutates the array.
 */
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function<T>(this: T[]): T[] {
        let currentIndex = this.length
        let randomIndex
    
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--
        
            // And swap it with the current element.
            [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]]
        }

        return this;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Group array elements by a key returned from predicate.
 * @param {(item: T, index: number) => string | number} predicate - key selector
 * @returns {Record<string, T[]>} groups keyed by predicate
 */
Object.defineProperty(Array.prototype, 'groupBy', {
    value: function<T>(this: T[], predicate: (item: T, index: number) => string | number): Record<string, T[]> {
        const groups: Record<string, T[]> = {};

        this.forEach((item, index) => {
            let key = predicate(item, index);
            if(!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        return groups;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Return a single instance of each value that appears more than once.
 * Example: [1,1,1,1,2,2,3] -> [1,2]
 * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
 * @returns {T[]} array of one item per duplicated key
 */
Object.defineProperty(Array.prototype, 'getDuplicates', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[] {
        if (this.isEmpty())
            return [];
        if (!predicate && typeof this[0] != 'boolean' && typeof this[0] != 'number' && typeof this[0] != 'string' && this[0] !== null && this[0] !== undefined)
            throw new Error("If no predicate provided. Array must be of type (string | null | undefined)[] or (number | null | undefined)[] or (boolean | null | undefined)[] but was "+typeof this[0]+"");
        
        const fn = predicate ?? ((item: T, index: number) => item === null ? null : item === undefined ? undefined : String(item));
        const seen = new Set<boolean | number | string | null | undefined>();
        const duplicates = new Set<boolean | number | string | null | undefined>();

        return this.filter((item, index) => {
            const key = fn(item, index);
            if (seen.has(key)) {
                if (!duplicates.has(key)) {
                    duplicates.add(key);
                    return true;
                }
            } else {
                seen.add(key);
                return false;
            }
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Return all elements that belong to duplicated keys (keep original order,
 * include each duplicate occurrence except the first one of each key).
 * Example: [1,1,1,1,2,2,3] -> [1,1,1,1,2,2]
 * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
 * @returns {T[]} array with all duplicate occurrences (predicate called once per element)
 */
Object.defineProperty(Array.prototype, 'getDuplicatesAll', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[] {
        if (this.isEmpty())
            return [];
        if (!predicate && typeof this[0] != 'boolean' && typeof this[0] != 'number' && typeof this[0] != 'string' && this[0] !== null && this[0] !== undefined)
            throw new Error("If no predicate provided. Array must be of type (string | null | undefined)[] or (number | null | undefined)[] or (boolean | null | undefined)[] but was "+typeof this[0]+"");
        
        const fn = predicate ?? ((item: T, index: number) => item === null ? null : item === undefined ? undefined : String(item));
        const seen = new Set<boolean | number | string | null | undefined>();
        const duplicates = new Set<boolean | number | string | null | undefined>();

        const entries = this.map((item, index) => {
            const key = fn(item, index);
            if (seen.has(key)) {
                if (!duplicates.has(key)) {
                    duplicates.add(key);
                }
            }
            else seen.add(key);
            return { item, key };
        });

        return entries
            .filter(e => duplicates.has(e.key))
            .map(e => e.item);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Return array with first occurrence of each key (keeps first item for each key).
 * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
 * @returns {T[]} array with unique items by key (first wins)
 */
Object.defineProperty(Array.prototype, 'removeDuplicates', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[] {
        if (this.isEmpty())
            return [];
        if (!predicate && typeof this[0] != 'boolean' && typeof this[0] != 'number' && typeof this[0] != 'string' && this[0] !== null && this[0] !== undefined)
            throw new Error("If no predicate provided. Array must be of type (string | null | undefined)[] or (number | null | undefined)[] or (boolean | null | undefined)[] but was "+typeof this[0]+"");
        
        const fn = predicate ?? ((item: T, index: number) => item === null ? null : item === undefined ? undefined : String(item));
        const seen = new Set<boolean | number | string | null | undefined>();

        return this.filter((item, index) => {
            const key = fn(item, index);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Removes the element at the specified index.
 * @param index Index to remove
 * @returns New array with the element removed
 */
Object.defineProperty(Array.prototype, 'removeIndex', {
    value: function<T>(this: T[], indexToRemove: number): T[] {
        if (indexToRemove < 0 || this.length <= indexToRemove) {
            console.warn(`IndexToRemove: [${indexToRemove}] out of range. Array has ${this.length} elements`);
        }
        return this.filter((_, index) => index != indexToRemove);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Removes one element matching the predicate.
 * @param predicate Function to determine which element to remove
 * @returns New array with the element removed
 */
Object.defineProperty(Array.prototype, 'removeOne', {
    value: function<T>(this: T[], predicate: (item: T, index: number) => boolean): T[] {
        return this.removeIndex(this.findIndex(predicate));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Removes all elements matching the predicate.
 * @param predicate Function to determine which elements to remove
 * @returns New array with elements removed
 */
Object.defineProperty(Array.prototype, 'removeAll', {
    value: function<T>(this: T[], predicate: (item: T, index: number) => boolean): T[] {
        return this.filter((item, index) => !predicate(item, index));
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns the sum of elements according to an optional predicate.
 * @param predicate Optional function to extract numeric value from element
 * @param initialValue Optional initial value for sum (default 0)
 * @returns Sum of elements
 */
Object.defineProperty(Array.prototype, 'sum', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number, initialValue: number = 0): number {
        if (this.isEmpty())
            return initialValue;
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was "+typeof this[0]+"");

        const fn = predicate ?? ((item: T) => item as number);

        return this.reduce((total, item, index) => {
            return total + fn(item, index);
        }, initialValue);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the element with the maximum value according to an optional predicate.
 * @param predicate Optional function to extract numeric value from element
 * @returns Element with maximum value, or undefined if array is empty
 */
Object.defineProperty(Array.prototype, 'max', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined {
        if (this.isEmpty()) {
            console.warn("max() called on an empty array");
            return undefined;
        }
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was "+typeof this[0]+"");
        
        const fn = predicate ?? ((item: T) => item as number);
        let maxValue: number = -Infinity;
        let maxElement: T;

        this.forEach((item, index) => {
            const value = fn(item, index)
            if(value > maxValue) {
                maxValue = value
                maxElement = item
            }
        });

        return maxElement!;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the element with the minimum value according to an optional predicate.
 * @param predicate Optional function to extract numeric value from element
 * @returns Element with minimum value, or undefined if array is empty
 */
Object.defineProperty(Array.prototype, 'min', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined {
        if (this.isEmpty()) {
            console.warn("min() called on an empty array");
            return undefined;
        }
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was "+typeof this[0]+"");
        
        const fn = predicate ?? ((item: T) => item as number);
        let minValue: number = Infinity;
        let minElement: T;

        this.forEach((item, index) => {
            const value = fn(item, index)
            if(value < minValue) {
                minValue = value
                minElement = item
            }
        });

        return minElement!;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

//#endregion

//#region Date ------------------------------------------------------------------------------------

// Static ---------------------------------------
/**
 * Converts a Unix timestamp (seconds) to a Date.
 * @param {number} unixTime - Timestamp in seconds.
 * @returns {Date} Date object for the given Unix time.
 */
Date.fromUnixTime = function(unixTime: number): Date {
    return new Date(unixTime * 1000);
};

/**
 * Calculates the number of whole months between two dates.
 * Positive if `b` is after `a`, negative if `b` is before `a`.
 * Ignores days and times; only year and month fields are used.
 *
 * @param a The starting date.
 * @param b The ending date.
 * @returns The signed number of months between `a` and `b`.
 *
 * @example
 * Date.monthsBetween(new Date(2025, 1, 25), new Date(2025, 2, 1)); // → 1
 * Date.monthsBetween(new Date(2025, 6, 10), new Date(2025, 4, 5)); // → -2
 */
Date.monthsBetween = function(a: Date, b: Date): number {
    const years = b.getFullYear() - a.getFullYear();
    const months = b.getMonth() - a.getMonth();
    return years * 12 + months;
}

// Instance -------------------------------------
/**
 * Returns the Unix timestamp (in seconds) for this Date.
 * Equivalent to Math.trunc(date.getTime() / 1000).
 * @returns Number of seconds since Unix epoch (January 1, 1970 UTC)
 */
Object.defineProperty(Date.prototype, 'unixTime', {
    value: function(this: Date): number {
        return Math.trunc(this.getTime() / 1000);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Calculates the number of whole months between this date and another date.
 * Positive if the other date is in the future, negative if it is in the past.
 * Day and time components are ignored; only year and month differences are considered.
 *
 * @param other The target date to compare with.
 * @returns The signed number of months from this date until the given date.
 *
 * @example
 * new Date(2025, 1, 25).monthsUntil(new Date(2025, 2, 1)); // → 1
 * new Date(2025, 6, 10).monthsUntil(new Date(2025, 4, 5)); // → -2
 */
Object.defineProperty(Date.prototype, 'monthsUntil', {
    value: function(this: Date, other: Date): number {
        return Date.monthsBetween(this, other);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// AddTime ---
/**
 * Adds the specified number of milliseconds to the date and returns a new Date instance.
 * @param milliseconds - Number of milliseconds to add.
 * @returns A new Date instance with the milliseconds added.
 */
Object.defineProperty(Date.prototype, 'addMillis', {
    value: function(this: Date, milliseconds: number): Date {
        return new Date(this.getTime() + milliseconds);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of seconds to the date and returns a new Date instance.
 * @param seconds - Number of seconds to add.
 * @returns A new Date instance with the seconds added.
 */
Object.defineProperty(Date.prototype, 'addSeconds', {
    value: function(this: Date, seconds: number): Date {
        return this.addMillis(seconds * 1000);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of minutes to the date and returns a new Date instance.
 * @param minutes - Number of minutes to add.
 * @returns A new Date instance with the minutes added.
 */
Object.defineProperty(Date.prototype, 'addMinutes', {
    value: function(this: Date, minutes: number): Date {
        return this.addSeconds(minutes * 60);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of hours to the date and returns a new Date instance.
 * @param hours - Number of hours to add.
 * @returns A new Date instance with the hours added.
 */
Object.defineProperty(Date.prototype, 'addHours', {
    value: function(this: Date, hours: number): Date {
        return this.addMinutes(hours * 60);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of days to the date and returns a new Date instance.
 * @param days - Number of days to add.
 * @returns A new Date instance with the days added.
 */
Object.defineProperty(Date.prototype, 'addDays', {
    value: function(this: Date, days: number): Date {
        return this.addHours(days * 24);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of weeks to the date and returns a new Date instance.
 * @param weeks - Number of weeks to add.
 * @returns A new Date instance with the weeks added.
 */
Object.defineProperty(Date.prototype, 'addWeeks', {
    value: function(this: Date, weeks: number): Date {
        return this.addDays(weeks * 7);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of months to the date and returns a new Date instance.
 * @param months - Number of months to add.
 * @returns A new Date instance with the months added.
 */
Object.defineProperty(Date.prototype, 'addMonths', {
    value: function(this: Date, months: number): Date {
        const d = new Date(this.getTime());
        d.setMonth(d.getMonth() + months);
        return d;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of years to the date and returns a new Date instance.
 * @param years - Number of years to add.
 * @returns A new Date instance with the years added.
 */
Object.defineProperty(Date.prototype, 'addYears', {
    value: function(this: Date, years: number): Date {
        const d = new Date(this.getTime());
        d.setFullYear(d.getFullYear() + years);
        return d;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns a new Date representing the first day of the month at 00:00:00.
 * @returns A new Date at the start of the month.
 */
Object.defineProperty(Date.prototype, 'startOfMonth', {
    value: function(this: Date): Date {
        return new Date(this.getFullYear(), this.getMonth());
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing January 1st of the year at 00:00:00.
 * @returns A new Date at the start of the year.
 */
Object.defineProperty(Date.prototype, 'startOfYear', {
    value: function(this: Date): Date {
        return new Date(this.getFullYear(), 0);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns a new Date representing the last day of the month at 23:59:59.999.
 * @returns A new Date at the end of the month.
 */
Object.defineProperty(Date.prototype, 'endOfMonth', {
    value: function(this: Date): Date {
        return new Date(this.addMonths(1).getTime() -1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing December 31st of the year at 23:59:59.999.
 * @returns A new Date at the end of the year.
 */
Object.defineProperty(Date.prototype, 'endOfYear', {
    value: function(this: Date): Date {
        return new Date(this.addYears(1).getTime() -1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// To X format ---
/**
 * Returns the date formatted as YYYY-MM-DD.
 * @returns A string representing the date in YYYY-MM-DD format.
 */
Object.defineProperty(Date.prototype, 'toDayKey', {
    value: function(this: Date): string {
        const year = this.getFullYear();
        const month = String(this.getMonth() + 1).padStart(2, '0');
        const day = String(this.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the month and year formatted as YYYY-MM.
 * @returns A string representing the month in YYYY-MM format.
 */
Object.defineProperty(Date.prototype, 'toMonthKey', {
    value: function(this: Date): string {
        return this.toDayKey().slice(0, 7);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns the date formatted for input[type="date"] value.
 * @returns A string in YYYY-MM-DD format.
 */
Object.defineProperty(Date.prototype, 'toInputDateValue', {
    value: function(this: Date): string {
        const year = this.getFullYear();
        const month = String(this.getMonth() + 1).padStart(2, '0');
        const day = String(this.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// Comparation ---
/**
 * Checks if two dates are on the same day.
 * @param other - The date to compare with.
 * @returns True if the dates are on the same day, false otherwise.
 */
Object.defineProperty(Date.prototype, 'isSameDay', {
    value: function(this: Date, other: Date): boolean {
        return this.getFullYear() === other.getFullYear()
            && this.getMonth() === other.getMonth()
            && this.getDate() === other.getDate();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same month and year.
 * @param other - The date to compare with.
 * @returns True if the dates are in the same month and year, false otherwise.
 */
Object.defineProperty(Date.prototype, 'isSameMonth', {
    value: function(this: Date, other: Date): boolean {
        return this.getFullYear() === other.getFullYear()
            && this.getMonth() === other.getMonth();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same year.
 * @param other - The date to compare with.
 * @returns True if the dates are in the same year, false otherwise.
 */
Object.defineProperty(Date.prototype, 'isSameYear', {
    value: function(this: Date, other: Date): boolean {
        return this.getFullYear() === other.getFullYear();
    },
    writable: false,
    configurable: false,
    enumerable: false
});

//#endregion