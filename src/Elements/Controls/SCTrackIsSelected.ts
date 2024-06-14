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
}

export class SCTrackIsSelected extends HTMLElement {
    private player!: SCPlayer;
    private options!: TSCTrackIsSelectedOption;

    init(player: SCPlayer): this {
        return this.attachPlayer(player).initOptions().bindEvent();
    }

    initOptions(): this {
        const trackId = this.getAttribute('track-id');
        const before = this.getAttribute('before');

        this.options = {
            trackIds: trackId ? JSON.parse(trackId) : undefined,
            before: before !== null,
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
            this.player.soundcloudInstance.getEvent(event),
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
