/**
 * Represents a duration of time with millisecond precision.
 *
 * Features:
 * - Construction from common units (ms, s, m, h, d, w, y).
 * - Infinite and negative-infinite representations.
 * - Safe integer validation for finite values.
 * - Arithmetic, comparison and formatting helpers.
 *
 * Note: Year is approximated as 365.25 days. Generation and manipulation
 * use numbers and are not suitable for high-precision scientific timing.
 */
export class TimeSpan {
    // Constants --------------------------------
    /** Milliseconds per second. */
    public static readonly MS_PER_SECOND = 1000;
    /** Milliseconds per minute. */
    public static readonly MS_PER_MINUTE = 60_000;
    /** Milliseconds per hour. */
    public static readonly MS_PER_HOUR = 3_600_000;
    /** Milliseconds per day. */
    public static readonly MS_PER_DAY = 86_400_000;
    /** Milliseconds per week. */
    public static readonly MS_PER_WEEK = 604_800_000;
    /** Milliseconds per (approx.) year = 365.25 days. */
    public static readonly MS_PER_YEAR = 31_557_600_000;

    public static readonly SECONDS_PER_MINUTE = 60;
    public static readonly MINUTES_PER_HOUR = 60;
    public static readonly HOURS_PER_DAY = 24;
    public static readonly DAYS_PER_WEEK = 7;
    public static readonly DAYS_PER_YEAR = 365.25;

    // Attributes -------------------------------
    /** Internal storage in milliseconds. Can be finite, Infinity or -Infinity. */
    private readonly ms: number;

    // Constructor ------------------------------
    /**
     * Create a TimeSpan.
     * @param milliseconds - Duration in milliseconds. Defaults to 0.
     *                      Can be +Infinity or -Infinity for infinite values.
     * @throws Error if a finite value is not a safe integer or if it's not Infinity, -Infinity or a number.
     */
    constructor(milliseconds: number = 0) {
        if (milliseconds !== Infinity && milliseconds !== -Infinity) {
            if (Number.isFinite(milliseconds)) {
                if (!Number.isSafeInteger(milliseconds))
                    throw new Error("Timespan does not have a safe value: " + milliseconds);
            }
            else throw new Error("Invalid TimeSpan value: " + milliseconds);
        }
        this.ms = milliseconds;
    }

    // Static methods ---------------------------
    // Factories ---
    /** Create a TimeSpan from milliseconds. */
    static fromMillis(ms: number): TimeSpan { return new TimeSpan(ms); }
    /** Create a TimeSpan from seconds. */
    static fromSeconds(s: number): TimeSpan { return new TimeSpan(s * this.MS_PER_SECOND); }
    /** Create a TimeSpan from minutes. */
    static fromMinutes(m: number): TimeSpan { return new TimeSpan(m * this.MS_PER_MINUTE); }
    /** Create a TimeSpan from hours. */
    static fromHours(h: number): TimeSpan { return new TimeSpan(h * this.MS_PER_HOUR); }
    /** Create a TimeSpan from days. */
    static fromDays(d: number): TimeSpan { return new TimeSpan(d * this.MS_PER_DAY); }
    /** Create a TimeSpan from weeks. */
    static fromWeeks(w: number): TimeSpan { return new TimeSpan(w * this.MS_PER_WEEK); }
    /** Create a TimeSpan from (approx.) years. */
    static fromYears(y: number): TimeSpan { return new TimeSpan(y * this.MS_PER_YEAR); }
    /** Represent an infinite positive duration. */
    static infinite(): TimeSpan { return new TimeSpan(Infinity); }
    /** Represent an infinite negative duration. */
    static negativeInfinite(): TimeSpan { return new TimeSpan(-Infinity); }

    /**
     * Create a TimeSpan representing the time elapsed since the provided
     * Unix time (milliseconds) or Date. Equivalent to now - input.
     * Positive if input is in the past and negative if is in the future.
     * @param millisecondsUnixTime - Unix time in milliseconds.
     * @returns TimeSpan from the given time until now.
     */
    // eslint-disable-next-line no-unused-vars
    static untilNow(millisecondsUnixTime: number): TimeSpan;
    // eslint-disable-next-line no-unused-vars
    static untilNow(date: Date): TimeSpan;
    static untilNow(arg1: number | Date): TimeSpan {
        const millisUnixTime = typeof arg1 === 'number'
            ? arg1 : arg1.getTime();
        return TimeSpan.fromMillis(Date.now() - millisUnixTime);
    }

    // Sort ---
    /**
     * Compare two TimeSpans for ascending order.
     * @returns negative if a < b, positive if a > b, zero if equal.
     */
    static sortByAscending(a: TimeSpan, b: TimeSpan): number {
        return a.equals(b) ? 0 : a.ms - b.ms;
    }
    /**
     * Compare two TimeSpans for descending order.
     * @returns negative if a > b, positive if a < b, zero if equal.
     */
    static sortByDescending(a: TimeSpan, b: TimeSpan): number {
        return a.equals(b) ? 0 : b.ms - a.ms;
    }

    // Public methods ---------------------------
    // Totals ---
    /** Total milliseconds represented by this TimeSpan. */
    public totalMillis(): number { return this.ms; }
    /** Total seconds (may be fractional). */
    public totalSeconds(): number { return this.ms / TimeSpan.MS_PER_SECOND; }
    /** Total minutes (may be fractional). */
    public totalMinutes(): number { return this.ms / TimeSpan.MS_PER_MINUTE; }
    /** Total hours (may be fractional). */
    public totalHours(): number { return this.ms / TimeSpan.MS_PER_HOUR; }
    /** Total days (may be fractional). */
    public totalDays(): number { return this.ms / TimeSpan.MS_PER_DAY; }
    /** Total weeks (may be fractional). */
    public totalWeeks(): number { return this.ms / TimeSpan.MS_PER_WEEK; }
    /** Total (approx.) years (may be fractional). */
    public totalYears(): number { return this.ms / TimeSpan.MS_PER_YEAR; }

    // Individual parts ---
    /** Milliseconds remainder part (0..999). Returns 0 for infinite values. */
    public millisPart(): number { return this.isInfinite() ? 0 : Math.trunc(this.totalMillis() % TimeSpan.MS_PER_SECOND); }
    /** Seconds remainder part (0..59). Returns 0 for infinite values. */
    public secondsPart(): number { return this.isInfinite() ? 0 : Math.trunc(this.totalSeconds() % TimeSpan.SECONDS_PER_MINUTE); }
    /** Minutes remainder part (0..59). Returns 0 for infinite values. */
    public minutesPart(): number { return this.isInfinite() ? 0 : Math.trunc(this.totalMinutes() % TimeSpan.MINUTES_PER_HOUR); }
    /** Hours remainder part (0..23). Returns 0 for infinite values. */
    public hoursPart(): number { return this.isInfinite() ? 0 : Math.trunc(this.totalHours() % TimeSpan.HOURS_PER_DAY); }
    /** Days total (floor). For formatting of multi-day spans. Returns 0 for infinite values. */
    public daysPart(): number { return this.isInfinite() ? 0 : Math.trunc(this.totalDays()); }

    // Arithmetic operations ---
    /**
     * Add two TimeSpans.
     * @throws Error if attempting to add +Infinity and -Infinity.
     * @returns New TimeSpan with summed duration.
     */
    public add(other: TimeSpan): TimeSpan {
        if (this.isInfinite() && other.isInfinite() && this.ms != other.ms)
            throw new Error("Can not add +Infinity and -Infinity TimeSpans");

        return new TimeSpan(this.ms + other.ms);
    }
    /**
     * Subtract another TimeSpan from this one.
     * @throws Error if attempting to subtract +Infinity and -Infinity.
     * @returns New TimeSpan with the result.
     */
    public subtract(other: TimeSpan): TimeSpan {
        if (this.isInfinite() && other.isInfinite() && this.ms != other.ms)
            throw new Error("Can not subtract +Infinity and -Infinity TimeSpans");

        return new TimeSpan(this.ms - other.ms);
    }

    // Comparison ---
    /** True if both TimeSpans represent the same duration. */
    public equals(other: TimeSpan): boolean { return this.ms === other.ms; }
    /** True if this TimeSpan is strictly greater than other. */
    public isGreaterThan(other: TimeSpan): boolean { return this.ms > other.ms; }
    /** True if this TimeSpan is strictly less than other. */
    public isLessThan(other: TimeSpan): boolean { return this.ms < other.ms; }

    // Sort ---
    /** Instance helper to compare ascending with another TimeSpan. */
    public sortByAscending(other: TimeSpan): number {
        return this.equals(other) ? 0 : this.ms - other.ms;
    }
    /** Instance helper to compare descending with another TimeSpan. */
    public sortByDescending(other: TimeSpan): number {
        return this.equals(other) ? 0 : other.ms - this.ms;
    }

    // Utility ---
    /** Absolute value of this TimeSpan. */
    public abs(): TimeSpan { return new TimeSpan(Math.abs(this.ms)); }
    /** True if duration is exactly zero. */
    public isZero(): boolean { return this.ms === 0; }
    /** True if duration is strictly positive. */
    public isPositive(): boolean { return this.ms > 0; }
    /** True if duration is strictly negative. */
    public isNegative(): boolean { return this.ms < 0; }
    /** True if duration is +Infinity or -Infinity. */
    public isInfinite(): boolean { return this.ms === Infinity || this.ms === -Infinity; }

    // Formatting ---
    /**
     * Convert the TimeSpan to a string.
     * @param humanReadable - If true (default) returns a compact human string
     *                        like "2 days 3h 4m 5s".
     *                        If false returns a machine-friendly format:
     *                        "[days.]HH:MM:SS[.ms]" with sign prefix if negative.
     * @returns Formatted string.
     */
    public toString(humanReadable: boolean = true): string {
        if (this.isInfinite())
            return this.isPositive() ? "∞" : "-∞";

        const days = this.daysPart();
        const hours = this.hoursPart();
        const minutes = this.minutesPart();
        const seconds = this.secondsPart();

        if (humanReadable) {
            let display = '';
            if (days != 0) display += `${days} days`;
            if (hours != 0) display += ` ${hours}h`;
            if (minutes != 0) display += ` ${minutes}m`;
            if (seconds != 0) display += ` ${seconds}s`;

            return display.trim();
        }
        else {
            const milliseconds = this.millisPart();

            const signStr = this.isNegative() ? "-" : "";
            const daysStr = days != 0 ? `${days}.` : "";
            let timeStr = `${hours}:${minutes}:${seconds}`;
            if (milliseconds != 0) timeStr += `.${milliseconds}`;

            return `${signStr}${daysStr}${timeStr}`;
        }
    }
}
