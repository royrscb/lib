/* eslint-disable no-unused-vars */
export {};

declare global {
    interface Number {
        /**
         * Returns the largest integer less than or equal to the number.
         * @return {number} The value of Math.floor(this)
         */
        floor(this: number): number;
        /**
         * Rounds the number to the given number of decimals.
         * @param {number} decimals Number of decimal places (default 0)
         * @return {number} Rounded number
         */
        round(this: number, decimals: number = 0): number;
        /**
         * Returns the smallest integer greater than or equal to the number.
         * @return {number} The value of Math.ceil(this)
         */
        ceil(this: number): number;

        /**
         * Clamps the number between min and max (inclusive).
         * @param {number} min Minimum allowed value.
         * @param {number} max Maximum allowed value.
         * @return {number} The number constrained to the range [min, max].
         */
        clamp(this: number, min: number, max: number): number;

        /**
         * Calculates the given percent of this number.
         * @param {number} percent Percentage to calculate (e.g. 10 for 10%).
         * @return {number} The value corresponding to `percent` percent of this number.
         */
        getPercent(this: number, percent: number): number;
        /**
         * Calculates what percent this number is of the provided total.
         * @param {number} total The total value used as denominator.
         * @return {number} The percentage (0-100) that this number represents of total.
         */
        percentOf(this: number, total: number): number;

        /**
         * Formats the number as a price string, showing 2 decimals if needed.
         * @return {string} Price string, e.g. "10" or "10.50"
         */
        prettyPrice(this: number): string;
    }

    interface String {
        /**
         * Checks if the string is empty.
         * @return {boolean} true if string has no length, false otherwise
         */
        isEmpty(this: string): boolean;

        /**
         * Checks if the string represents a numeric value.
         * Returns false for empty or whitespace-only strings.
         * @return {boolean} true if the string can be parsed to a finite number, false otherwise.
         */
        isNumeric(this: string): boolean;

        /**
         * Converts the string to a number and rounds it.
         * @param {number} decimals Number of decimal places (default 0)
         * @return {number} Rounded number
         * @throws Error if the string cannot be parsed to a number
         */
        round(this: string, decimals: number = 0): number;

        /**
         * Capitalizes the first letter of the string.
         * @return {string} String with the first character uppercase
         */
        upperCaseFirst(this: string): string;
        /**
         * Capitalizes words conditionally.
         * Words with length >= minLengthToUpperCaseFirst are capitalized.
         * @param {number} minLengthToUpperCaseFirst Minimum length for words to capitalize (default 4)
         * @return {string} String with words capitalized according to rule
         */
        prettyUpperCase(this: string, minLengthToUpperCaseFirst: number = 4): string;
        /**
         * Formats the number as a price string, showing 2 decimals if needed.
         * @return {string} Price string, e.g. "10" or "10.50"
         * @throws Error if the string cannot be parsed to a number
         */
        prettyPrice(this: string): string;
    }

    interface Array<T> {
        /**
         * Checks if the array is empty.
         * @return {boolean} true if array has no elements, false otherwise
         */
        isEmpty<T>(this: T[]): boolean;
        /**
         * Checks if the array has any elements.
         * @return {boolean} true if array has at least one element
         */
        any<T>(this: T[]): boolean;
        /**
         * Returns the first element of the array.
         * @return {T | undefined} The first element, or undefined if the array is empty
         */
        first<T>(this: T[]): T | undefined;
        /**
         * Returns the last element of the array.
         * @return {T | undefined} The last element, or undefined if the array is empty
         */
        last<T>(this: T[]): T | undefined;

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
         * @param {(item: T) => boolean | number | string | null | undefined} predicate A function that returns the value used for sorting each element.
         * @return {T[]} array sorted by predicate return value
         * @note This mutates the array.
         */
        sortBy<T>(this: T[], predicate: (item: T) => boolean | number | string | null | undefined): T[];
        /**
         * Shuffle the array in-place using Fisher–Yates.
         * @return {T[]} shuffled array
         * @note This mutates the array.
         */
        shuffle<T>(this: T[]): T[];

        /**
         * Group array elements by a key returned from predicate.
         * @param {(item: T, index: number) => string | number} predicate - key selector
         * @return {Record<string, T[]>} groups keyed by predicate
         */
        groupBy<T>(this: T[], predicate: (item: T, index: number) => string | number): Record<string, T[]>;
        /**
         * Splits the array into chunks of given size.
         * @param {number} size - Size of each chunk (must be > 0).
         * @return {T[][]} An array of chunks (arrays) each of length <= size.
         * @throws Error if size <= 0.
         */
        chunk<T>(this: T[], size: number): T[][];

        /**
         * Return a single instance of each value that appears more than once.
         * Example: [1,1,1,1,2,2,3] -> [1,2]
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @return {T[]} array of one item per duplicated key
         */
        getDuplicates<T>(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];
        /**
         * Return all elements that belong to duplicated keys (keep original order,
         * include each duplicate occurrence except the first one of each key).
         * Example: [1,1,1,1,2,2,3] -> [1,1,1,1,2,2]
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @return {T[]} array with all duplicate occurrences (predicate called once per element)
         */
        getDuplicatesAll<T>(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];
        /**
         * Return array with first occurrence of each key (keeps first item for each key).
         * @param {(item: T, index: number) => boolean | number | string | null | undefined} [predicate]
         * @return {T[]} array with unique items by key (first wins)
         */
        removeDuplicates<T>(this: T[], predicate?: (item: T, index: number) => boolean | number | string | null | undefined): T[];

        /**
         * Removes the element at the specified index.
         * @param {number} indexToRemove Index to remove
         * @return {T[]} New array with the element removed
         */
        removeIndex<T>(this: T[], indexToRemove: number): T[];
        /**
         * Removes one element matching the predicate.
         * @param {(item: T, index: number) => boolean} predicate Function to determine which element to remove
         * @return {T[]} New array with the element removed
         */
        removeOne<T>(this: T[], predicate: (item: T, index: number) => boolean): T[];
        /**
         * Removes all elements matching the predicate.
         * @param {(item: T, index: number) => boolean} predicate Function to determine which elements to remove
         * @return {T[]} New array with elements removed
         */
        removeAll<T>(this: T[], predicate: (item: T, index: number) => boolean): T[];

        /**
         * Returns the sum of elements according to an optional predicate.
         * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element
         * @param {number} initialValue Optional initial value for sum (default 0)
         * @return {number} Sum of elements
         */
        sum<T>(this: T[], predicate?: (item: T, index: number) => number, initialValue: number = 0): number;
        /**
         * Returns the element with the maximum value according to an optional predicate.
         * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element
         * @return {T | undefined} Element with maximum value, or undefined if array is empty
         */
        max<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined;
        /**
         * Returns the element with the minimum value according to an optional predicate.
         * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element
         * @return {T | undefined} Element with minimum value, or undefined if array is empty
         */
        min<T>(this: T[], predicate?: (item: T, index: number) => number): T | undefined;
        /**
         * Returns the average of elements, optionally using a selector predicate.
         * @param {(item: T, index: number) => number} predicate Optional function to extract numeric value from element.
         * @return {number | undefined} The average value or undefined if the array is empty.
         * @throws Error if no predicate provided and array elements are not numbers.
         */
        average<T>(this: T[], predicate?: (item: T, index: number) => number): number | undefined;
    }

    interface DateConstructor {
        /**
         * Returns the Unix timestamp (in seconds).
         * @return {number} Number of seconds since Unix epoch (January 1, 1970 UTC)
         */
        nowUnixTime(): number;

        /**
         * Converts a Unix timestamp (seconds) to a Date.
         * @param {number} unixTime - Timestamp in seconds.
         * @return {Date} Date object for the given Unix time.
         */
        fromUnixTime(unixTime: number): Date;

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
        monthsBetween(a: Date | number, b: Date | number): number;
    }
    interface Date {
        // Time change ---

        /**
         * Adds the specified number of milliseconds to the date and returns a new Date instance.
         * @param {number} milliseconds - Number of milliseconds to add.
         * @return {Date} A new Date instance with the milliseconds added.
         */
        addMillis(this: Date, milliseconds: number);
        /**
         * Adds the specified number of seconds to the date and returns a new Date instance.
         * @param {number} seconds - Number of seconds to add.
         * @return {Date} A new Date instance with the seconds added.
         */
        addSeconds(this: Date, seconds: number);
        /**
         * Adds the specified number of minutes to the date and returns a new Date instance.
         * @param {number} minutes - Number of minutes to add.
         * @return {Date} A new Date instance with the minutes added.
         */
        addMinutes(this: Date, minutes: number);
        /**
         * Adds the specified number of hours to the date and returns a new Date instance.
         * @param {number} hours - Number of hours to add.
         * @return {Date} A new Date instance with the hours added.
         */
        addHours(this: Date, hours: number);
        /**
         * Adds the specified number of days to the date and returns a new Date instance.
         * @param {number} days - Number of days to add.
         * @return {Date} A new Date instance with the days added.
         */
        addDays(this: Date, days: number);
        /**
         * Adds the specified number of weeks to the date and returns a new Date instance.
         * @param {number} weeks - Number of weeks to add.
         * @return {Date} A new Date instance with the weeks added.
         */
        addWeeks(this: Date, weeks: number);
        /**
         * Adds the specified number of months to the date and returns a new Date instance.
         * @param {number} months - Number of months to add.
         * @return {Date} A new Date instance with the months added.
         */
        addMonths(this: Date, months: number);
        /**
         * Adds the specified number of years to the date and returns a new Date instance.
         * @param {number} years - Number of years to add.
         * @return {Date} A new Date instance with the years added.
         */
        addYears(this: Date, years: number);

        /**
         * Returns a new Date representing the first hour of the day at 00:00:00.
         * @return {Date} A new Date at the start of the day.
         */
        startOfDay(this: Date);
        /**
         * Returns a new Date representing the first day of the week at 00:00:00.
         * @param {boolean} weekStartsOnMonday - The day of the week to start. Default on sunday.
         * @return {Date} A new Date at the start of the week.
         */
        startOfWeek(this: Date, weekStartsOnMonday: boolean = false);
        /**
         * Returns a new Date representing the first day of the month at 00:00:00.
         * @return {Date} A new Date at the start of the month.
         */
        startOfMonth(this: Date);
        /**
         * Returns a new Date representing January 1st of the year at 00:00:00.
         * @return {Date} A new Date at the start of the year.
         */
        startOfYear(this: Date);

        /**
         * Returns a new Date representing the last hour of the day at 23:59:59.999.
         * @return {Date} A new Date at the end of the day.
         */
        endOfDay(this: Date);
        /**
         * Returns a new Date representing the last day of the week at 23:59:59.999.
         * @param {boolean} weekStartsOnMonday - The day of the week to start. Default on sunday.
         * @return {Date} A new Date at the end of the week.
         */
        endOfWeek(this: Date, weekStartsOnMonday: boolean = false);
        /**
         * Returns a new Date representing the last day of the month at 23:59:59.999.
         * @return {Date} A new Date at the end of the month.
         */
        endOfMonth(this: Date);
        /**
         * Returns a new Date representing December 31st of the year at 23:59:59.999.
         * @return {Date} A new Date at the end of the year.
         */
        endOfYear(this: Date);

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
         */
        format(this: Date, pattern: string, lang: string = 'en');

        /**
         * Returns the date formatted as YYYY-MM-DD.
         * @return {string} A string representing the date in YYYY-MM-DD format.
         */
        toDayKey(this: Date);
        /**
         * Returns the month and year formatted as YYYY-MM.
         * @return {string} A string representing the month in YYYY-MM format.
         */
        toMonthKey(this: Date);

        /**
         * Returns the date formatted for input[type="date"] value.
         * @return {string} A string in YYYY-MM-DD format.
         */
        toInputDateValue(this: Date);
        /**
         * Returns the date formatted for input[type="datetime-local"] value.
         * @return {string} A string in YYYY-MM-DDTHH:MM format.
         */
        toInputDatetimeLocalValue(this: Date);

        // Comparation ---

        /**
         * Checks if the date is in the past compared to now.
         * @return {boolean} True if the date is earlier than the current time, false otherwise.
         */
        isPast(this: Date);
        /**
         * Checks if the date is in the future compared to now.
         * @return {boolean} True if the date is later than the current time, false otherwise.
         */
        isFuture(this: Date);

        /**
         * Checks if two dates are on the same day.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same year, month, and day; otherwise false.
         */
        isSameDay(this: Date, other: Date | number);
        /**
         * Checks if two dates are on the same week.
         * @param {Date | number} other - The date to compare against.
         * @param {boolean} weekStartsOnMonday - The day of the week to start. Default on sunday.
         * @return {boolean} True if both dates are in the same week; otherwise false.
         */
        isSameWeek(this: Date, other: Date | number, weekStartsOnMonday: boolean = false);
        /**
         * Checks if two dates are on the same month.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same year and month; otherwise false.
         */
        isSameMonth(this: Date, other: Date | number);
        /**
         * Checks if two dates are on the same year.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same year; otherwise false.
         */
        isSameYear(this: Date, other: Date | number);

        /**
         * Indicates whether the date falls on a weekend (Saturday or Sunday).
         * @return {boolean} true if the day is Saturday (6) or Sunday (0), otherwise false.
         */
        isWeekend(this: Date);

        // Misc ---

        /**
         * Returns the Unix timestamp (in seconds) for this Date.
         * @return {number} Number of seconds since Unix epoch (January 1, 1970 UTC)
         */
        getUnixTime(this: Date);

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
        monthsUntil(this: Date, other: Date | number);

        /**
         * Returns the number of days in the current month of the date.
         * @return {number} The total number of days in the month.
         */
        daysInMonth(this: Date);
    }
}
