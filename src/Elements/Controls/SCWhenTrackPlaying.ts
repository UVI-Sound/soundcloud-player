import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';

interface TSCWhenTrackPlayingOptions {
    // Index of the track in the playlist
    trackIds?: number[];

    // If the track isn't playing then show it
    inverted?: boolean;

    initialHide?: boolean;
}

export class SCWhenTrackPlaying extends HTMLElement {
    private player: SCPlayer | null = null;
    private options: TSCWhenTrackPlayingOptions;

    constructor() {
        super();
        this.options = {
            initialHide: true,
        };
    }

    connectedCallback(): void {
        this.style.display = 'none';
    }

    init(player: SCPlayer): this {
        this.attachPlayer(player);
        return this.bindEvents();
    }

    initOptions(): this {
        const options: TSCWhenTrackPlayingOptions = {};

        const trackId = this.getAttribute('track-id');
        const inverted = this.getAttribute('inverted');
        const noInitialHide = this.getAttribute('no-initial-hide');

        options.trackIds = trackId ? JSON.parse(trackId) : undefined;
        options.inverted = inverted !== null;
        options.initialHide = !(noInitialHide !== null);

        if (
            options.trackIds !== undefined &&
            !Array.isArray(options.trackIds)
        ) {
            options.trackIds = [options.trackIds];
        }

        this.options = options;
        return this;
    }

    attachPlayer(player: SCPlayer): this {
        this.player = player;
        return this;
    }

    bindEvents(): this {
        this.initOptions();

        this.style.display = this.options.initialHide ? 'none' : 'block';

        if (!this.player) {
            console.warn('Cant init event without player attached');
            return this;
        }

        if (this.options.trackIds === undefined) {
            EventService.listenEvent(
                this.player.soundcloudInstance.getEvent('track.start-playing'),
                () => {
                    const display = !this.options.inverted;
                    this.style.display = display ? 'block' : 'none';
                },
            );

            EventService.listenEvent(
                this.player.soundcloudInstance.getEvent('track.stop-playing'),
                () => {
                    const display = this.options.inverted;
                    this.style.display = display ? 'block' : 'none';
                },
            );

            return this;
        }

        EventService.listenEvent(
            this.player.soundcloudInstance.getEvent('track.start-playing'),
            () => {
                this.withTrackIdCallback();
            },
        );

        EventService.listenEvent(
            this.player.soundcloudInstance.getEvent('track.stop-playing'),
            () => {
                this.withTrackIdCallback();
            },
        );

        return this;
    }

    withTrackIdCallback(): void {
        const sameTrack = this.options.trackIds?.includes(
            this.player?.getCurrentTrackIndex() ?? -1,
        );
        const display = this.options.inverted ? !sameTrack : sameTrack;
        this.style.display = display ? 'block' : 'none';
    }
}

if (customElements.get('sc-when-track-playing') !== null) {
    customElements.define('sc-when-track-playing', SCWhenTrackPlaying);
}
