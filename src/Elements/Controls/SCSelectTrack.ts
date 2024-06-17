import { EventService } from '../../Classes/EventService.ts';
import { type TSCTrackChangeDetails } from '../../Classes/SCServiceEvents.ts';
import SubPlayerElement from '../SubPlayerElement.ts';

interface TSelectTrackOptions {
    trackId: number;
    withProgressionReset: boolean;
}

export class SCSelectTrack extends SubPlayerElement {
    private options!: TSelectTrackOptions;

    initOptions(): this {
        const trackId = this.getAttribute('track-id');
        const withProgressionReset = this.getAttribute(
            'with-progression-reset',
        );

        if (trackId === null) {
            console.warn('Cant init event without track-id', this);
            return this;
        }

        this.options = {
            trackId: parseInt(trackId),
            withProgressionReset: withProgressionReset !== null,
        };

        return this;
    }

    bindEvents(): this {
        this.initOptions();
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return this;
        }
        const scInstance = this.player.sc;

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
