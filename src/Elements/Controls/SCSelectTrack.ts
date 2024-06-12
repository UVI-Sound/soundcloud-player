import { SCPlayer } from '../SCPlayer.ts';
import { EventManager } from '../../Classes/EventManager.ts';

type TSelectTrackOptions = {
    trackId?: number;
    autoPlay?: boolean;
};

export class SCSelectTrack extends HTMLElement {
    private player: SCPlayer | null = null;
    private options: TSelectTrackOptions;

    constructor() {
        super();
        this.options = {};
    }

    initOptions(): void {
        const options: TSelectTrackOptions = {};

        const trackId = this.getAttribute('track-id');
        const autoPlay = this.getAttribute('autoplay');

        options.trackId = trackId ? parseInt(trackId) : undefined;
        options.autoPlay = autoPlay !== null;

        this.options = options;
    }

    attachPlayer(player: SCPlayer) {
        this.player = player;
        return this;
    }

    bindEvents() {
        this.initOptions();
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return;
        }
        const scInstance = this.player.soundcloudInstance;

        this.addEventListener('click', () => {
            EventManager.sendEvent(
                scInstance.getEvent('track.skip'),
                this.options.trackId,
            );
        });
    }
}

if (customElements.get('sc-select-track') !== null) {
    customElements.define('sc-select-track', SCSelectTrack);
}
