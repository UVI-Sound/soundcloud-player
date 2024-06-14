import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';

interface TSCTrackIsPlayingOptions {
    // If true, the condition will be inverted
    not: boolean;

    // If true, element will be initially hidden
    initialHide: boolean;

    /**
     * By default, event's are soundcloud response
     * If true, event's are player asking soundcloud
     */
    before: boolean;
}

export class SCTrackIsPlaying extends HTMLElement {
    private player: SCPlayer | null = null;
    private options!: TSCTrackIsPlayingOptions;

    init(player: SCPlayer): this {
        this.attachPlayer(player).bindEvents();

        if (this.options.initialHide) {
            this.style.display = 'none';
        }

        return this;
    }

    initOptions(): this {
        const inverted = this.getAttribute('not');
        const initialHide = this.getAttribute('initial-hide');
        const before = this.getAttribute('before');
        this.options = {
            not: inverted !== null,
            initialHide: initialHide !== null,
            before: before !== null,
        };
        return this;
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

        const events = {
            start: this.options.before ? 'track.start' : 'track.started',
            stop: this.options.before ? 'track.stop' : 'track.stopped',
        } satisfies {
            start: 'track.start' | 'track.started';
            stop: 'track.stop' | 'track.stopped';
        };

        EventService.listenEvent(
            this.player.soundcloudInstance.getEvent(events.start),
            () => {
                const display = !this.options.not;
                this.style.display = display ? 'block' : 'none';
            },
        );

        EventService.listenEvent(
            this.player.soundcloudInstance.getEvent(events.stop),
            () => {
                const display = this.options.not;
                this.style.display = display ? 'block' : 'none';
            },
        );

        return this;
    }
}

if (customElements.get('sc-track-is-playing') !== null) {
    customElements.define('sc-track-is-playing', SCTrackIsPlaying);
}
