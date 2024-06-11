export class SoundcloudSelectTrack extends HTMLElement {
    constructor() {
        super();
    }
}

if (customElements.get('soundcloud-player-select-track') !== null) {
    customElements.define(
        'soundcloud-player-select-track',
        SoundcloudSelectTrack,
    );
}
