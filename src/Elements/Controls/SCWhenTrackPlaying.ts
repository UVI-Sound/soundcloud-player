import { SCPlayer } from '../SCPlayer.ts';
import { EventManager } from '../../Classes/EventManager.ts';

type TSCWhenTrackPlayingOptions = {
    // Index of the track in the playlist
    trackId?: number;

    // If the track isn't playing then show it
    inverted?: boolean;

    initialHide?: boolean;
};

export class SCWhenTrackPlaying extends HTMLElement {
    private player: SCPlayer | null = null;
    private options: TSCWhenTrackPlayingOptions;

    constructor() {
        super();
        this.options = {
            initialHide: true,
        };
    }

    connectedCallback() {
        this.style.display = 'none';
    }

    initOptions(): void {
        const options: TSCWhenTrackPlayingOptions = {};

        const trackId = this.getAttribute('track-id');
        const inverted = this.getAttribute('inverted');
        const noInitialHide = this.getAttribute('no-initial-hide');

        options.trackId = trackId ? parseInt(trackId) : undefined;
        options.inverted = inverted !== null;
        options.initialHide = !(noInitialHide !== null);

        this.options = options;
    }

    attachPlayer(player: SCPlayer) {
        this.player = player;
        return this;
    }

    bindEvents() {
        this.initOptions();

        this.style.display = this.options.initialHide ? 'none' : 'block';

        if (!this.player) {
            console.warn('Cant init event without player attached');
            return;
        }

        if (this.options.trackId === undefined) {
            EventManager.listenEvent(
                this.player.soundcloudInstance.getEvent('track.start-playing'),
                () => {
                    const display = !this.options.inverted;
                    this.style.display = display ? 'block' : 'none';
                },
            );

            EventManager.listenEvent(
                this.player.soundcloudInstance.getEvent('track.stop-playing'),
                () => {
                    const display = this.options.inverted;
                    this.style.display = display ? 'block' : 'none';
                },
            );

            return;
        }

        EventManager.listenEvent(
            this.player.soundcloudInstance.getEvent('track.start-playing'),
            () => {
                this.withTrackIdCallback();
            },
        );

        EventManager.listenEvent(
            this.player.soundcloudInstance.getEvent('track.stop-playing'),
            () => {
                this.withTrackIdCallback();
            },
        );
    }

    withTrackIdCallback() {
        const sameTrack =
            this.options.trackId === this.player?.getCurrentTrackIndex();
        let display = this.options.inverted ? !sameTrack : sameTrack;
        this.style.display = display ? 'block' : 'none';
    }
}

if (customElements.get('sc-when-track-playing') !== null) {
    customElements.define('sc-when-track-playing', SCWhenTrackPlaying);
}
