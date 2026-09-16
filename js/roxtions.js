"use strict";
// Author: royrscb.com
// My custom extensions for basic JS types
//#region Number ----------------------------------------------------------------------------------
/**
 * Returns the largest integer less than or equal to the number.
 * @return {number} The value of Math.floor(this)
 */
Object.defineProperty(Number.prototype, 'floor', {
    value: function () {
        return Math.floor(this);
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
    value: function (decimals = 0) {
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
    value: function () {
        return Math.ceil(this);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Clamps the number between min (inclusive) and max (inclusive).
 * @param {number} min Minimum allowed value.
 * @param {number} max Maximum allowed value.
 * @return {number} The number constrained to the range [min, max].
 */
Object.defineProperty(Number.prototype, 'clamp', {
    value: function (min, max) {
        if (min > max)
            throw new Error(`clamp: min (${min}) cannot be greater than max (${max})`);
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
    value: function (percent) {
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
    value: function (total) {
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
    value: function () {
        const price = Math.round(this * 100) / 100;
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
    value: function () {
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
    value: function () {
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
    value: function (decimals = 0) {
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
    value: function () {
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
    value: function (minLengthToUpperCaseFirst = 4) {
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
    value: function () {
        const floatNumber = parseFloat(this);
        if (Number.isNaN(floatNumber))
            throw new Error(`String "${this}" can not be parsed into a float`);
        return floatNumber.prettyPrice();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Replaces separators (-, _) with spaces.
 * Example: "hello_world-test" -> "hello world test"
 * @return {string}
 */
Object.defineProperty(String.prototype, 'toWords', {
    value: function () {
        return this.replace(/[-_]+/g, ' ');
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Converts string to camelCase.
 * Example: "hello world" -> "helloWorld"
 * @return {string}
 */
Object.defineProperty(String.prototype, 'toCamelCase', {
    value: function () {
        return this.toLowerCase()
            .split(' ')
            .map((w, i) => i == 0 ? w : w.upperCaseFirst())
            .join('');
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Converts string to PascalCase.
 * Example: "hello world" -> "HelloWorld"
 * @return {string}
 */
Object.defineProperty(String.prototype, 'toPascalCase', {
    value: function () {
        return this.toLowerCase()
            .split(' ')
            .map(w => w.upperCaseFirst())
            .join('');
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Converts string to snake_case.
 * Example: "HeLLo WoRld" -> "hello_world"
 * @return {string}
 */
Object.defineProperty(String.prototype, 'toSnakeCase', {
    value: function () {
        return this.split(' ').join('_').toLowerCase();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Converts string to kebab-case.
 * Example: "HeLLo WoRld" -> "hello-world"
 * @return {string}
 */
Object.defineProperty(String.prototype, 'toKebabCase', {
    value: function () {
        return this.split(' ').join('-').toLowerCase();
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
    value: function () {
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
    value: function () {
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
    value: function () {
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
    value: function () {
        return this[this.length - 1];
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
    value: function () {
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
    value: function (count = 1) {
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
    value: function (count = 1) {
        if (count < 0)
            throw new Error("skipLast: count can not be less than 0");
        if (count == 0)
            return this;
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
    value: function (count = 1) {
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
    value: function (count = 1) {
        if (count < 0)
            throw new Error("skipLast: count can not be less than 0");
        if (count == 0)
            return [];
        return this.slice(-count);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new array sorted in ascending order by the value returned
 * from an optional predicate.
 * The original array is not modified (shallow copy).
 *
 * Ordering priority:
 * `undefined` → first, `null` → after undefined, others → normal ascending.
 *
 * @param {(item: T) => boolean | number | string | null | undefined} [predicate]
 * @return {T[]} A new sorted array.
 */
Object.defineProperty(Array.prototype, 'sortBy', {
    value: function (predicate) {
        return this.copy().sort((a, b) => {
            const fn = predicate ?? ((item) => item);
            const itemA = fn(a);
            const itemB = fn(b);
            if (itemA === undefined && itemB !== undefined)
                return -1;
            if (itemB === undefined && itemA !== undefined)
                return 1;
            if (itemA === null && itemB !== null)
                return -1;
            if (itemB === null && itemA !== null)
                return 1;
            if (typeof itemA == 'string' && typeof itemB == 'string')
                return itemA.localeCompare(itemB);
            return itemA - itemB;
        });
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new array sorted in descending order by the value returned
 * from an optional predicate.
 * The original array is not modified (shallow copy).
 *
 * Ordering priority:
 * `undefined` → first, `null` → after undefined, others → normal descending.
 *
 * @param {(item: T) => boolean | number | string | null | undefined} [predicate]
 * @return {T[]} A new sorted array.
 */
Object.defineProperty(Array.prototype, 'sortByDescending', {
    value: function (predicate) {
        return this.copy().sort((a, b) => {
            const fn = predicate ?? ((item) => item);
            const itemA = fn(a);
            const itemB = fn(b);
            if (itemA === undefined && itemB !== undefined)
                return -1;
            if (itemB === undefined && itemA !== undefined)
                return 1;
            if (itemA === null && itemB !== null)
                return -1;
            if (itemB === null && itemA !== null)
                return 1;
            if (typeof itemA === 'string' && typeof itemB === 'string')
                return itemB.localeCompare(itemA); // reversed
            return itemB - itemA; // reversed
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
    value: function () {
        let currentIndex = this.length;
        let randomIndex;
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
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
    value: function (predicate) {
        const groups = {};
        this.forEach((item, index) => {
            let key = predicate(item, index);
            if (!groups[key]) {
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
    value: function (size) {
        if (size <= 0)
            throw new Error("chunk: size must be greater than 0");
        if (!Number.isInteger(size))
            throw new Error("chunk: size must be an integer");
        const chunks = [];
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
    value: function (predicate) {
        if (this.isEmpty())
            return [];
        if (!predicate
            && typeof this[0] != 'boolean'
            && typeof this[0] != 'number'
            && typeof this[0] != 'string'
            && this[0] !== null
            && this[0] !== undefined)
            throw new Error("If no predicate provided. Array must be of type (string | null | undefined)[] or (number | null | undefined)[] or (boolean | null | undefined)[] but was " + typeof this[0] + "");
        const fn = predicate ?? ((item, _) => item === null ? null : item === undefined ? undefined : String(item));
        const seen = new Set();
        const duplicates = new Set();
        return this.filter((item, index) => {
            const key = fn(item, index);
            if (seen.has(key)) {
                if (!duplicates.has(key)) {
                    duplicates.add(key);
                    return true;
                }
            }
            else {
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
 * Return all elements that belong to duplicated keys (keep original order, include each duplicate occurrence).
 * Example: [1,1,1,1,2,2,3] -> [1,1,1,1,2,2]
 * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
 * @return {T[]} array with all duplicate occurrences (predicate called once per element)
 */
Object.defineProperty(Array.prototype, 'getDuplicatesAll', {
    value: function (predicate) {
        if (this.isEmpty())
            return [];
        if (!predicate && typeof this[0] != 'boolean' && typeof this[0] != 'number' && typeof this[0] != 'string' && this[0] !== null && this[0] !== undefined)
            throw new Error("If no predicate provided. Array must be of type (string | null | undefined)[] or (number | null | undefined)[] or (boolean | null | undefined)[] but was " + typeof this[0] + "");
        const fn = predicate ?? ((item, index) => item === null ? null : item === undefined ? undefined : String(item));
        const seen = new Set();
        const duplicates = new Set();
        const entries = this.map((item, index) => {
            const key = fn(item, index);
            if (seen.has(key)) {
                if (!duplicates.has(key)) {
                    duplicates.add(key);
                }
            }
            else
                seen.add(key);
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
    value: function (predicate) {
        if (this.isEmpty())
            return [];
        if (!predicate && typeof this[0] != 'boolean' && typeof this[0] != 'number' && typeof this[0] != 'string' && this[0] !== null && this[0] !== undefined)
            throw new Error("If no predicate provided. Array must be of type (string | null | undefined)[] or (number | null | undefined)[] or (boolean | null | undefined)[] but was " + typeof this[0] + "");
        const fn = predicate ?? ((item, index) => item === null ? null : item === undefined ? undefined : String(item));
        const seen = new Set();
        return this.filter((item, index) => {
            const key = fn(item, index);
            if (seen.has(key))
                return false;
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
    value: function (indexToRemove) {
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
    value: function (predicate) {
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
    value: function (predicate) {
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
    value: function (indexA, indexB) {
        const copy = this.copy();
        if (indexA === indexB ||
            indexA < 0 || indexB < 0 ||
            indexA >= this.length || indexB >= this.length) {
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
    value: function (predicate, initialValue = 0) {
        if (this.isEmpty())
            return initialValue;
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was " + typeof this[0] + "");
        const fn = predicate ?? ((item) => item);
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
    value: function (predicate) {
        if (this.isEmpty())
            return undefined;
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was " + typeof this[0] + "");
        const fn = predicate ?? ((item) => item);
        let maxValue = -Infinity;
        let maxElement;
        this.forEach((item, index) => {
            const value = fn(item, index);
            if (value > maxValue) {
                maxValue = value;
                maxElement = item;
            }
        });
        return maxElement;
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
    value: function (predicate) {
        if (this.isEmpty())
            return undefined;
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was " + typeof this[0] + "");
        const fn = predicate ?? ((item) => item);
        let minValue = Infinity;
        let minElement;
        this.forEach((item, index) => {
            const value = fn(item, index);
            if (value < minValue) {
                minValue = value;
                minElement = item;
            }
        });
        return minElement;
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
    value: function (predicate) {
        if (this.isEmpty())
            return undefined;
        if (!predicate && typeof this[0] !== 'number')
            throw new Error("If no predicate provided. Array must be of type number[] but was " + typeof this[0] + "");
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
Date['nowUnixTime'] = function () {
    return Math.trunc(Date.now() / 1000);
};
/**
 * Converts a Unix timestamp (seconds) to a Date.
 * @param {number} unixTime - Timestamp in seconds.
 * @return {Date} Date object for the given Unix time.
 */
Date['fromUnixTime'] = function (unixTime) {
    return new Date(unixTime * 1000);
};
/**
 * Creates a Date from a local date string in YYYY-MM-DD format.
 *
 * @param {string} value A local date string.
 * @return {Date} A Date representing midnight in the local timezone.
 */
Date['fromDateStr'] = function (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match)
        throw new Error(`Invalid date. Expected YYYY-MM-DD. Was ${value}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day) {
        throw new Error(`Invalid date. Was ${value}`);
    }
    return date;
};
/**
 * Creates a Date from a UTC date string in YYYY-MM-DD format.
 *
 * @param {string} value A UTC date string.
 * @return {Date} A Date representing midnight UTC of the specified date.
 */
Date['fromUTCDateStr'] = function (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match)
        throw new Error(`Invalid date. Expected YYYY-MM-DD. Was ${value}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day) {
        throw new Error(`Invalid date. Was ${value}`);
    }
    return date;
};
/**
 * Creates a Date from a Spain:Europe/Madrid date string in YYYY-MM-DD format.
 *
 * @param {string} value A Spain:Europe/Madrid date string.
 * @return {Date} A Date representing midnight in Spain:Europe/Madrid.
 */
Date['fromSpainDateStr'] = function (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match)
        throw new Error(`Invalid date. Expected YYYY-MM-DD. Was ${value}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const requestedUTC = Date.UTC(year, month - 1, day);
    let timestamp = requestedUTC;
    for (let i = 0; i < 3; i++) {
        const parts = getPartsInTimeZone(new Date(timestamp), SPAIN_TIME_ZONE);
        const currentUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
        timestamp += requestedUTC - currentUTC;
    }
    const date = new Date(timestamp);
    const parts = getPartsInTimeZone(date, SPAIN_TIME_ZONE);
    if (parts.year !== year ||
        parts.month !== month ||
        parts.day !== day ||
        parts.hour !== 0 ||
        parts.minute !== 0 ||
        parts.second !== 0) {
        throw new Error(`Invalid date. Was ${value}`);
    }
    return date;
};
/**
 * Creates a Date from a local dateTime string in YYYY-MM-DD HH:mm:ss format.
 *
 * @param {string} value A local dateTime string.
 * @return {Date} A Date representing the specified local dateTime.
 */
Date['fromDateTimeStr'] = function (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
    if (!match)
        throw new Error(`Invalid local dateTime. Expected YYYY-MM-DD HH:mm:ss. Was ${value}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    const date = new Date(year, month - 1, day, hour, minute, second);
    if (date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute ||
        date.getSeconds() !== second) {
        throw new Error(`Invalid local dateTime. Was ${value}`);
    }
    return date;
};
/**
 * Creates a Date from a UTC dateTime string in YYYY-MM-DD HH:mm:ss format.
 *
 * @param {string} value A UTC dateTime string.
 * @return {Date} A Date representing the specified UTC dateTime.
 */
Date['fromUTCDateTimeStr'] = function (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
    if (!match)
        throw new Error(`Invalid UTC dateTime. Expected YYYY-MM-DD HH:mm:ss. Was ${value}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    if (date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day ||
        date.getUTCHours() !== hour ||
        date.getUTCMinutes() !== minute ||
        date.getUTCSeconds() !== second) {
        throw new Error(`Invalid UTC dateTime. Was ${value}`);
    }
    return date;
};
/**
 * Creates a Date from a Spain:Europe/Madrid dateTime string in YYYY-MM-DD HH:mm:ss format.
 *
 * @param {string} value A Spain:Europe/Madrid dateTime string.
 * @return {Date} A Date representing the specified Spain:Europe/Madrid dateTime.
 */
Date['fromSpainDateTimeStr'] = function (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
    if (!match)
        throw new Error(`Invalid Spain dateTime. Expected YYYY-MM-DD HH:mm:ss. Was ${value}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    const desiredAsUTC = Date.UTC(year, month - 1, day, hour, minute, second);
    // Initial UTC guess.
    let timestamp = desiredAsUTC;
    // Correct the guess using the actual Europe/Madrid offset.
    for (let i = 0; i < 3; i++) {
        const parts = getPartsInTimeZone(new Date(timestamp), SPAIN_TIME_ZONE);
        const actualAsUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
        timestamp += desiredAsUTC - actualAsUTC;
    }
    const date = new Date(timestamp);
    const parts = getPartsInTimeZone(date, SPAIN_TIME_ZONE);
    if (parts.year !== year ||
        parts.month !== month ||
        parts.day !== day ||
        parts.hour !== hour ||
        parts.minute !== minute ||
        parts.second !== second) {
        throw new Error(`Invalid Spain dateTime. Was ${value}`);
    }
    return date;
};
/**
 * Calculates the number of whole months between two dates using the local timezone.
 * Positive if `b` is after `a`, negative if `b` is before `a`.
 * Ignores days and times; only local year and month fields are used.
 *
 * @param {Date} a The starting date.
 * @param {Date} b The ending date.
 * @return {number} The signed number of local months between `a` and `b`.
 *
 * @example
 * Date.monthsBetween(new Date(2025, 1, 25), new Date(2025, 2, 1)); // → 1
 * Date.monthsBetween(new Date(2025, 6, 10), new Date(2025, 4, 5)); // → -2
 */
Date['monthsBetween'] = function (a, b) {
    if (!(a instanceof Date) && typeof a !== 'number')
        throw new Error(`a must be Date or number. Was ${typeof a}`);
    if (!(b instanceof Date) && typeof b !== 'number')
        throw new Error(`b must be Date or number. Was ${typeof b}`);
    const aDate = a instanceof Date ? a : new Date(a);
    const bDate = b instanceof Date ? b : new Date(b);
    const years = bDate.getFullYear() - aDate.getFullYear();
    const months = bDate.getMonth() - aDate.getMonth();
    return years * 12 + months;
};
/**
 * Calculates the number of whole months between two dates using UTC year and month fields.
 * Positive if `b` is after `a`, negative if `b` is before `a`.
 * Ignores days and times; only UTC year and month fields are used.
 *
 * @param {Date} a The starting date.
 * @param {Date} b The ending date.
 * @return {number} The signed number of UTC months between `a` and `b`.
 *
 * @example
 * Date.monthsBetweenUTC(new Date(Date.UTC(2025, 1, 25)), new Date(Date.UTC(2025, 2, 1))); // → 1
 */
Date['monthsBetweenUTC'] = function (a, b) {
    if (!(a instanceof Date) && typeof a !== 'number')
        throw new Error(`a must be Date or number. Was ${typeof a}`);
    if (!(b instanceof Date) && typeof b !== 'number')
        throw new Error(`b must be Date or number. Was ${typeof b}`);
    const aDate = a instanceof Date ? a : new Date(a);
    const bDate = b instanceof Date ? b : new Date(b);
    const years = bDate.getUTCFullYear() - aDate.getUTCFullYear();
    const months = bDate.getUTCMonth() - aDate.getUTCMonth();
    return years * 12 + months;
};
/**
 * Calculates the number of whole months between two dates using Spain:Europe/Madrid year and month fields.
 * Positive if `b` is after `a`, negative if `b` is before `a`.
 * Ignores days and times; only Spain:Europe/Madrid year and month fields are used.
 *
 * @param {Date} a The starting date.
 * @param {Date} b The ending date.
 * @return {number} The signed number of Spain:Europe/Madrid months between `a` and `b`.
 */
Date['monthsBetweenSpain'] = function (a, b) {
    if (!(a instanceof Date) && typeof a !== 'number')
        throw new Error(`a must be Date or number. Was ${typeof a}`);
    if (!(b instanceof Date) && typeof b !== 'number')
        throw new Error(`b must be Date or number. Was ${typeof b}`);
    const aDate = a instanceof Date ? a : new Date(a);
    const bDate = b instanceof Date ? b : new Date(b);
    const aParts = getPartsInTimeZone(aDate, SPAIN_TIME_ZONE);
    const bParts = getPartsInTimeZone(bDate, SPAIN_TIME_ZONE);
    const years = bParts.year - aParts.year;
    const months = bParts.month - aParts.month;
    return years * 12 + months;
};
// Instance -------------------------------------
// Time change ---
/**
 * Adds the specified number of milliseconds to the date and returns a new Date instance.
 * @param {number} milliseconds - Number of milliseconds to add.
 * @return {Date} A new Date instance with the milliseconds added.
 */
Object.defineProperty(Date.prototype, 'addMillis', {
    value: function (milliseconds) {
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
    value: function (seconds) {
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
    value: function (minutes) {
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
    value: function (hours) {
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
    value: function (days) {
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
    value: function (weeks) {
        return this.addDays(weeks * 7);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of months using local date fields.
 * If the target month does not contain the original day, the last day of the target month is used.
 *
 * @param {number} months - Number of months to add.
 * @return {Date} A new Date instance with the months added using local time.
 */
Object.defineProperty(Date.prototype, 'addMonths', {
    value: function (months) {
        const d = new Date(this.getTime());
        const day = d.getDate();
        d.setDate(1);
        d.setMonth(d.getMonth() + months);
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(day, lastDay));
        return d;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of months using UTC date fields.
 * If the target month does not contain the original day, the last day of the target month is used.
 *
 * @param {number} months - Number of months to add.
 * @return {Date} A new Date instance with the months added using UTC.
 */
Object.defineProperty(Date.prototype, 'addMonthsUTC', {
    value: function (months) {
        const d = new Date(this.getTime());
        const day = d.getUTCDate();
        d.setUTCDate(1);
        d.setUTCMonth(d.getUTCMonth() + months);
        const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
        d.setUTCDate(Math.min(day, lastDay));
        return d;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of months using Spain:Europe/Madrid date fields.
 * If the target month does not contain the original day, the last day of the target month is used.
 *
 * @param {number} months - Number of months to add.
 * @return {Date} A new Date instance with the months added using Spain:Europe/Madrid time.
 */
Object.defineProperty(Date.prototype, 'addMonthsSpain', {
    value: function (months) {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        const targetMonth = parts.month - 1 + months;
        const target = new Date(Date.UTC(parts.year, targetMonth, 1, parts.hour, parts.minute, parts.second, this.getMilliseconds()));
        const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
        target.setUTCDate(Math.min(parts.day, lastDay));
        return new Date(target.getTime() -
            getTimeZoneOffsetMinutes(target, SPAIN_TIME_ZONE) * 60 * 1000);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of years using local date fields.
 * If the original date is February 29 and the target year is not a leap year, the result is February 28.
 *
 * @param {number} years - Number of years to add.
 * @return {Date} A new Date instance with the years added using local time.
 */
Object.defineProperty(Date.prototype, 'addYears', {
    value: function (years) {
        const d = new Date(this.getTime());
        const originalMonth = d.getMonth();
        const originalDate = d.getDate();
        d.setFullYear(d.getFullYear() + years);
        if (originalMonth === 1 && originalDate === 29 && d.getMonth() !== 1) {
            d.setDate(0);
        }
        return d;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of years using UTC date fields.
 * If the original date is February 29 and the target year is not a leap year, the result is February 28.
 *
 * @param {number} years - Number of years to add.
 * @return {Date} A new Date instance with the years added using UTC.
 */
Object.defineProperty(Date.prototype, 'addYearsUTC', {
    value: function (years) {
        const d = new Date(this.getTime());
        const originalMonth = d.getUTCMonth();
        const originalDate = d.getUTCDate();
        d.setUTCFullYear(d.getUTCFullYear() + years);
        if (originalMonth === 1 && originalDate === 29 && d.getUTCMonth() !== 1) {
            d.setUTCDate(0);
        }
        return d;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Adds the specified number of years using Spain:Europe/Madrid date fields.
 * If the original date is February 29 and the target year is not a leap year, the result is February 28.
 *
 * @param {number} years - Number of years to add.
 * @return {Date} A new Date instance with the years added using Spain:Europe/Madrid time.
 */
Object.defineProperty(Date.prototype, 'addYearsSpain', {
    value: function (years) {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        const year = parts.year + years;
        if (parts.month === 2 && parts.day === 29 && new Date(Date.UTC(year, 1, 29)).getUTCMonth() !== 1) {
            parts.day = 28;
        }
        const target = new Date(Date.UTC(year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, this.getMilliseconds()));
        return new Date(target.getTime() -
            (getTimeZoneOffsetMinutes(target, SPAIN_TIME_ZONE) * 60 * 1000));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing 00:00:00 at the start of the local calendar day.
 * @return {Date} A new Date at the start of the local day.
 */
Object.defineProperty(Date.prototype, 'startOfDay', {
    value: function () {
        return new Date(this.getFullYear(), this.getMonth(), this.getDate());
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing 00:00:00 UTC at the start of the UTC calendar day.
 * @return {Date} A new Date at the start of the UTC day.
 */
Object.defineProperty(Date.prototype, 'startOfDayUTC', {
    value: function () {
        return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing 00:00:00 Spain:Europe/Madrid at the start of the Spain:Europe/Madrid calendar day.
 * @return {Date} A new Date at the start of the Spain:Europe/Madrid day.
 */
Object.defineProperty(Date.prototype, 'startOfDaySpain', {
    value: function () {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        return new Date(Date.UTC(parts.year, parts.month - 1, parts.day) - (getTimeZoneOffsetMinutes(new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12)), SPAIN_TIME_ZONE) * 60 * 1000));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the first day of the local week at 00:00:00.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {Date} A new Date at the start of the local week.
 */
Object.defineProperty(Date.prototype, 'startOfWeek', {
    value: function (weekStartsOnMonday = false) {
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
 * Returns a new Date representing the first day of the UTC week at 00:00:00 UTC.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {Date} A new Date at the start of the UTC week.
 */
Object.defineProperty(Date.prototype, 'startOfWeekUTC', {
    value: function (weekStartsOnMonday = false) {
        const day = this.getUTCDay();
        const diff = weekStartsOnMonday ? (day == 0 ? -6 : 1 - day)
            : -day;
        return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate() + diff));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the first day of the Spain:Europe/Madrid week at 00:00:00 Spain:Europe/Madrid.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {Date} A new Date at the start of the Spain:Europe/Madrid week.
 */
Object.defineProperty(Date.prototype, 'startOfWeekSpain', {
    value: function (weekStartsOnMonday = false) {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        const day = parts.weekday;
        const diff = weekStartsOnMonday ? (day == 0 ? -6 : 1 - day) : -day;
        const start = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + diff));
        const offsetMinutes = getTimeZoneOffsetMinutes(start, SPAIN_TIME_ZONE);
        return new Date(start.getTime() - (offsetMinutes * 60 * 1000));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the first day of the local month at 00:00:00.
 * @return {Date} A new Date at the start of the local month.
 */
Object.defineProperty(Date.prototype, 'startOfMonth', {
    value: function () {
        return new Date(this.getFullYear(), this.getMonth());
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the 1st of the UTC calendar month at 00:00:00 UTC.
 * @return {Date} A new Date at the start of the UTC month.
 */
Object.defineProperty(Date.prototype, 'startOfMonthUTC', {
    value: function () {
        return new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth()));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the 1st of the Spain:Europe/Madrid calendar month at 00:00:00 Spain:Europe/Madrid.
 * @return {Date} A new Date at the start of the Spain:Europe/Madrid month.
 */
Object.defineProperty(Date.prototype, 'startOfMonthSpain', {
    value: function () {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        return new Date(Date.UTC(parts.year, parts.month - 1, 1) - (getTimeZoneOffsetMinutes(new Date(Date.UTC(parts.year, parts.month - 1, 1, 12)), SPAIN_TIME_ZONE) * 60 * 1000));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing January 1st of the local calendar year at 00:00:00.
 * @return {Date} A new Date at the start of the local year.
 */
Object.defineProperty(Date.prototype, 'startOfYear', {
    value: function () {
        return new Date(this.getFullYear(), 0);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing January 1st of the UTC calendar year at 00:00:00 UTC.
 * @return {Date} A new Date at the start of the UTC year.
 */
Object.defineProperty(Date.prototype, 'startOfYearUTC', {
    value: function () {
        return new Date(Date.UTC(this.getUTCFullYear(), 0));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing January 1st of the Spain:Europe/Madrid calendar year at 00:00:00 Spain:Europe/Madrid.
 * @return {Date} A new Date at the start of the Spain:Europe/Madrid year.
 */
Object.defineProperty(Date.prototype, 'startOfYearSpain', {
    value: function () {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        return new Date(Date.UTC(parts.year, 0, 1) - (getTimeZoneOffsetMinutes(new Date(Date.UTC(parts.year, 0, 1, 12)), SPAIN_TIME_ZONE) * 60 * 1000));
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing 23:59:59.999 at the end of the local calendar day.
 * @return {Date} A new Date at the end of the local day.
 */
Object.defineProperty(Date.prototype, 'endOfDay', {
    value: function () {
        return new Date(this.addDays(1).startOfDay().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing 23:59:59.999 UTC at the end of the UTC calendar day.
 * @return {Date} A new Date at the end of the UTC day.
 */
Object.defineProperty(Date.prototype, 'endOfDayUTC', {
    value: function () {
        return new Date(this.addDays(1).startOfDayUTC().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing 23:59:59.999 Spain:Europe/Madrid at the end of the Spain:Europe/Madrid calendar day.
 * @return {Date} A new Date at the end of the Spain:Europe/Madrid day.
 */
Object.defineProperty(Date.prototype, 'endOfDaySpain', {
    value: function () {
        return new Date(this.addDays(1).startOfDaySpain().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last day of the local week at 23:59:59.999.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {Date} A new Date at the end of the local week.
 */
Object.defineProperty(Date.prototype, 'endOfWeek', {
    value: function (weekStartsOnMonday = false) {
        return new Date(this.addWeeks(1).startOfWeek(weekStartsOnMonday).getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last day of the UTC week at 23:59:59.999 UTC.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {Date} A new Date at the end of the UTC week.
 */
Object.defineProperty(Date.prototype, 'endOfWeekUTC', {
    value: function (weekStartsOnMonday = false) {
        return new Date(this.addWeeks(1).startOfWeekUTC(weekStartsOnMonday).getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last day of the Spain:Europe/Madrid week at 23:59:59.999 Spain:Europe/Madrid.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {Date} A new Date at the end of the Spain:Europe/Madrid week.
 */
Object.defineProperty(Date.prototype, 'endOfWeekSpain', {
    value: function (weekStartsOnMonday = false) {
        return new Date(this.addWeeks(1).startOfWeekSpain(weekStartsOnMonday).getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last day of the local month at 23:59:59.999.
 * @return {Date} A new Date at the end of the local month.
 */
Object.defineProperty(Date.prototype, 'endOfMonth', {
    value: function () {
        return new Date(this.addMonths(1).startOfMonth().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last instant of the UTC calendar month.
 * @return {Date} A new Date at the end of the UTC month.
 */
Object.defineProperty(Date.prototype, 'endOfMonthUTC', {
    value: function () {
        return new Date(this.addMonthsUTC(1).startOfMonthUTC().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last instant of the Spain:Europe/Madrid calendar month.
 * @return {Date} A new Date at the end of the Spain:Europe/Madrid month.
 */
Object.defineProperty(Date.prototype, 'endOfMonthSpain', {
    value: function () {
        return new Date(this.addMonthsSpain(1).startOfMonthSpain().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing December 31st of the local calendar year at 23:59:59.999.
 * @return {Date} A new Date at the end of the local year.
 */
Object.defineProperty(Date.prototype, 'endOfYear', {
    value: function () {
        return new Date(this.addYears(1).startOfYear().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last instant of the UTC calendar year.
 * @return {Date} A new Date at the end of the UTC year.
 */
Object.defineProperty(Date.prototype, 'endOfYearUTC', {
    value: function () {
        return new Date(this.addYearsUTC(1).startOfYearUTC().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns a new Date representing the last instant of the Spain:Europe/Madrid calendar year.
 * @return {Date} A new Date at the end of the Spain:Europe/Madrid year.
 */
Object.defineProperty(Date.prototype, 'endOfYearSpain', {
    value: function () {
        return new Date(this.addYearsSpain(1).startOfYearSpain().getTime() - 1);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
// Format ---
/**
 * Formats a Date instance into a custom string pattern using local date/time fields and locale support.
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
 * @return {string} The formatted local date.
 */
Object.defineProperty(Date.prototype, 'format', {
    value: function (pattern, lang = 'en') {
        const pad = (n) => String(n).padStart(2, '0');
        const rep = {
            // Numeric
            'YYYY': String(this.getFullYear()),
            'MM': pad(this.getMonth() + 1),
            'DD': pad(this.getDate()),
            'HH': pad(this.getHours()),
            'hh': pad(this.getHours() % 12 || 12),
            'mm': pad(this.getMinutes()),
            'ss': pad(this.getSeconds()),
            // Month names
            'MMMM': new Intl.DateTimeFormat(lang, { month: 'long' }).format(this).upperCaseFirst(),
            'MMM': new Intl.DateTimeFormat(lang, { month: 'short' }).format(this).slice(0, 3).replace('.', '').upperCaseFirst(),
            // Weekday names
            'dddd': new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(this).upperCaseFirst(),
            'ddd': new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(this).slice(0, 2).replace('.', '').upperCaseFirst(),
            // Timezone names
            'z': new Intl.DateTimeFormat(lang, { timeZoneName: 'short' }).formatToParts(this).find(p => p.type === 'timeZoneName')?.value || '',
            'zz': new Intl.DateTimeFormat(lang, { timeZoneName: 'long' }).formatToParts(this).find(p => p.type === 'timeZoneName')?.value || '',
        };
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
 * Formats a Date instance into a custom string pattern using UTC date/time fields and locale support.
 * Supports the same tokens as `format`. The `Z` token is always "+00:00".
 *
 * @param {string} pattern Format pattern string
 * @param {string} lang Locale language in 2 letters format. e.g. 'ca', 'es', 'en'.
 * @return {string} The formatted UTC date.
 */
Object.defineProperty(Date.prototype, 'formatUTC', {
    value: function (pattern, lang = 'en') {
        const pad = (n) => String(n).padStart(2, '0');
        const rep = {
            // Numeric
            'YYYY': String(this.getUTCFullYear()),
            'MM': pad(this.getUTCMonth() + 1),
            'DD': pad(this.getUTCDate()),
            'HH': pad(this.getUTCHours()),
            'hh': pad(this.getUTCHours() % 12 || 12),
            'mm': pad(this.getUTCMinutes()),
            'ss': pad(this.getUTCSeconds()),
            // Month names
            'MMMM': new Intl.DateTimeFormat(lang, { month: 'long', timeZone: 'UTC' }).format(this).upperCaseFirst(),
            'MMM': new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' }).format(this).slice(0, 3).replace('.', '').upperCaseFirst(),
            // Weekday names
            'dddd': new Intl.DateTimeFormat(lang, { weekday: 'long', timeZone: 'UTC' }).format(this).upperCaseFirst(),
            'ddd': new Intl.DateTimeFormat(lang, { weekday: 'short', timeZone: 'UTC' }).format(this).slice(0, 2).replace('.', '').upperCaseFirst(),
            // Timezone names
            'z': new Intl.DateTimeFormat(lang, { timeZoneName: 'short', timeZone: 'UTC' }).formatToParts(this).find(p => p.type === 'timeZoneName')?.value || '',
            'zz': new Intl.DateTimeFormat(lang, { timeZoneName: 'long', timeZone: 'UTC' }).formatToParts(this).find(p => p.type === 'timeZoneName')?.value || '',
            // Numeric timezone offset (always UTC)
            'Z': '+00:00',
        };
        return pattern.replace(/YYYY|DD|HH|hh|mm|ss|MMMM|MMM|MM|dddd|ddd|zz|z|Z/g, t => rep[t]);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Formats a Date instance into a custom string pattern using Spain:Europe/Madrid date/time fields and Spain:Europe/Madrid locale support.
 *
 * @param {string} pattern Format pattern string
 * @param {string} lang Locale language in 2 letters format. e.g. 'ca', 'es', 'en'.
 * @return {string} The formatted Spain:Europe/Madrid date.
 */
Object.defineProperty(Date.prototype, 'formatSpain', {
    value: function (pattern, lang = 'es') {
        const pad = (n) => String(n).padStart(2, '0');
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        const rep = {
            'YYYY': String(parts.year),
            'MM': pad(parts.month),
            'DD': pad(parts.day),
            'HH': pad(parts.hour),
            'hh': pad(parts.hour % 12 || 12),
            'mm': pad(parts.minute),
            'ss': pad(parts.second),
            'MMMM': new Intl.DateTimeFormat(lang, { month: 'long', timeZone: SPAIN_TIME_ZONE }).format(this).upperCaseFirst(),
            'MMM': new Intl.DateTimeFormat(lang, { month: 'short', timeZone: SPAIN_TIME_ZONE }).format(this).slice(0, 3).replace('.', '').upperCaseFirst(),
            'dddd': new Intl.DateTimeFormat(lang, { weekday: 'long', timeZone: SPAIN_TIME_ZONE }).format(this).upperCaseFirst(),
            'ddd': new Intl.DateTimeFormat(lang, { weekday: 'short', timeZone: SPAIN_TIME_ZONE }).format(this).slice(0, 2).replace('.', '').upperCaseFirst(),
            'z': new Intl.DateTimeFormat(lang, { timeZoneName: 'short', timeZone: SPAIN_TIME_ZONE }).formatToParts(this).find(p => p.type === 'timeZoneName')?.value || '',
            'zz': new Intl.DateTimeFormat(lang, { timeZoneName: 'long', timeZone: SPAIN_TIME_ZONE }).formatToParts(this).find(p => p.type === 'timeZoneName')?.value || '',
        };
        if (pattern.includes('Z')) {
            const offsetMinutes = getTimeZoneOffsetMinutes(this, SPAIN_TIME_ZONE);
            const sign = offsetMinutes >= 0 ? '+' : '-';
            const abs = Math.abs(offsetMinutes);
            rep['Z'] = `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
        }
        return pattern.replace(/YYYY|DD|HH|hh|mm|ss|MMMM|MMM|MM|dddd|ddd|zz|z|Z/g, t => rep[t]);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the local month and year formatted as YYYY-MM.
 * @return {string} A string representing the local month in YYYY-MM format.
 */
Object.defineProperty(Date.prototype, 'toMonthKey', {
    value: function () {
        return this.toDayKey().slice(0, 7);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the UTC month and year formatted as YYYY-MM.
 * @return {string} A string representing the UTC month in YYYY-MM format.
 */
Object.defineProperty(Date.prototype, 'toMonthKeyUTC', {
    value: function () {
        return this.toDayKeyUTC().slice(0, 7);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the Spain:Europe/Madrid month and year formatted as YYYY-MM.
 * @return {string} A string representing the Spain:Europe/Madrid month in YYYY-MM format.
 */
Object.defineProperty(Date.prototype, 'toMonthKeySpain', {
    value: function () {
        return this.toDayKeySpain().slice(0, 7);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the local date formatted as YYYY-MM-DD.
 * @return {string} A string representing the local date in YYYY-MM-DD format.
 */
Object.defineProperty(Date.prototype, 'toDayKey', {
    value: function () {
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
 * Returns the UTC date formatted as YYYY-MM-DD.
 * @return {string} A string representing the UTC date in YYYY-MM-DD format.
 */
Object.defineProperty(Date.prototype, 'toDayKeyUTC', {
    value: function () {
        return this.toISOString().slice(0, 10);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the Spain:Europe/Madrid date formatted as YYYY-MM-DD.
 * @return {string} A string representing the Spain:Europe/Madrid date in YYYY-MM-DD format.
 */
Object.defineProperty(Date.prototype, 'toDayKeySpain', {
    value: function () {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the date and time formatted as YYYY-MM-DD HH:mm:ss using the local timezone.
 *
 * @return {string} A string representing the local dateTime.
 */
Object.defineProperty(Date.prototype, 'toDateTime', {
    value: function () {
        const year = this.getFullYear();
        const month = String(this.getMonth() + 1).padStart(2, '0');
        const day = String(this.getDate()).padStart(2, '0');
        const hour = String(this.getHours()).padStart(2, '0');
        const minute = String(this.getMinutes()).padStart(2, '0');
        const second = String(this.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the date and time formatted as YYYY-MM-DD HH:mm:ss using UTC.
 *
 * @return {string} A string representing the UTC dateTime.
 */
Object.defineProperty(Date.prototype, 'toDateTimeUTC', {
    value: function () {
        return this.toISOString().slice(0, 19).replace('T', ' ');
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the date and time formatted as YYYY-MM-DD HH:mm:ss using Spain:Europe/Madrid.
 *
 * @return {string} A string representing the Spain:Europe/Madrid dateTime.
 */
Object.defineProperty(Date.prototype, 'toDateTimeSpain', {
    value: function () {
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        return [
            `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`,
            `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}`
        ].join(' ');
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the local date formatted for an input[type="date"] value.
 * @return {string} A string in YYYY-MM-DD format using local date fields.
 */
Object.defineProperty(Date.prototype, 'toInputDateValue', {
    value: function () {
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
 * Returns the UTC date formatted for an input[type="date"] value.
 * @return {string} A string in YYYY-MM-DD format using UTC date fields.
 */
Object.defineProperty(Date.prototype, 'toInputDateValueUTC', {
    value: function () {
        if (!this || isNaN(this.getTime()))
            return '';
        const year = this.getUTCFullYear();
        const month = String(this.getUTCMonth() + 1).padStart(2, '0');
        const day = String(this.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the Spain:Europe/Madrid date formatted for an input[type="date"] value.
 * @return {string} A string in YYYY-MM-DD format using Spain:Europe/Madrid date fields.
 */
Object.defineProperty(Date.prototype, 'toInputDateValueSpain', {
    value: function () {
        if (!this || isNaN(this.getTime()))
            return '';
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the local date formatted for an input[type="datetime-local"] value.
 * @return {string} A string in YYYY-MM-DDTHH:MM format using local date and time fields.
 */
Object.defineProperty(Date.prototype, 'toInputDateTimeLocalValue', {
    value: function () {
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
/**
 * Returns the UTC date formatted for an input[type="datetime-local"] value.
 * @return {string} A string in YYYY-MM-DDTHH:MM format using UTC date and time fields.
 */
Object.defineProperty(Date.prototype, 'toInputDateTimeLocalValueUTC', {
    value: function () {
        if (!this || isNaN(this.getTime()))
            return '';
        const year = this.getUTCFullYear();
        const month = String(this.getUTCMonth() + 1).padStart(2, '0');
        const day = String(this.getUTCDate()).padStart(2, '0');
        const hours = String(this.getUTCHours()).padStart(2, '0');
        const minutes = String(this.getUTCMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the Spain:Europe/Madrid date formatted for an input[type="datetime-local"] value.
 * @return {string} A string in YYYY-MM-DDTHH:MM format using Spain:Europe/Madrid date and time fields.
 */
Object.defineProperty(Date.prototype, 'toInputDateTimeLocalValueSpain', {
    value: function () {
        if (!this || isNaN(this.getTime()))
            return '';
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}T${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
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
    value: function () {
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
    value: function () {
        return Date.now() < this.getTime();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are on the same local day.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same local year, month, and day; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameDay', {
    value: function (other) {
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
 * Checks if two dates are on the same UTC day.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same UTC year, month, and day; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameDayUTC', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return this.getUTCFullYear() === otherDate.getUTCFullYear()
            && this.getUTCMonth() === otherDate.getUTCMonth()
            && this.getUTCDate() === otherDate.getUTCDate();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are on the same Spain:Europe/Madrid day.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same Spain:Europe/Madrid year, month, and day; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameDaySpain', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        const thisParts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        const otherParts = getPartsInTimeZone(otherDate, SPAIN_TIME_ZONE);
        return thisParts.year === otherParts.year
            && thisParts.month === otherParts.month
            && thisParts.day === otherParts.day;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same local week.
 * @param {Date | number} other - The date to compare against.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {boolean} True if both dates are in the same local week; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameWeek', {
    value: function (other, weekStartsOnMonday = false) {
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
 * Checks if two dates are in the same UTC week.
 * @param {Date | number} other - The date to compare against.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {boolean} True if both dates are in the same UTC week; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameWeekUTC', {
    value: function (other, weekStartsOnMonday = false) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return this.startOfWeekUTC(weekStartsOnMonday).getTime()
            == otherDate.startOfWeekUTC(weekStartsOnMonday).getTime();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same Spain:Europe/Madrid week.
 * @param {Date | number} other - The date to compare against.
 * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
 * @return {boolean} True if both dates are in the same Spain:Europe/Madrid week; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameWeekSpain', {
    value: function (other, weekStartsOnMonday = false) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return this.startOfWeekSpain(weekStartsOnMonday).getTime()
            == otherDate.startOfWeekSpain(weekStartsOnMonday).getTime();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same local month.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same local year and month; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameMonth', {
    value: function (other) {
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
 * Checks if two dates are in the same UTC month.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same UTC year and month; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameMonthUTC', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return this.getUTCFullYear() === otherDate.getUTCFullYear()
            && this.getUTCMonth() === otherDate.getUTCMonth();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same Spain:Europe/Madrid month.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same Spain:Europe/Madrid year and month; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameMonthSpain', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        const thisParts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        const otherParts = getPartsInTimeZone(otherDate, SPAIN_TIME_ZONE);
        return thisParts.year === otherParts.year
            && thisParts.month === otherParts.month;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same local year.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same local year; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameYear', {
    value: function (other) {
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
 * Checks if two dates are in the same UTC year.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same UTC year; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameYearUTC', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return this.getUTCFullYear() === otherDate.getUTCFullYear();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Checks if two dates are in the same Spain:Europe/Madrid year.
 * @param {Date | number} other - The date to compare against.
 * @return {boolean} True if both dates share the same Spain:Europe/Madrid year; otherwise false.
 */
Object.defineProperty(Date.prototype, 'isSameYearSpain', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return getPartsInTimeZone(this, SPAIN_TIME_ZONE).year === getPartsInTimeZone(otherDate, SPAIN_TIME_ZONE).year;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Indicates whether the date falls on a local weekend (Saturday or Sunday).
 * @return {boolean} true if the local day is Saturday (6) or Sunday (0), otherwise false.
 */
Object.defineProperty(Date.prototype, 'isWeekend', {
    value: function () {
        return this.getDay() == 0 || this.getDay() == 6;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Indicates whether the date falls on a UTC weekend (Saturday or Sunday).
 * @return {boolean} true if the UTC day is Saturday (6) or Sunday (0), otherwise false.
 */
Object.defineProperty(Date.prototype, 'isWeekendUTC', {
    value: function () {
        return this.getUTCDay() == 0 || this.getUTCDay() == 6;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Indicates whether the date falls on a Spain:Europe/Madrid weekend (Saturday or Sunday).
 * @return {boolean} true if the Spain:Europe/Madrid day is Saturday (6) or Sunday (0), otherwise false.
 */
Object.defineProperty(Date.prototype, 'isWeekendSpain', {
    value: function () {
        const day = getPartsInTimeZone(this, SPAIN_TIME_ZONE).weekday;
        return day == 0 || day == 6;
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
    value: function () {
        return Math.trunc(this.getTime() / 1000);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the date in standard ISO 8601 format with the local timezone offset.
 * Example: "2026-07-22T12:34:56.789+02:00"
 * @return {string} ISO 8601 string including the local offset.
 */
Object.defineProperty(Date.prototype, 'getTimestamp', {
    value: function () {
        const pad = (n) => String(n).padStart(2, '0');
        const offsetMinutes = -this.getTimezoneOffset();
        const offsetSign = offsetMinutes >= 0 ? '+' : '-';
        const offsetAbs = Math.abs(offsetMinutes);
        const offset = `${offsetSign}${pad(Math.floor(offsetAbs / 60))}:${pad(offsetAbs % 60)}`;
        const milliseconds = String(this.getMilliseconds()).padStart(3, '0');
        return `${this.getFullYear()}-${pad(this.getMonth() + 1)}-${pad(this.getDate())}` +
            `T${pad(this.getHours())}:${pad(this.getMinutes())}:${pad(this.getSeconds())}.${milliseconds}` +
            offset;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the date in standard ISO 8601 UTC format.
 * Example: "2026-07-22T10:34:56.789Z"
 * @return {string} ISO 8601 string in UTC.
 */
Object.defineProperty(Date.prototype, 'getTimestampUTC', {
    value: function () {
        return this.toISOString();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the date in standard ISO 8601 format for the Spain:Europe/Madrid timezone.
 * Example: "2026-07-22T12:34:56.789+02:00"
 * @return {string} ISO 8601 string in Spain:Europe/Madrid time.
 */
Object.defineProperty(Date.prototype, 'getTimestampSpain', {
    value: function () {
        const pad = (n) => String(n).padStart(2, '0');
        const parts = getPartsInTimeZone(this, SPAIN_TIME_ZONE);
        const offsetMinutes = getTimeZoneOffsetMinutes(this, SPAIN_TIME_ZONE);
        const offsetSign = offsetMinutes >= 0 ? '+' : '-';
        const offsetAbs = Math.abs(offsetMinutes);
        const offset = `${offsetSign}${pad(Math.floor(offsetAbs / 60))}:${pad(offsetAbs % 60)}`;
        return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}.${String(this.getMilliseconds()).padStart(3, '0')}${offset}`;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Calculates the number of whole months between this date and another date using local year and month fields.
 * Positive if the other date is in the future, negative if it is in the past.
 * Day and time components are ignored; only local year and month differences are considered.
 *
 * @param {Date} other The target date to compare with.
 * @return {number} The signed number of local months from this date until the given date.
 *
 * @example
 * new Date(2025, 1, 25).monthsUntil(new Date(2025, 2, 1)); // → 1
 * new Date(2025, 6, 10).monthsUntil(new Date(2025, 4, 5)); // → -2
 */
Object.defineProperty(Date.prototype, 'monthsUntil', {
    value: function (other) {
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
 * Calculates the number of whole months between this date and another date using UTC year and month fields.
 * Positive if the other date is in the future, negative if it is in the past.
 * Day and time components are ignored; only UTC year and month differences are considered.
 *
 * @param {Date} other The target date to compare with.
 * @return {number} The signed number of UTC months from this date until the given date.
 *
 * @example
 * new Date(Date.UTC(2025, 1, 25)).monthsUntilUTC(new Date(Date.UTC(2025, 2, 1))); // → 1
 */
Object.defineProperty(Date.prototype, 'monthsUntilUTC', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return Date.monthsBetweenUTC(this, otherDate);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Calculates the number of whole months between this date and another date using Spain:Europe/Madrid year and month fields.
 * Positive if the other date is in the future, negative if it is in the past.
 * Day and time components are ignored; only Spain:Europe/Madrid year and month differences are considered.
 *
 * @param {Date} other The target date to compare with.
 * @return {number} The signed number of Spain:Europe/Madrid months from this date until the given date.
 */
Object.defineProperty(Date.prototype, 'monthsUntilSpain', {
    value: function (other) {
        if (!(other instanceof Date) && typeof other !== 'number')
            throw new Error(`other must be Date or number. Was ${typeof other}`);
        const otherDate = other instanceof Date ? other : new Date(other);
        return Date.monthsBetweenSpain(this, otherDate);
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the number of days in the current local month of the date.
 * @return {number} The total number of days in the local month.
 */
Object.defineProperty(Date.prototype, 'daysInMonth', {
    value: function () {
        return this.endOfMonth().getDate();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the number of days in the current UTC month of the date.
 * @return {number} The total number of days in the UTC month.
 */
Object.defineProperty(Date.prototype, 'daysInMonthUTC', {
    value: function () {
        return this.endOfMonthUTC().getUTCDate();
    },
    writable: false,
    configurable: false,
    enumerable: false
});
/**
 * Returns the number of days in the current Spain:Europe/Madrid month of the date.
 * @return {number} The total number of days in the Spain:Europe/Madrid month.
 */
Object.defineProperty(Date.prototype, 'daysInMonthSpain', {
    value: function () {
        return this.endOfMonthSpain().getTime() - this.startOfMonthSpain().getTime() >= 0 ? new Date(this.endOfMonthSpain().getTime() - this.startOfMonthSpain().getTime()).getUTCDate() : 0;
    },
    writable: false,
    configurable: false,
    enumerable: false
});
//#region Time zones help
const SPAIN_TIME_ZONE = 'Europe/Madrid';
function getTimeZoneOffsetMinutes(date, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'shortOffset',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    const value = formatter.formatToParts(date)
        .find(part => part.type === 'timeZoneName')?.value ?? 'GMT';
    const match = value.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
    if (!match)
        return 0;
    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2] || 0);
    const minutes = Number(match[3] || 0);
    return sign * (hours * 60 + minutes);
}
function getPartsInTimeZone(date, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        weekday: 'short',
    });
    const parts = formatter.formatToParts(date);
    const values = {};
    for (const part of parts)
        if (part.type !== 'literal')
            values[part.type] = part.value;
    const weekdayMap = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };
    return {
        year: Number(values.year ?? '0'),
        month: Number(values.month ?? '0'),
        day: Number(values.day ?? '0'),
        hour: Number(values.hour ?? '0'),
        minute: Number(values.minute ?? '0'),
        second: Number(values.second ?? '0'),
        weekday: weekdayMap[values.weekday ?? 'Sun'] ?? 0,
    };
}
//#endregion
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
Promise['sleep'] = function (ms) {
    if (!Number.isInteger(ms) || ms < 0)
        throw new Error("Milliseconds must be an integer bigger or equal to 0");
    return new Promise(resolve => setTimeout(resolve, ms));
};
//#endregion
