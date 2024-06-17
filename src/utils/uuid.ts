/**
 * Generates a UUID (Universally Unique Identifier).
 *
 * @returns {string} The generated UUID.
 */
export const uuid = (): string => {
    return '10000000-1000-4000-8000-100000000000'.replace(
        /[018]/g,
        (c: string) =>
            (
                parseInt(c) ^
                (crypto.getRandomValues(new Uint8Array(1))[0] &
                    (15 >> (parseInt(c) / 4)))
            ).toString(16),
    );
};
