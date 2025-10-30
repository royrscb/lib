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
         * Shuffles the elements of the array in place.
         * @returns void
         */
        shuffle(): void;

        /**
         * Returns all duplicate elements according to an optional predicate.
         * @param predicate Optional function to determine the key to check for duplicates
         * @returns Array of duplicate elements
         */
        getDuplicates<T, TKey = T>(predicate?: (item: T) => T | TKey): T[];

        /**
         * Returns a new array with duplicates removed according to an optional predicate.
         * @param predicate Optional function to determine the key to check for duplicates
         * @returns New array with duplicates removed
         */
        removeDuplicates<T, TKey = T>(predicate?: (item: T) => TKey): T[];

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
         * Groups elements by a key returned by the predicate.
         * @param predicate Function that returns a string key for each element
         * @returns Object where keys are group names and values are arrays of elements
         */
        groupBy<T>(predicate: (item: T, index: number) => string): Record<string, T[]>;

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
