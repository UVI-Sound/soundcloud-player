import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';
import { type TSCTrackChangeDetails } from '../../Classes/SCServiceEvents.ts';

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

export class SCTrackIsSelected extends HTMLElement {
    private player!: SCPlayer;
    private options!: TSCTrackIsSelectedOption;

    init(player: SCPlayer): this {
        this.attachPlayer(player).initOptions().bindEvent();

        if (this.options.initialHide) {
            this.style.display = 'none';
        }

        return this;
    }

    initOptions(): this {
        const trackId = this.getAttribute('track-id');
        const before = this.getAttribute('before');
        const initialHide = this.getAttribute('initial-hide');

        this.options = {
            trackIds: trackId ? JSON.parse(trackId) : undefined,
            before: before !== null,
            initialHide: initialHide !== null,
        };

        return this;
    }

    attachPlayer(player: SCPlayer): this {
        this.player = player;
        return this;
    }

    private bindEvent(): this {
        const event = this.options.before ? 'track.change' : 'track.changed';

        EventService.listenEvent<TSCTrackChangeDetails>(
            this.player.sc.getEvent(event),
            (detail) => {
                if (
                    !this.options.trackIds?.includes(detail.currentTrackIndex)
                ) {
                    this.style.display = 'none';
                    return;
                }
                this.style.display = 'block';
            },
        );

        return this;
    }
}

if (customElements.get('sc-track-is-selected') !== null) {
    customElements.define('sc-track-is-selected', SCTrackIsSelected);
}
