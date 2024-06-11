export class SoundcloudStop extends HTMLElement {
    constructor() {
        super();
    }
}

if (customElements.get('soundcloud-player-stop') !== null) {
    customElements.define('soundcloud-player-stop', SoundcloudStop);
}
