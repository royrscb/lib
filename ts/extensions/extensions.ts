// Author: royrscb.com
//-*******************************************************************
//- Build command: $tsc && sed -i '/^\/\/-/d' ../../js/extensions.js *
//- The second part is to delete this 5 lines comment                *
//- Output will go to "./tsconfig.json".compilerOptions.outDir       *
//-*******************************************************************

// Number ---------------------------------------
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

// String ---------------------------------------
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

// Array ----------------------------------------
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
 * @returns {void}
 * @note This mutates the array.
 */
Object.defineProperty(Array.prototype, 'sortBy', {
    value: function<T>(this: T[], predicate: (item: T) => boolean | number | string | null | undefined): void {
        this.sort((a, b) => {
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
 * @returns {void}
 * @note This mutates the array.
 */
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function<T>(this: T[]): void {
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
