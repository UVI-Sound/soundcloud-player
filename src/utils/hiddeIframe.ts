export const hideIframe = (iframe: HTMLIFrameElement): void => {
  iframe.style.opacity = '0'
  iframe.style.position = 'absolute'
  iframe.style.top = '-100000px'
}
