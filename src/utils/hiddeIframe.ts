/**
 * Hides the specified iframe by manipulating its CSS properties.
 *
 * @param {HTMLIFrameElement} iframe - The iframe element to hide.
 * @returns {void}
 */
export const hideIframe = (iframe: HTMLIFrameElement): void => {
    iframe.style.opacity = '0';
    iframe.style.position = 'absolute';
    iframe.style.top = '-100000px';
};
