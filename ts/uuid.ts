/**
 * Regular expression pattern for validating UUID v4 strings.
 * Matches 8-4-4-4-12 hexadecimal format, case-insensitive.
 */
export const UUID_REGEX_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Local storage key used to persist the device UUID.
 */
export const STORAGE_DEVICE_UUID_KEY: string = 'DEVICE_UUID';

/**
 * Checks if a given string is a valid UUID v4.
 * @param uuid - String to validate.
 * @returns True if the string matches the UUID v4 pattern.
 */
export function isUuid(uuid: string): boolean {
    return UUID_REGEX_PATTERN.test(uuid);
}

/**
 * Generates a random UUID v4 string.
 * Uses Math.random() for simplicity (not cryptographically secure).
 * @returns A new UUID v4 string.
 */
export function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Retrieves or creates a persistent device UUID.
 * If a valid UUID exists in localStorage, it is returned.
 * Otherwise, a new UUID is generated, stored, and returned.
 * @returns The device UUID.
 */
export function getDeviceUuid(): string {
    let uuid = localStorage.getItem(STORAGE_DEVICE_UUID_KEY);

    if (typeof uuid !== 'string' || !isUuid(uuid)) {
        uuid = generateUuid();
        localStorage.setItem(STORAGE_DEVICE_UUID_KEY, uuid);
    }

    return uuid;
}
