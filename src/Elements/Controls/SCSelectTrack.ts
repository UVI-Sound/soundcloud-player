import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';
import { type TSCTrackChangeDetails } from '../../Classes/SCServiceEvents.ts';

interface TSelectTrackOptions {
    trackId: number;
    withProgressionReset: boolean;
}

export class SCSelectTrack extends HTMLElement {
    private player: SCPlayer | null = null;
    private options!: TSelectTrackOptions;

    init(player: SCPlayer): this {
        this.attachPlayer(player);
        return this.bindEvents();
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

    attachPlayer(player: SCPlayer): this {
        this.player = player;
        return this;
    }

    bindEvents(): this {
        this.initOptions();
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return this;
        }
        const scInstance = this.player.soundcloudInstance;

        this.addEventListener('click', () => {
            EventService.sendEvent<TSCTrackChangeDetails>(
                scInstance.getEvent('track.change'),
                {
                    currentTrackIndex: this.options.trackId,
                    withTimeReset: this.options.withProgressionReset,
                },
            );
        });
        return this;
    }
}

if (customElements.get('sc-select-track') !== null) {
    customElements.define('sc-select-track', SCSelectTrack);
}
