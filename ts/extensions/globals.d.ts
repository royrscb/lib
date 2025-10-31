/* eslint-disable no-unused-vars */
export {};

declare global {
    // Number -------------------------------------
    interface Number {
        /**
         * Rounds the number to the given number of decimals.
         * @param decimals Number of decimal places (default 0)
         * @returns Rounded number
         */
        round(decimals?: number): number;

        /**
         * Formats the number as a price string, showing 2 decimals if needed.
         * @returns Price string, e.g. "10" or "10.50"
         */
        prettyPrice(): string;
    }

    // String -------------------------------------
    interface String {
        /**
         * Checks if the string is empty.
         * @returns true if string has no length, false otherwise
         */
        isEmpty(): boolean;

        /**
         * Converts the string to a number and rounds it.
         * @param decimals Number of decimal places (default 0)
         * @throws Error if the string cannot be parsed to a number
         * @returns Rounded number
         */
        round(decimals?: number): number;

        /**
         * Converts the string to a number and formats it as a price string.
         * @throws Error if the string cannot be parsed to a number
         * @returns Price string
         */
        prettyPrice(): string;

        /**
         * Capitalizes the first letter of the string.
         * @returns String with the first character uppercase
         */
        upperCaseFirst(): string;

        /**
         * Capitalizes words conditionally.
         * Words with length >= minLengthToUpperCaseFirst are capitalized.
         * @param minLengthToUpperCaseFirst Minimum length for words to capitalize (default 4)
         * @returns String with words capitalized according to rule
         */
        prettyUpperCase(minLengthToUpperCaseFirst?: number): string;
    }

    // Array --------------------------------------
    interface Array<T> {
        /**
         * Checks if the array is empty.
         * @returns true if array has no elements, false otherwise
         */
        isEmpty(): boolean;

        /**
         * Checks if the array has any elements.
         * @returns true if array has at least one element
         */
        any(): boolean;

        /**
         * Returns the first element of the array.
         * @returns The first element, or undefined if the array is empty
         */
        first(): T | undefined;

        /**
         * Returns the last element of the array.
         * @returns The last element, or undefined if the array is empty
         */
        last(): T | undefined;

        /**
         * Returns a new array skipping the first `count` elements.
         * @param {number} count - Number of elements to skip from the start.
         * @return {T[]} A new array without the first `count` elements.
         */
        skip<T>(this: T[], count: number): T[];
        /**
         * Returns a new array skipping the last `count` elements.
         * @param {number} count - Number of elements to skip from the end.
         * @return {T[]} A new array without the last `count` elements.
         */
        skipLast<T>(this: T[], count: number): T[];

        /**
         * Returns a new array containing the first `count` elements.
         * @param {number} count - Number of elements to take from the start.
         * @return {T[]} A new array with the first `count` elements.
         */
        take<T>(this: T[], count: number): T[];
        /**
         * Returns a new array containing the last `count` elements.
         * @param {number} count - Number of elements to take from the end.
         * @return {T[]} A new array with the last `count` elements.
         */
        takeLast<T>(this: T[], count: number): T[];

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
        sortBy<T>(this: T[], predicate: (item: T) => boolean | number | string | null | undefined): void;

        /**
         * Shuffle the array in-place using Fisher–Yates.
         * @returns {void}
         * @note This mutates the array.
         */
        shuffle(): void;

        /**
         * Group array elements by a key returned from predicate.
         * @param {(item: T, index: number) => string | number} predicate - key selector
         * @returns {Record<string, T[]>} groups keyed by predicate
         */
        groupBy<T>(predicate: (item: T, index: number) => string | number): Record<string, T[]>;

        /**
         * Return a single instance of each value that appears more than once.
         * Example: [1,1,1,1,2,2,3] -> [1,2]
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @returns {T[]} array of one item per duplicated key
         */
        getDuplicates<T>(predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];
        
        /**
         * Return all elements that belong to duplicated keys (keep original order,
         * include each duplicate occurrence except the first one of each key).
         * Example: [1,1,1,1,2,2,3] -> [1,1,1,1,2,2]
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @returns {T[]} array with all duplicate occurrences (predicate called once per element)
         */
        getDuplicatesAll<T>(predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];

        /**
         * Return array with first occurrence of each key (keeps first item for each key).
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @returns {T[]} array with unique items by key (first wins)
         */
        removeDuplicates<T>(predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];

        /**
         * Removes the element at the specified index.
         * @param index Index to remove
         * @returns New array with the element removed
         */
        removeIndex(index: number): T[];

        /**
         * Removes one element matching the predicate.
         * @param predicate Function to determine which element to remove
         * @returns New array with the element removed
         */
        removeOne(predicate: (item: T, index: number) => boolean): T[];

        /**
         * Removes all elements matching the predicate.
         * @param predicate Function to determine which elements to remove
         * @returns New array with elements removed
         */
        removeAll(predicate: (item: T, index: number) => boolean): T[];

        /**
         * Returns the sum of elements according to an optional predicate.
         * @param predicate Optional function to extract numeric value from element
         * @param initialValue Optional initial value for sum (default 0)
         * @returns Sum of elements
         */
        sum(predicate?: (item: T, index: number) => number, initialValue?: number): number;

        /**
         * Returns the element with the maximum value according to an optional predicate.
         * @param predicate Optional function to extract numeric value from element
         * @returns Element with maximum value, or undefined if array is empty
         */
        max(predicate?: (item: T, index: number) => number): T | undefined;

        /**
         * Returns the element with the minimum value according to an optional predicate.
         * @param predicate Optional function to extract numeric value from element
         * @returns Element with minimum value, or undefined if array is empty
         */
        min(predicate?: (item: T, index: number) => number): T | undefined;
    }
}
