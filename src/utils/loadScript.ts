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
