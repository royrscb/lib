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
         * Clamps the number between min (inclusive) and max (inclusive).
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

        /**
         * Replaces separators (-, _) with spaces.
         * Example: "hello_world-test" -> "hello world test"
         * @return {string}
         */
        toWords(this: string): string;

        /**
         * Converts string to camelCase.
         * Example: "hello world" -> "helloWorld"
         * @return {string}
         */
        toCamelCase(this: string): string;
        /**
         * Converts string to PascalCase.
         * Example: "hello world" -> "HelloWorld"
         * @return {string}
         */
        toPascalCase(this: string): string;
        /**
         * Converts string to snake_case.
         * Example: "HeLLo WoRld" -> "hello_world"
         * @return {string}
         */
        toSnakeCase(this: string): string;
        /**
         * Converts string to kebab-case.
         * Example: "HeLLo WoRld" -> "hello-world"
         * @return {string}
         */
        toKebabCase(this: string): string;
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
         * Returns a shallow copy of the array.
         * The original array is not modified.
         * Elements are copied by reference (objects and arrays inside are NOT cloned).
         * @return {T[]} A new array containing the same elements.
         */
        copy<T>(this: T[]): T[];

        /**
         * Returns a new array skipping the first `count` elements.
         * @param {number} count - Number of elements to skip from the start. Default 1.
         * @return {T[]} A new array without the first `count` elements.
         */
        skip<T>(this: T[], count: number = 1): T[];
        /**
         * Returns a new array skipping the last `count` elements.
         * @param {number} count - Number of elements to skip from the end. Default 1.
         * @return {T[]} A new array without the last `count` elements.
         */
        skipLast<T>(this: T[], count: number = 1): T[];

        /**
         * Returns a new array containing the first `count` elements.
         * @param {number} count - Number of elements to take from the start. Default 1.
         * @return {T[]} A new array with the first `count` elements.
         */
        take<T>(this: T[], count: number = 1): T[];
        /**
         * Returns a new array containing the last `count` elements.
         * @param {number} count - Number of elements to take from the end. Default 1.
         * @return {T[]} A new array with the last `count` elements.
         */
        takeLast<T>(this: T[], count: number = 1): T[];

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
        sortBy<T>(this: T[], predicate?: (item: T) => boolean | number | string | null | undefined): T[];
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
        sortByDescending<T>(this: T[], predicate?: (item: T) => boolean | number | string | null | undefined): T[];
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
         * Return all elements that belong to duplicated keys (keep original order, include each duplicate occurrence).
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
         * Swaps two elements in the array by index.
         * @param {number} indexA First index
         * @param {number} indexB Second index
         * @return {T[]} New array with the elements swapped
         */
        swapIndex<T>(this: T[], indexA: number, indexB: number): T[];

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
         * Creates a Date from a local date string in YYYY-MM-DD format.
         *
         * @param {string} value A local date string.
         * @return {Date} A Date representing midnight in the local timezone.
         */
        fromDateStr(value: string): Date;
        /**
         * Creates a Date from a UTC date string in YYYY-MM-DD format.
         *
         * @param {string} value A UTC date string.
         * @return {Date} A Date representing midnight UTC of the specified date.
         */
        fromUTCDateStr(value: string): Date;
        /**
         * Creates a Date from a Spain:Europe/Madrid date string in YYYY-MM-DD format.
         *
         * @param {string} value A Spain:Europe/Madrid date string.
         * @return {Date} A Date representing midnight in Spain:Europe/Madrid.
         */
        fromSpainDateStr(value: string): Date;

        /**
         * Creates a Date from a local dateTime string in YYYY-MM-DD HH:mm:ss format.
         *
         * @param {string} value A local dateTime string.
         * @return {Date} A Date representing the specified local dateTime.
         */
        fromDateTimeStr(value: string): Date;
        /**
         * Creates a Date from a UTC dateTime string in YYYY-MM-DD HH:mm:ss format.
         *
         * @param {string} value A UTC dateTime string.
         * @return {Date} A Date representing the specified UTC dateTime.
         */
        fromUTCDateTimeStr(value: string): Date;
        /**
         * Creates a Date from a Spain:Europe/Madrid dateTime string in YYYY-MM-DD HH:mm:ss format.
         *
         * @param {string} value A Spain:Europe/Madrid dateTime string.
         * @return {Date} A Date representing the specified Spain:Europe/Madrid dateTime.
         */
        fromSpainDateTimeStr(value: string): Date;

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
        monthsBetween(a: Date | number, b: Date | number): number;
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
        monthsBetweenUTC(a: Date | number, b: Date | number): number;
        /**
         * Calculates the number of whole months between two dates using Spain:Europe/Madrid year and month fields.
         * Positive if `b` is after `a`, negative if `b` is before `a`.
         * Ignores days and times; only Spain:Europe/Madrid year and month fields are used.
         *
         * @param {Date} a The starting date.
         * @param {Date} b The ending date.
         * @return {number} The signed number of Spain:Europe/Madrid months between `a` and `b`.
         */
        monthsBetweenSpain(a: Date | number, b: Date | number): number;
    }
    interface Date {
        // Time change ---

        /**
         * Adds the specified number of milliseconds to the date and returns a new Date instance.
         * @param {number} milliseconds - Number of milliseconds to add.
         * @return {Date} A new Date instance with the milliseconds added.
         */
        addMillis(this: Date, milliseconds: number): Date;
        /**
         * Adds the specified number of seconds to the date and returns a new Date instance.
         * @param {number} seconds - Number of seconds to add.
         * @return {Date} A new Date instance with the seconds added.
         */
        addSeconds(this: Date, seconds: number): Date;
        /**
         * Adds the specified number of minutes to the date and returns a new Date instance.
         * @param {number} minutes - Number of minutes to add.
         * @return {Date} A new Date instance with the minutes added.
         */
        addMinutes(this: Date, minutes: number): Date;
        /**
         * Adds the specified number of hours to the date and returns a new Date instance.
         * @param {number} hours - Number of hours to add.
         * @return {Date} A new Date instance with the hours added.
         */
        addHours(this: Date, hours: number): Date;
        /**
         * Adds the specified number of days to the date and returns a new Date instance.
         * @param {number} days - Number of days to add.
         * @return {Date} A new Date instance with the days added.
         */
        addDays(this: Date, days: number): Date;
        /**
         * Adds the specified number of weeks to the date and returns a new Date instance.
         * @param {number} weeks - Number of weeks to add.
         * @return {Date} A new Date instance with the weeks added.
         */
        addWeeks(this: Date, weeks: number): Date;
        /**
         * Adds the specified number of months using local date fields.
         * If the target month does not contain the original day, the last day of the target month is used.
         *
         * @param {number} months - Number of months to add.
         * @return {Date} A new Date instance with the months added using local time.
         */
        addMonths(this: Date, months: number): Date;
        /**
         * Adds the specified number of months using UTC date fields.
         * If the target month does not contain the original day, the last day of the target month is used.
         *
         * @param {number} months - Number of months to add.
         * @return {Date} A new Date instance with the months added using UTC.
         */
        addMonthsUTC(this: Date, months: number): Date;
        /**
         * Adds the specified number of months using Spain:Europe/Madrid date fields.
         * If the target month does not contain the original day, the last day of the target month is used.
         *
         * @param {number} months - Number of months to add.
         * @return {Date} A new Date instance with the months added using Spain:Europe/Madrid time.
         */
        addMonthsSpain(this: Date, months: number): Date;
        /**
         * Adds the specified number of years using local date fields.
         * If the original date is February 29 and the target year is not a leap year, the result is February 28.
         *
         * @param {number} years - Number of years to add.
         * @return {Date} A new Date instance with the years added using local time.
         */
        addYears(this: Date, years: number): Date;
        /**
         * Adds the specified number of years using UTC date fields.
         * If the original date is February 29 and the target year is not a leap year, the result is February 28.
         *
         * @param {number} years - Number of years to add.
         * @return {Date} A new Date instance with the years added using UTC.
         */
        addYearsUTC(this: Date, years: number): Date;
        /**
         * Adds the specified number of years using Spain:Europe/Madrid date fields.
         * If the original date is February 29 and the target year is not a leap year, the result is February 28.
         *
         * @param {number} years - Number of years to add.
         * @return {Date} A new Date instance with the years added using Spain:Europe/Madrid time.
         */
        addYearsSpain(this: Date, years: number): Date;

        /**
         * Returns a new Date representing 00:00:00 at the start of the local calendar day.
         * @return {Date} A new Date at the start of the local day.
         */
        startOfDay(this: Date): Date;
        /**
         * Returns a new Date representing 00:00:00 UTC at the start of the UTC calendar day.
         * @return {Date} A new Date at the start of the UTC day.
         */
        startOfDayUTC(this: Date): Date;
        /**
         * Returns a new Date representing 00:00:00 Spain:Europe/Madrid at the start of the Spain:Europe/Madrid calendar day.
         * @return {Date} A new Date at the start of the Spain:Europe/Madrid day.
         */
        startOfDaySpain(this: Date): Date;
        /**
         * Returns a new Date representing the first day of the local week at 00:00:00.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {Date} A new Date at the start of the local week.
         */
        startOfWeek(this: Date, weekStartsOnMonday: boolean = false): Date;
        /**
         * Returns a new Date representing the first day of the UTC week at 00:00:00 UTC.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {Date} A new Date at the start of the UTC week.
         */
        startOfWeekUTC(this: Date, weekStartsOnMonday: boolean = false): Date;
        /**
         * Returns a new Date representing the first day of the Spain:Europe/Madrid week at 00:00:00 Spain:Europe/Madrid.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {Date} A new Date at the start of the Spain:Europe/Madrid week.
         */
        startOfWeekSpain(this: Date, weekStartsOnMonday: boolean = false): Date;
        /**
         * Returns a new Date representing the first day of the local month at 00:00:00.
         * @return {Date} A new Date at the start of the local month.
         */
        startOfMonth(this: Date): Date;
        /**
         * Returns a new Date representing the 1st of the UTC calendar month at 00:00:00 UTC.
         * @return {Date} A new Date at the start of the UTC month.
         */
        startOfMonthUTC(this: Date): Date;
        /**
         * Returns a new Date representing the 1st of the Spain:Europe/Madrid calendar month at 00:00:00 Spain:Europe/Madrid.
         * @return {Date} A new Date at the start of the Spain:Europe/Madrid month.
         */
        startOfMonthSpain(this: Date): Date;
        /**
         * Returns a new Date representing January 1st of the local calendar year at 00:00:00.
         * @return {Date} A new Date at the start of the local year.
         */
        startOfYear(this: Date): Date;
        /**
         * Returns a new Date representing January 1st of the UTC calendar year at 00:00:00 UTC.
         * @return {Date} A new Date at the start of the UTC year.
         */
        startOfYearUTC(this: Date): Date;
        /**
         * Returns a new Date representing January 1st of the Spain:Europe/Madrid calendar year at 00:00:00 Spain:Europe/Madrid.
         * @return {Date} A new Date at the start of the Spain:Europe/Madrid year.
         */
        startOfYearSpain(this: Date): Date;

        /**
         * Returns a new Date representing 23:59:59.999 at the end of the local calendar day.
         * @return {Date} A new Date at the end of the local day.
         */
        endOfDay(this: Date): Date;
        /**
         * Returns a new Date representing 23:59:59.999 UTC at the end of the UTC calendar day.
         * @return {Date} A new Date at the end of the UTC day.
         */
        endOfDayUTC(this: Date): Date;
        /**
         * Returns a new Date representing 23:59:59.999 Spain:Europe/Madrid at the end of the Spain:Europe/Madrid calendar day.
         * @return {Date} A new Date at the end of the Spain:Europe/Madrid day.
         */
        endOfDaySpain(this: Date): Date;
        /**
         * Returns a new Date representing the last day of the local week at 23:59:59.999.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {Date} A new Date at the end of the local week.
         */
        endOfWeek(this: Date, weekStartsOnMonday: boolean = false): Date;
        /**
         * Returns a new Date representing the last day of the UTC week at 23:59:59.999 UTC.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {Date} A new Date at the end of the UTC week.
         */
        endOfWeekUTC(this: Date, weekStartsOnMonday: boolean = false): Date;
        /**
         * Returns a new Date representing the last day of the Spain:Europe/Madrid week at 23:59:59.999 Spain:Europe/Madrid.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {Date} A new Date at the end of the Spain:Europe/Madrid week.
         */
        endOfWeekSpain(this: Date, weekStartsOnMonday: boolean = false): Date;
        /**
         * Returns a new Date representing the last day of the local month at 23:59:59.999.
         * @return {Date} A new Date at the end of the local month.
         */
        endOfMonth(this: Date): Date;
        /**
         * Returns a new Date representing the last instant of the UTC calendar month.
         * @return {Date} A new Date at the end of the UTC month.
         */
        endOfMonthUTC(this: Date): Date;
        /**
         * Returns a new Date representing the last instant of the Spain:Europe/Madrid calendar month.
         * @return {Date} A new Date at the end of the Spain:Europe/Madrid month.
         */
        endOfMonthSpain(this: Date): Date;
        /**
         * Returns a new Date representing December 31st of the local calendar year at 23:59:59.999.
         * @return {Date} A new Date at the end of the local year.
         */
        endOfYear(this: Date): Date;
        /**
         * Returns a new Date representing the last instant of the UTC calendar year.
         * @return {Date} A new Date at the end of the UTC year.
         */
        endOfYearUTC(this: Date): Date;
        /**
         * Returns a new Date representing the last instant of the Spain:Europe/Madrid calendar year.
         * @return {Date} A new Date at the end of the Spain:Europe/Madrid year.
         */
        endOfYearSpain(this: Date): Date;

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
        format(this: Date, pattern: string, lang: string = 'en'): string;
        /**
         * Formats a Date instance into a custom string pattern using UTC date/time fields and locale support.
         * Supports the same tokens as `format`. The `Z` token is always "+00:00".
         *
         * @param {string} pattern Format pattern string
         * @param {string} lang Locale language in 2 letters format. e.g. 'ca', 'es', 'en'.
         * @return {string} The formatted UTC date.
         */
        formatUTC(this: Date, pattern: string, lang: string = 'en'): string;
        /**
         * Formats a Date instance into a custom string pattern using Spain:Europe/Madrid date/time fields and Spain:Europe/Madrid locale support.
         *
         * @param {string} pattern Format pattern string
         * @param {string} lang Locale language in 2 letters format. e.g. 'ca', 'es', 'en'.
         * @return {string} The formatted Spain:Europe/Madrid date.
         */
        formatSpain(this: Date, pattern: string, lang: string = 'es'): string;

        /**
         * Returns the local month and year formatted as YYYY-MM.
         * @return {string} A string representing the local month in YYYY-MM format.
         */
        toMonthKey(this: Date): string;
        /**
         * Returns the UTC month and year formatted as YYYY-MM.
         * @return {string} A string representing the UTC month in YYYY-MM format.
         */
        toMonthKeyUTC(this: Date): string;
        /**
         * Returns the Spain:Europe/Madrid month and year formatted as YYYY-MM.
         * @return {string} A string representing the Spain:Europe/Madrid month in YYYY-MM format.
         */
        toMonthKeySpain(this: Date): string;
        /**
         * Returns the local date formatted as YYYY-MM-DD.
         * @return {string} A string representing the local date in YYYY-MM-DD format.
         */
        toDayKey(this: Date): string;
        /**
         * Returns the UTC date formatted as YYYY-MM-DD.
         * @return {string} A string representing the UTC date in YYYY-MM-DD format.
         */
        toDayKeyUTC(this: Date): string;
        /**
         * Returns the Spain:Europe/Madrid date formatted as YYYY-MM-DD.
         * @return {string} A string representing the Spain:Europe/Madrid date in YYYY-MM-DD format.
         */
        toDayKeySpain(this: Date): string;

        /**
         * Returns the date and time formatted as YYYY-MM-DD HH:mm:ss using the local timezone.
         *
         * @return {string} A string representing the local dateTime.
         */
        toDateTime(this: Date): string;
        /**
         * Returns the date and time formatted as YYYY-MM-DD HH:mm:ss using UTC.
         *
         * @return {string} A string representing the UTC dateTime.
         */
        toDateTimeUTC(this: Date): string;
        /**
         * Returns the date and time formatted as YYYY-MM-DD HH:mm:ss using Spain:Europe/Madrid.
         *
         * @return {string} A string representing the Spain:Europe/Madrid dateTime.
         */
        toDateTimeSpain(this: Date): string;

        /**
         * Returns the local date formatted for an input[type="date"] value.
         * @return {string} A string in YYYY-MM-DD format using local date fields.
         */
        toInputDateValue(this: Date): string;
        /**
         * Returns the UTC date formatted for an input[type="date"] value.
         * @return {string} A string in YYYY-MM-DD format using UTC date fields.
         */
        toInputDateValueUTC(this: Date): string;
        /**
         * Returns the Spain:Europe/Madrid date formatted for an input[type="date"] value.
         * @return {string} A string in YYYY-MM-DD format using Spain:Europe/Madrid date fields.
         */
        toInputDateValueSpain(this: Date): string;
        /**
         * Returns the local date formatted for an input[type="datetime-local"] value.
         * @return {string} A string in YYYY-MM-DDTHH:MM format using local date and time fields.
         */
        toInputDateTimeLocalValue(this: Date): string;
        /**
         * Returns the UTC date formatted for an input[type="datetime-local"] value.
         * @return {string} A string in YYYY-MM-DDTHH:MM format using UTC date and time fields.
         */
        toInputDateTimeLocalValueUTC(this: Date): string;
        /**
         * Returns the Spain:Europe/Madrid date formatted for an input[type="datetime-local"] value.
         * @return {string} A string in YYYY-MM-DDTHH:MM format using Spain:Europe/Madrid date and time fields.
         */
        toInputDateTimeLocalValueSpain(this: Date): string;

        // Comparation ---

        /**
         * Checks if the date is in the past compared to now.
         * @return {boolean} True if the date is earlier than the current time, false otherwise.
         */
        isPast(this: Date): boolean;
        /**
         * Checks if the date is in the future compared to now.
         * @return {boolean} True if the date is later than the current time, false otherwise.
         */
        isFuture(this: Date): boolean;

        /**
         * Checks if two dates are on the same local day.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same local year, month, and day; otherwise false.
         */
        isSameDay(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are on the same UTC day.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same UTC year, month, and day; otherwise false.
         */
        isSameDayUTC(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are on the same Spain:Europe/Madrid day.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same Spain:Europe/Madrid year, month, and day; otherwise false.
         */
        isSameDaySpain(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are in the same local week.
         * @param {Date | number} other - The date to compare against.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {boolean} True if both dates are in the same local week; otherwise false.
         */
        isSameWeek(this: Date, other: Date | number, weekStartsOnMonday: boolean = false): boolean;
        /**
         * Checks if two dates are in the same UTC week.
         * @param {Date | number} other - The date to compare against.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {boolean} True if both dates are in the same UTC week; otherwise false.
         */
        isSameWeekUTC(this: Date, other: Date | number, weekStartsOnMonday: boolean = false): boolean;
        /**
         * Checks if two dates are in the same Spain:Europe/Madrid week.
         * @param {Date | number} other - The date to compare against.
         * @param {boolean} weekStartsOnMonday - Whether the week starts on Monday. Defaults to Sunday.
         * @return {boolean} True if both dates are in the same Spain:Europe/Madrid week; otherwise false.
         */
        isSameWeekSpain(this: Date, other: Date | number, weekStartsOnMonday: boolean = false): boolean;
        /**
         * Checks if two dates are in the same local month.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same local year and month; otherwise false.
         */
        isSameMonth(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are in the same UTC month.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same UTC year and month; otherwise false.
         */
        isSameMonthUTC(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are in the same Spain:Europe/Madrid month.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same Spain:Europe/Madrid year and month; otherwise false.
         */
        isSameMonthSpain(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are in the same local year.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same local year; otherwise false.
         */
        isSameYear(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are in the same UTC year.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same UTC year; otherwise false.
         */
        isSameYearUTC(this: Date, other: Date | number): boolean;
        /**
         * Checks if two dates are in the same Spain:Europe/Madrid year.
         * @param {Date | number} other - The date to compare against.
         * @return {boolean} True if both dates share the same Spain:Europe/Madrid year; otherwise false.
         */
        isSameYearSpain(this: Date, other: Date | number): boolean;

        /**
         * Indicates whether the date falls on a local weekend (Saturday or Sunday).
         * @return {boolean} true if the local day is Saturday (6) or Sunday (0), otherwise false.
         */
        isWeekend(this: Date): boolean;
        /**
         * Indicates whether the date falls on a UTC weekend (Saturday or Sunday).
         * @return {boolean} true if the UTC day is Saturday (6) or Sunday (0), otherwise false.
         */
        isWeekendUTC(this: Date): boolean;
        /**
         * Indicates whether the date falls on a Spain:Europe/Madrid weekend (Saturday or Sunday).
         * @return {boolean} true if the Spain:Europe/Madrid day is Saturday (6) or Sunday (0), otherwise false.
         */
        isWeekendSpain(this: Date): boolean;

        // Misc ---

        /**
         * Returns the Unix timestamp (in seconds) for this Date.
         * @return {number} Number of seconds since Unix epoch (January 1, 1970 UTC)
         */
        getUnixTime(this: Date): number;

        /**
         * Returns the date in standard ISO 8601 format with the local timezone offset.
         * Example: "2026-07-22T12:34:56.789+02:00"
         * @return {string} ISO 8601 string including the local offset.
         */
        getTimestamp(this: Date): string;
        /**
         * Returns the date in standard ISO 8601 UTC format.
         * Example: "2026-07-22T10:34:56.789Z"
         * @return {string} ISO 8601 string in UTC.
         */
        getTimestampUTC(this: Date): string;
        /**
         * Returns the date in standard ISO 8601 format for the Spain:Europe/Madrid timezone.
         * Example: "2026-07-22T12:34:56.789+02:00"
         * @return {string} ISO 8601 string in Spain:Europe/Madrid time.
         */
        getTimestampSpain(this: Date): string;

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
        monthsUntil(this: Date, other: Date | number): number;
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
        monthsUntilUTC(this: Date, other: Date | number): number;
        /**
         * Calculates the number of whole months between this date and another date using Spain:Europe/Madrid year and month fields.
         * Positive if the other date is in the future, negative if it is in the past.
         * Day and time components are ignored; only Spain:Europe/Madrid year and month differences are considered.
         *
         * @param {Date} other The target date to compare with.
         * @return {number} The signed number of Spain:Europe/Madrid months from this date until the given date.
         */
        monthsUntilSpain(this: Date, other: Date | number): number;

        /**
         * Returns the number of days in the current local month of the date.
         * @return {number} The total number of days in the local month.
         */
        daysInMonth(this: Date): number;
        /**
         * Returns the number of days in the current UTC month of the date.
         * @return {number} The total number of days in the UTC month.
         */
        daysInMonthUTC(this: Date): number;
        /**
         * Returns the number of days in the current Spain:Europe/Madrid month of the date.
         * @return {number} The total number of days in the Spain:Europe/Madrid month.
         */
        daysInMonthSpain(this: Date): number;
    }

    interface PromiseConstructor {
        /**
         * Pauses execution for the specified number of milliseconds.
         * @param {number} ms - Time to wait in milliseconds.
         * @return {Promise<void>} A promise that resolves after the delay.
         *
         * @throws Error if ms is not an integer biggeror equal to 0
         */
        sleep(ms: number): Promise<void>;
    }
}
