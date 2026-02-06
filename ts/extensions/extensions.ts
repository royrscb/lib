// Author: royrscb.com
//-***********************************************************************************
//- Build command in this file dir: tsc && sed -i '/^\/\/-/d' ../../js/extensions.js *
//- The second part is to delete this 5 lines comment                                *
//- Output will go to "./tsconfig.json".compilerOptions.outDir                       *
//-***********************************************************************************

//#region Number ----------------------------------------------------------------------------------

/**
 * Returns the largest integer less than or equal to the number.
 * @return {number} The value of Math.floor(this)
 */
Object.defineProperty(Number.prototype, 'floor', {
    value: function(this: number): number {
        return Math.floor(this)
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Rounds the number to the given number of decimals.
 * @param {number} decimals Number of decimal places (default 0)
 * @return {number} Rounded number
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
 * Returns the smallest integer greater than or equal to the number.
 * @return {number} The value of Math.ceil(this)
 */
Object.defineProperty(Number.prototype, 'ceil', {
    value: function(this: number): number {
        return Math.ceil(this)
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Clamps the number between min and max (inclusive).
 * @param {number} min Minimum allowed value.
 * @param {number} max Maximum allowed value.
 * @return {number} The number constrained to the range [min, max].
 */
Object.defineProperty(Number.prototype, 'clamp', {
    value: function(this: number, min: number, max: number): number {
        return Math.min(Math.max(this, min), max);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Calculates the given percent of this number.
 * @param {number} percent Percentage to calculate (e.g. 10 for 10%).
 * @return {number} The value corresponding to `percent` percent of this number.
 */
Object.defineProperty(Number.prototype, 'getPercent', {
    value: function(this: number, percent: number): number {
        return (this * percent) / 100;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Calculates what percent this number is of the provided total.
 * @param {number} total The total value used as denominator.
 * @return {number} The percentage (0-100) that this number represents of total.
 */
Object.defineProperty(Number.prototype, 'percentOf', {
    value: function(this: number, total: number): number {
        return (this / total) * 100;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Formats the number as a price string, showing 2 decimals if needed.
 * @return {string} Price string, e.g. "10" or "10.50"
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
 * @return {boolean} true if string has no length, false otherwise
 */
Object.defineProperty(String.prototype, 'isEmpty', {
    value: function(this: string): boolean {
        return this.length == 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Checks if the string represents a numeric value.
 * Returns false for empty or whitespace-only strings.
 * @return {boolean} true if the string can be parsed to a finite number, false otherwise.
 */
Object.defineProperty(String.prototype, 'isNumeric', {
    value: function(this: string): boolean {
        if (this.trim().isEmpty())
            return false;
        
        const n = Number(this);
        return !Number.isNaN(n) && Number.isFinite(n);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Converts the string to a number and rounds it.
 * @param {number} decimals Number of decimal places (default 0)
 * @return {number} Rounded number
 * @throws Error if the string cannot be parsed to a number
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
 * @return {string} String with the first character uppercase
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
 * @param {number} minLengthToUpperCaseFirst Minimum length for words to capitalize (default 4)
 * @return {string} String with words capitalized according to rule
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
 * @return {string} Price string, e.g. "10" or "10.50"
 * @throws Error if the string cannot be parsed to a number
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
 * @return {boolean} true if array has no elements, false otherwise
 */
Object.defineProperty(Array.prototype, 'isEmpty', {
    value: function<T>(this: T[]): boolean {
        return this.length == 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if the array has any elements.
 * @return {boolean} true if array has at least one element
 */
Object.defineProperty(Array.prototype, 'any', {
    value: function<T>(this: T[]): boolean {
        return this.length > 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the first element of the array.
 * @return {T | undefined} The first element, or undefined if the array is empty
 */
Object.defineProperty(Array.prototype, 'first', {
    value: function<T>(this: T[]): T | undefined {
        return this[0];
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the last element of the array.
 * @return {T | undefined} The last element, or undefined if the array is empty
 */
Object.defineProperty(Array.prototype, 'last', {
    value: function<T>(this: T[]): T | undefined {
        return this[this.length -1];
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns a shallow copy of the array.
 * The original array is not modified.
 * Elements are copied by reference (objects and arrays inside are NOT cloned).
 * @return {T[]} A new array containing the same elements.
 */
Object.defineProperty(Array.prototype, 'copy', {
    value: function<T>(
        this: T[]
    ): T[] {
        return this.slice();
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns a new array skipping the first `count` elements.
 * @param {number} count - Number of elements to skip from the start. Default 1.
 * @return {T[]} A new array without the first `count` elements.
 */
Object.defineProperty(Array.prototype, 'skip', {
    value: function<T>(this: T[], count: number = 1): T[] {
        return this.slice(count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new array skipping the last `count` elements.
 * @param {number} count - Number of elements to skip from the end. Default 1.
 * @return {T[]} A new array without the last `count` elements.
 */
Object.defineProperty(Array.prototype, 'skipLast', {
    value: function<T>(this: T[], count: number = 1): T[] {
        return this.slice(0, -count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns a new array containing the first `count` elements.
 * @param {number} count - Number of elements to take from the start. Default 1.
 * @return {T[]} A new array with the first `count` elements.
 */
Object.defineProperty(Array.prototype, 'take', {
    value: function<T>(this: T[], count: number = 1): T[] {
        return this.slice(0, count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new array containing the last `count` elements.
 * @param {number} count - Number of elements to take from the end. Default 1.
 * @return {T[]} A new array with the last `count` elements.
 */
Object.defineProperty(Array.prototype, 'takeLast', {
    value: function<T>(this: T[], count: number = 1): T[] {
        return this.slice(-count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Sorts the array in place based on the value returned by the provided predicate (ascending).
 * Special ordering rules:
 * - `undefined` values come first.
 * - `null` values come after `undefined`.
 * - All other values are sorted normally (ascending).
 * @param {(item: T) => boolean | number | string | null | undefined} predicate
 * @return {T[]} array sorted by predicate return value
 * @note This mutates the array.
 */
Object.defineProperty(Array.prototype, 'sortBy', {
    value: function<T>(
        this: T[],
        predicate: (item: T) => boolean | number | string | null | undefined
    ): T[] {
        return this.sort((a, b) => {
            const itemA = predicate(a);
            const itemB = predicate(b);

            if (itemA === undefined && itemB !== undefined) return -1;
            if (itemB === undefined && itemA !== undefined) return 1;
            if (itemA === null && itemB !== null) return -1;
            if (itemB === null && itemA !== null) return 1;

            if (typeof itemA == 'string' && typeof itemB == 'string')
                return itemA.localeCompare(itemB);

            return (itemA as any) - (itemB as any);
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Sorts the array in place based on the value returned by the provided predicate (descending).
 * Special ordering rules:
 * - `undefined` values come first.
 * - `null` values come after `undefined`.
 * - All other values are sorted normally (descending).
 * @param {(item: T) => boolean | number | string | null | undefined} predicate
 * @return {T[]} array sorted by predicate return value
 * @note This mutates the array.
 */
Object.defineProperty(Array.prototype, 'sortByDescending', {
    value: function<T>(
        this: T[],
        predicate: (item: T) => boolean | number | string | null | undefined
    ): T[] {
        return this.sort((a, b) => {
            const itemA = predicate(a);
            const itemB = predicate(b);

            if (itemA === undefined && itemB !== undefined) return -1;
            if (itemB === undefined && itemA !== undefined) return 1;
            if (itemA === null && itemB !== null) return -1;
            if (itemB === null && itemA !== null) return 1;

            if (typeof itemA === 'string' && typeof itemB === 'string')
                return itemB.localeCompare(itemA); // reversed

            return (itemB as any) - (itemA as any); // reversed
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Shuffle the array in-place using Fisher–Yates.
 * @return {T[]} shuffled array
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
 * @return {Record<string, T[]>} groups keyed by predicate
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
 * Splits the array into chunks of given size.
 * @param {number} size - Size of each chunk (must be > 0).
 * @return {T[][]} An array of chunks (arrays) each of length <= size.
 * @throws Error if size <= 0.
 */
Object.defineProperty(Array.prototype, 'chunk', {
    value: function<T>(this: T[], size: number): T[][] {
        if (size <= 0) throw new Error("Chunk size must be greater than 0");

        const chunks: T[][] = [];
        for (let i = 0; i < this.length; i += size) {
            chunks.push(this.slice(i, i + size));
        }
        return chunks;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Return a single instance of each value that appears more than once.
 * Example: [1,1,1,1,2,2,3] -> [1,2]
 * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
 * @return {T[]} array of one item per duplicated key
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
 * @return {T[]} array with all duplicate occurrences (predicate called once per element)
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
 * @return {T[]} array with unique items by key (first wins)
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
 * @param {number} indexToRemove Index to remove
 * @return {T[]} New array with the element removed
 */
Object.defineProperty(Array.prototype, 'removeIndex', {
    value: function<T>(this: T[], indexToRemove: number): T[] {
        return this.filter((_, index) => index != indexToRemove);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Removes one element matching the predicate.
 * @param {(item: T, index: number) => boolean} predicate Function to determine which element to remove
 * @return {T[]} New array with the element removed
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
 * @param {(item: T, index: number) => boolean} predicate Function to determine which elements to remove
 * @return {T[]} New array with elements removed
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
 * Swaps two elements in the array by index.
 * @param {number} indexA First index
 * @param {number} indexB Second index
 * @return {T[]} New array with the elements swapped
 */
Object.defineProperty(Array.prototype, 'swapIndex', {
    value: function<T>(this: T[], indexA: number, indexB: number): T[] {
        const copy = this.slice();

        if (
            indexA === indexB ||
            indexA < 0 || indexB < 0 ||
            indexA >= this.length || indexB >= this.length
        ) {
            return copy;
        }

        [copy[indexA], copy[indexB]] = [copy[indexB], copy[indexA]];
        return copy;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns the sum of elements according to an optional predicate.
 * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element
 * @param {number} initialValue Optional initial value for sum (default 0)
 * @return {number} Sum of elements
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
 * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element
 * @return {T | undefined} Element with maximum value, or undefined if array is empty
 */
Object.defineProperty(Array.prototype, 'max', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined {
        if (this.isEmpty())
            return undefined;
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
 * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element
 * @return {T | undefined} Element with minimum value, or undefined if array is empty
 */
Object.defineProperty(Array.prototype, 'min', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined {
        if (this.isEmpty())
            return undefined;
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
/**
 * Returns the average of elements, optionally using a selector predicate.
 * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element.
 * @return {number | undefined} The average value or undefined if the array is empty.
 * @throws Error if no predicate provided and array elements are not numbers.
 */
Object.defineProperty(Array.prototype, 'average', {
    value: function<T>(this: T[], predicate?: (item: T, index: number) => number): number | undefined {
        if (this.isEmpty())
            return undefined;
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was "+typeof this[0]+"");
        
        return this.sum(predicate) / this.length;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

//#endregion

//#region Date ------------------------------------------------------------------------------------

// Static ---------------------------------------

/**
 * Returns the Unix timestamp (in seconds).
 * @return {number} Number of seconds since Unix epoch (January 1, 1970 UTC)
 */
Date['nowUnixTime'] = function(): number {
    return Math.trunc(Date.now() / 1000);
};

/**
 * Converts a Unix timestamp (seconds) to a Date.
 * @param {number} unixTime - Timestamp in seconds.
 * @return {Date} Date object for the given Unix time.
 */
Date['fromUnixTime'] = function(unixTime: number): Date {
    return new Date(unixTime * 1000);
};

/**
 * Calculates the number of whole months between two dates.
 * Positive if `b` is after `a`, negative if `b` is before `a`.
 * Ignores days and times; only year and month fields are used.
 *
 * @param {Date} a The starting date.
 * @param {Date} b The ending date.
 * @return {number} The signed number of months between `a` and `b`.
 *
 * @example
 * Date.monthsBetween(new Date(2025, 1, 25), new Date(2025, 2, 1)); // → 1
 * Date.monthsBetween(new Date(2025, 6, 10), new Date(2025, 4, 5)); // → -2
 */
Date['monthsBetween'] = function(a: Date | number, b: Date | number): number {
    if (!(a instanceof Date) && typeof a !== 'number')
        throw new Error(`a must be Date or number. Was ${typeof a}`);
    if (!(b instanceof Date) && typeof b !== 'number')
        throw new Error(`b must be Date or number. Was ${typeof b}`);

    const aDate = a instanceof Date ? a : new Date(a);
    const bDate = b instanceof Date ? b : new Date(b);

    const years = bDate.getFullYear() - aDate.getFullYear();
    const months = bDate.getMonth() - aDate.getMonth();
    return years * 12 + months;
}

// Instance -------------------------------------

// Time change ---

/**
 * Adds the specified number of milliseconds to the date and returns a new Date instance.
 * @param {number} milliseconds - Number of milliseconds to add.
 * @return {Date} A new Date instance with the milliseconds added.
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
 * @param {number} seconds - Number of seconds to add.
 * @return {Date} A new Date instance with the seconds added.
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
 * @param {number} minutes - Number of minutes to add.
 * @return {Date} A new Date instance with the minutes added.
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
 * @param {number} hours - Number of hours to add.
 * @return {Date} A new Date instance with the hours added.
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
 * @param {number} days - Number of days to add.
 * @return {Date} A new Date instance with the days added.
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
 * @param {number} weeks - Number of weeks to add.
 * @return {Date} A new Date instance with the weeks added.
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
 * @param {number} months - Number of months to add.
 * @return {Date} A new Date instance with the months added.
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
 * @param {number} years - Number of years to add.
 * @return {Date} A new Date instance with the years added.
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
 * Returns a new Date representing the first hour of the day at 00:00:00.
 * @return {Date} A new Date at the start of the day.
 */
Object.defineProperty(Date.prototype, 'startOfDay', {
    value: function(this: Date): Date {
        return new Date(this.getFullYear(), this.getMonth(), this.getDate());
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the first day of the week at 00:00:00.
 * @param {boolean} weekStartsOnMonday - The day of the week to start. Default on sunday.
 * @return {Date} A new Date at the start of the week.
 */
Object.defineProperty(Date.prototype, 'startOfWeek', {
    value: function(this: Date, weekStartsOnMonday: boolean = false): Date {
        const day = this.getDay();
        const diff = weekStartsOnMonday ? (day == 0 ? -6 : 1 - day)
            : -day; 

        return new Date(this.getFullYear(), this.getMonth(), this.getDate() + diff);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the first day of the month at 00:00:00.
 * @return {Date} A new Date at the start of the month.
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
 * @return {Date} A new Date at the start of the year.
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
 * Returns a new Date representing the last hour of the day at 23:59:59.999.
 * @return {Date} A new Date at the end of the day.
 */
Object.defineProperty(Date.prototype, 'endOfDay', {
    value: function(this: Date): Date {
        return new Date(this.addDays(1).startOfDay().getTime() -1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last day of the week at 23:59:59.999.
 * @param {boolean} weekStartsOnMonday - The day of the week to start. Default on sunday.
 * @return {Date} A new Date at the end of the week.
 */
Object.defineProperty(Date.prototype, 'endOfWeek', {
    value: function(this: Date, weekStartsOnMonday: boolean = false): Date {
        return new Date(this.addWeeks(1).startOfWeek(weekStartsOnMonday).getTime() -1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last day of the month at 23:59:59.999.
 * @return {Date} A new Date at the end of the month.
 */
Object.defineProperty(Date.prototype, 'endOfMonth', {
    value: function(this: Date): Date {
        return new Date(this.addMonths(1).startOfMonth().getTime() -1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing December 31st of the year at 23:59:59.999.
 * @return {Date} A new Date at the end of the year.
 */
Object.defineProperty(Date.prototype, 'endOfYear', {
    value: function(this: Date): Date {
        return new Date(this.addYears(1).startOfYear().getTime() -1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// Format ---

/**
 * Formats a Date instance into a custom string pattern with locale support.
 *
 * Supported tokens:
 *  - YYYY : full year
 *  - MM   : month number (01–12)
 *  - DD   : day of month (01–31)
 *  - HH   : hours (00–23)
 *  - hh   : hours (01-12)
 *  - mm   : minutes (00–59)
 *  - ss   : seconds (00–59)
 *  - MMM  : short month name (localized) (max 3 letters)
 *  - MMMM : full month name (localized)
 *  - ddd  : short weekday name (localized) (max 2 letters)
 *  - dddd : full weekday name (localized)
 *  - z    : short timezone name (e.g. "CET")
 *  - zz   : long timezone name  (e.g. "Central European Standard Time")
 *  - Z    : numeric offset from UTC (e.g. "+01:00")
 *
 * @param {string} pattern Format pattern string
 * @param {string} lang Locale language in 2 letters format. e.g. 'ca', 'es', 'en'.
 * @return {string} The formatted date.
 */
Object.defineProperty(Date.prototype, 'format', {
    value: function(this: Date, pattern: string, lang: string = 'en'): string {
        const pad = (n: number) => String(n).padStart(2, '0');

        const rep = {
            // Numeric
            'YYYY': String(this.getFullYear()),
            'MM':   pad(this.getMonth() + 1),
            'DD':   pad(this.getDate()),
            'HH':   pad(this.getHours()),
            'hh':   pad(this.getHours() % 12 || 12),
            'mm':   pad(this.getMinutes()),
            'ss':   pad(this.getSeconds()),

            // Month names
            'MMMM': new Intl.DateTimeFormat(lang, { month: 'long' }).format(this)
                .upperCaseFirst(),
            'MMM':  new Intl.DateTimeFormat(lang, { month: 'short' }).format(this)
                .slice(0, 3).replace('.', '').upperCaseFirst(),
    
            // Weekday names
            'dddd': new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(this)
                .upperCaseFirst(),
            'ddd':  new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(this)
                .slice(0, 2).replace('.', '').upperCaseFirst(),
    
            // Timezone names
            'z':  new Intl.DateTimeFormat(lang, { timeZoneName: 'short' }).formatToParts(this)
                .find(p => p.type === 'timeZoneName')?.value || '',
            'zz': new Intl.DateTimeFormat(lang, { timeZoneName: 'long' }).formatToParts(this)
                .find(p => p.type === 'timeZoneName')?.value || '',
        } as Record<string, string>;

        // Numeric timezone offset
        if (pattern.includes('Z')) {
            const offsetMin = -this.getTimezoneOffset();
            const sign = offsetMin >= 0 ? '+' : '-';
            const abs = Math.abs(offsetMin);
            rep['Z'] = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
        }

        return pattern.replace(/YYYY|DD|HH|hh|mm|ss|MMMM|MMM|MM|dddd|ddd|zz|z|Z/g, t => rep[t]);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns the date formatted as YYYY-MM-DD.
 * @return {string} A string representing the date in YYYY-MM-DD format.
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
 * @return {string} A string representing the month in YYYY-MM format.
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
 * @return {string} A string in YYYY-MM-DD format.
 */
Object.defineProperty(Date.prototype, 'toInputDateValue', {
    value: function(this: Date): string {
        if (!this || isNaN(this.getTime()))
            return '';

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
 * Returns the date formatted for input[type="datetime-local"] value.
 * @return {string} A string in YYYY-MM-DDTHH:MM format.
 */
Object.defineProperty(Date.prototype, 'toInputDatetimeLocalValue', {
    value: function(this: Date): string {
        if (!this || isNaN(this.getTime()))
            return '';

        const year = this.getFullYear();
        const month = String(this.getMonth() + 1).padStart(2, '0');
        const day = String(this.getDate()).padStart(2, '0');

        const hours = String(this.getHours()).padStart(2, '0');
        const minutes = String(this.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// Comparation ---

/**
 * Checks if the date is in the past compared to now.
 * @return {boolean} True if the date is earlier than the current time, false otherwise.
 */
Object.defineProperty(Date.prototype, 'isPast', {
    value: function(this: Date): boolean {
        return this.getTime() < Date.now();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if the date is in the future compared to now.
 * @return {boolean} True if the date is later than the current time, false otherwise.
 */
Object.defineProperty(Date.prototype, 'isFuture', {
    value: function(this: Date): boolean {
        return Date.now() < this.getTime();
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Checks if two dates are on the same day.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same year, month, and day; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameDay', {
    value: function(this: Date, other: Date | number): boolean {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);

        const otherDate = other instanceof Date ? other : new Date(other);
        
        return this.getFullYear() === otherDate.getFullYear()
            && this.getMonth() === otherDate.getMonth()
            && this.getDate() === otherDate.getDate();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are on the same week.
 * @param {Date | number} other - The date to compare against.
 * @param {boolean} weekStartsOnMonday - The day of the week to start. Default on sunday.
 * @return {boolean} True if both dates are in the same week; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameWeek', {
    value: function(this: Date, other: Date | number, weekStartsOnMonday: boolean = false): boolean {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);

        const otherDate = other instanceof Date ? other : new Date(other);

        return this.startOfWeek(weekStartsOnMonday).getTime()
            == otherDate.startOfWeek(weekStartsOnMonday).getTime();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are on the same month.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same year and month; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameMonth', {
    value: function(this: Date, other: Date | number): boolean {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);

        const otherDate = other instanceof Date ? other : new Date(other);
        
        return this.getFullYear() === otherDate.getFullYear()
            && this.getMonth() === otherDate.getMonth();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are on the same year.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same year; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameYear', {
    value: function(this: Date, other: Date | number): boolean {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);

        const otherDate = other instanceof Date ? other : new Date(other);
        
        return this.getFullYear() === otherDate.getFullYear();
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Indicates whether the date falls on a weekend (Saturday or Sunday).
 * @return {boolean} true if the day is Saturday (6) or Sunday (0), otherwise false.
 */
Object.defineProperty(Date.prototype, 'isWeekend', {
    value: function(this: Date): boolean {
        return this.getDay() == 0 || this.getDay() == 6;
    },
    writable: false,
    configurable: false,
    enumerable: false
});

// Misc ---

/**
 * Returns the Unix timestamp (in seconds) for this Date.
 * @return {number} Number of seconds since Unix epoch (January 1, 1970 UTC)
 */
Object.defineProperty(Date.prototype, 'getUnixTime', {
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
 * @param {Date} other The target date to compare with.
 * @return {number} The signed number of months from this date until the given date.
 *
 * @example
 * new Date(2025, 1, 25).monthsUntil(new Date(2025, 2, 1)); // → 1
 * new Date(2025, 6, 10).monthsUntil(new Date(2025, 4, 5)); // → -2
 */
Object.defineProperty(Date.prototype, 'monthsUntil', {
    value: function(this: Date, other: Date | number): number {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);

        const otherDate = other instanceof Date ? other : new Date(other);

        return Date.monthsBetween(this, otherDate);
    },
    writable: false,
    configurable: false,
    enumerable: false
});

/**
 * Returns the number of days in the current month of the date.
 * @return {number} The total number of days in the month.
 */
Object.defineProperty(Date.prototype, 'daysInMonth', {
    value: function(this: Date): number {
        return this.endOfMonth().getDate();
    },
    writable: false,
    configurable: false,
    enumerable: false
});

//#endregion

//#region Promise ---------------------------------------------------------------------------------

// Static ---------------------------------------

/**
 * Pauses execution for the specified number of milliseconds.
 * @param {number} ms - Time to wait in milliseconds.
 * @return {Promise<void>} A promise that resolves after the delay.
 * 
 * @throws Error if ms is not an integer biggeror equal to 0
 */
Promise['sleep'] = function(ms: number): Promise<void> {
    if (!Number.isInteger(ms) || ms < 0)
        throw new Error("Milliseconds must be an integer bigger or equal to 0")
        
    return new Promise(resolve => setTimeout(resolve, ms));
};

//#endregion