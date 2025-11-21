/* eslint-disable no-unused-vars */
export {};

declare global {
    interface Number {
        /**
         * Rounds the number to the given number of decimals.
         * @param decimals Number of decimal places (default 0)
         * @returns Rounded number
         */
        round(this: number, decimals?: number): number;

        /**
         * Formats the number as a price string, showing 2 decimals if needed.
         * @returns Price string, e.g. "10" or "10.50"
         */
        prettyPrice(this: number): string;
    }

    interface String {
        /**
         * Checks if the string is empty.
         * @returns true if string has no length, false otherwise
         */
        isEmpty(this: string): boolean;

        /**
         * Converts the string to a number and rounds it.
         * @param decimals Number of decimal places (default 0)
         * @throws Error if the string cannot be parsed to a number
         * @returns Rounded number
         */
        round(this: string, decimals?: number): number;

        /**
         * Capitalizes the first letter of the string.
         * @returns String with the first character uppercase
         */
        upperCaseFirst(this: string): string;
        /**
         * Capitalizes words conditionally.
         * Words with length >= minLengthToUpperCaseFirst are capitalized.
         * @param minLengthToUpperCaseFirst Minimum length for words to capitalize (default 4)
         * @returns String with words capitalized according to rule
         */
        prettyUpperCase(this: string, minLengthToUpperCaseFirst?: number): string;
        /**
         * Formats the number as a price string, showing 2 decimals if needed.
         * @throws Error if the string cannot be parsed to a number
         * @returns Price string, e.g. "10" or "10.50"
         */
        prettyPrice(this: string): string;
    }

    interface Array<T> {
        /**
         * Checks if the array is empty.
         * @returns true if array has no elements, false otherwise
         */
        isEmpty(this: T[]): boolean;
        /**
         * Checks if the array has any elements.
         * @returns true if array has at least one element
         */
        any(this: T[]): boolean;
        /**
         * Returns the first element of the array.
         * @returns The first element, or undefined if the array is empty
         */
        first(this: T[]): T | undefined;
        /**
         * Returns the last element of the array.
         * @returns The last element, or undefined if the array is empty
         */
        last(this: T[]): T | undefined;

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
         * @returns {T[]} array sorted by predicate return value
         * @note This mutates the array.
         */
        sortBy<T>(this: T[], predicate: (item: T) => boolean | number | string | null | undefined): T[];
        /**
         * Shuffle the array in-place using Fisher–Yates.
         * @returns {T[]} shuffled array
         * @note This mutates the array.
         */
        shuffle(this: T[]): T[];

        /**
         * Group array elements by a key returned from predicate.
         * @param {(item: T, index: number) => string | number} predicate - key selector
         * @returns {Record<string, T[]>} groups keyed by predicate
         */
        groupBy(this: T[], predicate: (item: T, index: number) => string | number): Record<string, T[]>;

        /**
         * Return a single instance of each value that appears more than once.
         * Example: [1,1,1,1,2,2,3] -> [1,2]
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @returns {T[]} array of one item per duplicated key
         */
        getDuplicates(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];
        /**
         * Return all elements that belong to duplicated keys (keep original order,
         * include each duplicate occurrence except the first one of each key).
         * Example: [1,1,1,1,2,2,3] -> [1,1,1,1,2,2]
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @returns {T[]} array with all duplicate occurrences (predicate called once per element)
         */
        getDuplicatesAll(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];
        /**
         * Return array with first occurrence of each key (keeps first item for each key).
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @returns {T[]} array with unique items by key (first wins)
         */
        removeDuplicates(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];

        /**
         * Removes the element at the specified index.
         * @param index Index to remove
         * @returns New array with the element removed
         */
        removeIndex(this: T[], index: number): T[];
        /**
         * Removes one element matching the predicate.
         * @param predicate Function to determine which element to remove
         * @returns New array with the element removed
         */
        removeOne(this: T[], predicate: (item: T, index: number) => boolean): T[];
        /**
         * Removes all elements matching the predicate.
         * @param predicate Function to determine which elements to remove
         * @returns New array with elements removed
         */
        removeAll(this: T[], predicate: (item: T, index: number) => boolean): T[];

        /**
         * Returns the sum of elements according to an optional predicate.
         * @param predicate Optional function to extract numeric value from element
         * @param initialValue Optional initial value for sum (default 0)
         * @returns Sum of elements
         */
        sum(this: T[], predicate?: (item: T, index: number) => number, initialValue?: number): number;
        /**
         * Returns the element with the maximum value according to an optional predicate.
         * @param predicate Optional function to extract numeric value from element
         * @returns Element with maximum value, or undefined if array is empty
         */
        max(this: T[], predicate?: (item: T, index: number) => number): T | undefined;
        /**
         * Returns the element with the minimum value according to an optional predicate.
         * @param predicate Optional function to extract numeric value from element
         * @returns Element with minimum value, or undefined if array is empty
         */
        min(this: T[], predicate?: (item: T, index: number) => number): T | undefined;
    }

    interface DateConstructor {
        /**
         * Returns the Unix timestamp (in seconds).
         * @returns Number of seconds since Unix epoch (January 1, 1970 UTC)
         */
        nowUnixTime(): number;

        /**
         * Creates a Date from a Unix timestamp in seconds.
         * @param unixTime - Timestamp in seconds
         * @returns Date object
         */
        fromUnixTime(unixTime: number): Date;

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
        monthsBetween(a: Date, b: Date): number;
    }
    interface Date {
        /**
         * Returns the Unix timestamp (in seconds) for this Date.
         * @returns Number of seconds since Unix epoch (January 1, 1970 UTC)
         */
        getUnixTime(this: Date): number;

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
        monthsUntil(this: Date, other: Date): number;

        // Add time ---
        /**
         * Adds the specified number of milliseconds to the date and returns a new Date instance.
         * @param milliseconds - Number of milliseconds to add.
         * @returns A new Date instance with the milliseconds added.
         */
        addMillis(this: Date, milliseconds: number): Date;
        /**
         * Adds the specified number of seconds to the date and returns a new Date instance.
         * @param seconds - Number of seconds to add.
         * @returns A new Date instance with the seconds added.
         */
        addSeconds(this: Date, seconds: number): Date;
        /**
         * Adds the specified number of minutes to the date and returns a new Date instance.
         * @param minutes - Number of minutes to add.
         * @returns A new Date instance with the minutes added.
         */
        addMinutes(this: Date, minutes: number): Date;
        /**
         * Adds the specified number of hours to the date and returns a new Date instance.
         * @param hours - Number of hours to add.
         * @returns A new Date instance with the hours added.
         */
        addHours(this: Date, hours: number): Date;
        /**
         * Adds the specified number of days to the date and returns a new Date instance.
         * @param days - Number of days to add.
         * @returns A new Date instance with the days added.
         */
        addDays(this: Date, days: number): Date;
        /**
         * Adds the specified number of weeks to the date and returns a new Date instance.
         * @param weeks - Number of weeks to add.
         * @returns A new Date instance with the weeks added.
         */
        addWeeks(this: Date, weeks: number): Date;
        /**
         * Adds the specified number of months to the date and returns a new Date instance.
         * @param months - Number of months to add.
         * @returns A new Date instance with the months added.
         */
        addMonths(this: Date, months: number): Date;
        /**
         * Adds the specified number of years to the date and returns a new Date instance.
         * @param years - Number of years to add.
         * @returns A new Date instance with the years added.
         */
        addYears(this: Date, years: number): Date;

        /**
         * Returns a new Date representing the first day of the month at 00:00:00.
         * @returns A new Date at the start of the month.
         */
        startOfMonth(this: Date): Date;
        /**
         * Returns a new Date representing January 1st of the year at 00:00:00.
         * @returns A new Date at the start of the year.
         */
        startOfYear(this: Date): Date;

        /**
         * Returns a new Date representing the last day of the month at 23:59:59.999.
         * @returns A new Date at the end of the month.
         */
        endOfMonth(this: Date): Date;
        /**
         * Returns a new Date representing December 31st of the year at 23:59:59.999.
         * @returns A new Date at the end of the year.
         */
        endOfYear(this: Date): Date;

        // To X format ---
        /**
         * Returns the date formatted as YYYY-MM-DD.
         * @returns A string representing the date in YYYY-MM-DD format.
         */
        toDayKey(this: Date): string;
        /**
         * Returns the month and year formatted as YYYY-MM.
         * @returns A string representing the month in YYYY-MM format.
         */
        toMonthKey(this: Date): string;

        /**
         * Returns the date formatted for input[type="date"] value.
         * @returns A string in YYYY-MM-DD format.
         */
        toInputDateValue(this: Date): string;
        /**
         * Returns the date formatted for input[type="datetime-local"] value.
         * @returns A string in YYYY-MM-DDTHH:MM format.
         */
        toInputDatetimeLocalValue(this: Date): string;

        // Comparation ---
        /**
         * Checks if the date is in the past compared to now.
         * @returns True if the date is earlier than the current time, false otherwise.
         */
        isPast(this: Date): boolean;
        /**
         * Checks if the date is in the future compared to now.
         * @returns True if the date is later than the current time, false otherwise.
         */
        isFuture(this: Date): boolean;

        /**
         * Checks if two dates are on the same day.
         * @param other - The date to compare against.
         * @returns True if both dates share the same year, month, and day; otherwise false.
         */
        isSameDay(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are on the same month.
         * @param other - The date to compare against.
         * @returns True if both dates share the same year and month; otherwise false.
         */
        isSameMonth(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are on the same year.
         * @param other - The date to compare against.
         * @returns True if both dates share the same year; otherwise false.
         */
        isSameYear(this: Date, other: Date | number): boolean;
    }
}
