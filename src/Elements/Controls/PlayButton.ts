export class SoundcloudPlay extends HTMLElement {
    constructor() {
        super();
    }
}


if (customElements.get('soundcloud-player-play') !== null) {
    customElements.define('soundcloud-player-play', SoundcloudPlay);
}
