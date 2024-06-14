import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';
import { type TSCTrackChangedDetails } from '../../Classes/SCServiceEvents.ts';

interface TSCWhenTrackSelected {
    // Index of the track in the playlist
    trackIds: number[];
}

export class SCWhenTrackSelected extends HTMLElement {
    private player!: SCPlayer;
    private options!: TSCWhenTrackSelected;

    connectedCallback(): void {
        this.style.display = 'none';
    }

    init(player: SCPlayer): this {
        return this.attachPlayer(player).initOptions().bindEvent();
    }

    initOptions(): this {
        const trackId = this.getAttribute('track-id');

        this.options = {
            trackIds: trackId ? JSON.parse(trackId) : undefined,
        };

        return this;
    }

    attachPlayer(player: SCPlayer): this {
        this.player = player;
        return this;
    }

    private bindEvent(): this {
        EventService.listenEvent<TSCTrackChangedDetails>(
            this.player.soundcloudInstance.getEvent('track.changed'),
            () => {
                if (
                    !this.options.trackIds?.includes(
                        this.player.getCurrentTrackIndex(),
                    )
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

if (customElements.get('sc-when-track-selected') !== null) {
    customElements.define('sc-when-track-selected', SCWhenTrackSelected);
}
