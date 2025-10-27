export class TimeSpan {
    // Constants --------------------------------
    public static readonly MS_PER_SECOND = 1000;
    public static readonly MS_PER_MINUTE = 60_000;
    public static readonly MS_PER_HOUR = 3_600_000;
    public static readonly MS_PER_DAY = 86_400_000;
    public static readonly MS_PER_WEEK = 604_800_000;
    public static readonly MS_PER_YEAR = 31_557_600_000;

    public static readonly SECONDS_PER_MINUTE = 60;
    public static readonly MINUTES_PER_HOUR = 60;
    public static readonly HOURS_PER_DAY = 24;
    public static readonly DAYS_PER_WEEK = 7;
    public static readonly DAYS_PER_YEAR = 365.25;

    // Attributes -------------------------------
    private readonly ms: number;

    // Constructor ------------------------------
    constructor(milliseconds: number = 0) {
        if (!Number.isFinite(milliseconds) && milliseconds !== Infinity && milliseconds !== -Infinity) {
            throw new Error("Invalid milliseconds TimeSpan value: " + milliseconds);
        }
        this.ms = milliseconds;
    }

    // Static methods ---------------------------
    // Factories ---
    static fromMillis(ms: number): TimeSpan { return new TimeSpan(ms); }
    static fromSeconds(s: number): TimeSpan { return new TimeSpan(s * this.MS_PER_SECOND); }
    static fromMinutes(m: number): TimeSpan { return new TimeSpan(m * this.MS_PER_MINUTE); }
    static fromHours(h: number): TimeSpan { return new TimeSpan(h * this.MS_PER_HOUR); }
    static fromDays(d: number): TimeSpan { return new TimeSpan(d * this.MS_PER_DAY); }
    static fromWeeks(w: number): TimeSpan { return new TimeSpan(w * this.MS_PER_WEEK); }
    static fromYears(y: number): TimeSpan { return new TimeSpan(y * this.MS_PER_YEAR); }
    static infinite(): TimeSpan { return new TimeSpan(Infinity); }
    static negativeInfinite(): TimeSpan { return new TimeSpan(-Infinity); }
    // eslint-disable-next-line no-unused-vars
    static untilNow(millisecondsUnixTime: number): TimeSpan;
    // eslint-disable-next-line no-unused-vars
    static untilNow(date: Date): TimeSpan;
    static untilNow(arg1: number | Date): TimeSpan {
        const millisUnixTime = typeof arg1 === 'number'
            ? arg1 : arg1.getTime();
        return TimeSpan.fromMillis(millisUnixTime - Date.now());
    }

    // Sort ---
    static sortByAscending(a: TimeSpan, b: TimeSpan): number {
        return a.equals(b) ? 0 : a.ms - b.ms;
    }
    static sortByDescending(a: TimeSpan, b: TimeSpan): number {
        return a.equals(b) ? 0 : b.ms - a.ms;
    }

    // Public methods ---------------------------
    // Totals ---
    public totalMillis(): number { return this.ms; }
    public totalSeconds(): number { return this.ms / TimeSpan.MS_PER_SECOND; }
    public totalMinutes(): number { return this.ms / TimeSpan.MS_PER_MINUTE; }
    public totalHours(): number { return this.ms / TimeSpan.MS_PER_HOUR; }
    public totalDays(): number { return this.ms / TimeSpan.MS_PER_DAY; }
    public totalWeeks(): number { return this.ms / TimeSpan.MS_PER_WEEK; }
    public totalYears(): number { return this.ms / TimeSpan.MS_PER_YEAR; }

    // Individual parts ---
    public millisPart(): number { return this.isInfinite() ? 0 : Math.floor(this.totalMillis() % TimeSpan.MS_PER_SECOND); }
    public secondsPart(): number { return this.isInfinite() ? 0 : Math.floor(this.totalSeconds() % TimeSpan.SECONDS_PER_MINUTE); }
    public minutesPart(): number { return this.isInfinite() ? 0 : Math.floor(this.totalMinutes() % TimeSpan.MINUTES_PER_HOUR); }
    public hoursPart(): number { return this.isInfinite() ? 0 : Math.floor(this.totalHours() % TimeSpan.HOURS_PER_DAY); }
    public daysPart(): number { return this.isInfinite() ? 0 : Math.floor(this.totalDays()); }

    // Arithmetic operations ---
    public add(other: TimeSpan): TimeSpan {
        if (this.isInfinite() && other.isInfinite() && this.ms != other.ms)
            throw new Error("Can not add +Infinity and -Infinity TimeSpans");

        return new TimeSpan(this.ms + other.ms);
    }
    public subtract(other: TimeSpan): TimeSpan {
        if (this.isInfinite() && other.isInfinite() && this.ms != other.ms)
            throw new Error("Can not subtract +Infinity and -Infinity TimeSpans");

        return new TimeSpan(this.ms - other.ms);
    }

    // Comparison ---
    public equals(other: TimeSpan): boolean { return this.ms === other.ms; }
    public greaterThan(other: TimeSpan): boolean { return this.ms > other.ms; }
    public lessThan(other: TimeSpan): boolean { return this.ms < other.ms; }

    // Sort ---
    public sortByAscending(other: TimeSpan): number {
        return this.equals(other) ? 0 : this.ms - other.ms;
    }
    public sortByDescending(other: TimeSpan): number {
        return this.equals(other) ? 0 : other.ms - this.ms;
    }

    // Utility ---
    public isZero(): boolean { return this.ms === 0; }
    public isPositive(): boolean { return this.ms > 0; }
    public isNegative(): boolean { return this.ms < 0; }
    public isInfinite(): boolean { return this.ms === Infinity || this.ms === -Infinity; }

    // Formatting ---
    public toString(humanReadable: boolean = true): string {
        if (this.isInfinite())
            return this.isPositive() ? "∞" : "-∞";

        const days = this.daysPart();
        const hours = this.hoursPart();
        const minutes = this.minutesPart();
        const seconds = this.secondsPart();

        if (humanReadable) {
            let display = '';
            if (days > 0) display += `${days} days`;
            if (hours > 0) display += ` ${hours}h`;
            if (minutes > 0) display += ` ${minutes}m`;
            if (seconds > 0) display += ` ${seconds}s`;

            return display.trim();
        }
        else {
            const milliseconds = this.millisPart();

            const signStr = this.isNegative() ? "-" : "";
            const daysStr = days > 0 ? `${days}.` : "";
            let timeStr = `${hours}:${minutes}:${seconds}`;
            if (milliseconds != 0) timeStr += `.${milliseconds}`;

            return `${signStr}${daysStr}${timeStr}`;
        }

    }
}