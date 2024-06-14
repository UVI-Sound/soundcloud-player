import { type SCPlayer } from '../SCPlayer.ts';
import { EventManager } from '../../Classes/EventManager.ts';
import { type TSCTrackSkipDetails } from '../../Classes/SCServiceEvents.ts';

interface TSelectTrackOptions {
    trackId: number;
    withProgressionReset: boolean;
}

export class SCSelectTrack extends HTMLElement {
    private player: SCPlayer | null = null;
    private options!: TSelectTrackOptions;

    constructor() {
        super();
    }

    initOptions(): void {
        const trackId = this.getAttribute('track-id');
        const withProgressionReset = this.getAttribute(
            'with-progression-reset',
        );

        if (trackId === null) {
            console.warn('Cant init event without track-id', this);
            return;
        }

        this.options = {
            trackId: parseInt(trackId),
            withProgressionReset: withProgressionReset !== null,
        };
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
            EventManager.sendEvent<TSCTrackSkipDetails>(
                scInstance.getEvent('track.skip'),
                {
                    index: this.options.trackId,
                    resetTime: this.options.withProgressionReset,
                },
            );
        });
    }
}

if (customElements.get('sc-select-track') !== null) {
    customElements.define('sc-select-track', SCSelectTrack);
}
