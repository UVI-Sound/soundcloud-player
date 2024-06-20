import { type TSCTrack } from './types.ts';

/**
 *
 * @param track
 * @param tracks
 */
export function getTrackIndexInPlaylist(track: TSCTrack, tracks: TSCTrack[]): number {
    return tracks.findIndex((t) => t.id === track.id);
}

/**
 * Hides the specified iframe by manipulating its CSS properties.
 *
 * @param {HTMLIFrameElement} iframe - The iframe element to hide.
 * @returns {void}
 */
export function hideIframe(iframe: HTMLIFrameElement): void {
    iframe.style.opacity = '0';
    iframe.style.position = 'absolute';
    iframe.style.top = '-100000px';
}

/**
 * Loads a script from the specified URL and executes a callback function.
 *
 * @param {string} url - The URL of the script to load.
 * @param {Function} callback - The callback function to execute after the script is loaded.
 * @returns {void}
 */
export const loadScript = (url: string, callback: () => void): void => {
    const scripts = [].slice
        .call(document.getElementsByTagName('script'))
        .filter((script: HTMLScriptElement) => script.src === url);
    if (scripts.length > 0) {
        window.setTimeout(callback, 2000);
        return;
    }
    const script: HTMLScriptElement = document.createElement('script');

    script.onload = function () {
        callback();
    };
    script.type = 'text/javascript';
    script.src = url;
    document.getElementsByTagName('body')[0].appendChild(script);
};

/**
 * Generates a UUID (Universally Unique Identifier).
 *
 * @returns {string} The generated UUID.
 */
export const uuid = (): string => {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: string) =>
        (parseInt(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c) / 4)))).toString(16),
    );
};
