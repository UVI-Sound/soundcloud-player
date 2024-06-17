import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';
import SubPlayerElement from '../SubPlayerElement.ts';
import { type TSCTrackChangeDetails } from '../../types.ts';

interface TSCTrackIsSelectedOption {
    // Index of the track in the playlist
    trackIds: number[];

    /**
     * By default, event's are soundcloud response
     * If true, event's are player asking soundcloud
     */
    before: boolean;

    // If true, element will be initially hidden
    initialHide: boolean;
}

export class SCTrackIsSelected extends SubPlayerElement {
    private options!: TSCTrackIsSelectedOption;

    initOptions(): this {
        const trackId = this.getAttribute('track-id');
        const before = this.getAttribute('before');
        const initialHide = this.getAttribute('initial-hide');

        this.options = {
            trackIds: trackId ? JSON.parse(trackId) : undefined,
            before: before !== null,
            initialHide: initialHide !== null,
        };

        if (this.options.initialHide) {
            this.style.display = 'none';
        }

        return this;
    }

    attachPlayer(player: SCPlayer): this {
        this.player = player;
        return this;
    }

    bindEvents(): this {
        const event = this.options.before ? 'track.change' : 'track.changed';

        EventService.listenEvent(this.player.sc.getEvent('sc.ready'), () => {
            EventService.listenEvent<TSCTrackChangeDetails>(
                this.player.sc.getEvent(event),
                (detail) => {
                    if (
                        !this.options.trackIds?.includes(
                            detail.currentTrackIndex,
                        )
                    ) {
                        this.style.display = 'none';
                        return;
                    }
                    this.style.display = 'block';
                },
            );
        });

        return this;
    }
}

if (customElements.get('sc-track-is-selected') !== null) {
    customElements.define('sc-track-is-selected', SCTrackIsSelected);
}
