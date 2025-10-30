export const UUID_REGEX_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const STORAGE_DEVICE_UUID_KEY: string = 'DEVICE_UUID';

export function isUuid(uuid: string): boolean {
    return UUID_REGEX_PATTERN.test(uuid);
}

export function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getDeviceUuid(): string {
    let uuid = localStorage.get(STORAGE_DEVICE_UUID_KEY);

    if (typeof uuid !== 'string' || !isUuid(uuid)) {
        uuid = generateUuid();
        localStorage.set(STORAGE_DEVICE_UUID_KEY, uuid);
    }

    return uuid;
}