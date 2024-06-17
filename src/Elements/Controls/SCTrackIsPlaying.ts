import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';
import { type TSCEvents } from '../../Classes/SCServiceEvents.ts';

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

    checkOnChange: boolean;
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
        const checkOnChange = this.getAttribute('check-on-change');
        this.options = {
            not: inverted !== null,
            initialHide: initialHide !== null,
            before: before !== null,
            checkOnChange: checkOnChange !== null,
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

        const start: TSCEvents = this.options.before
            ? 'track.start'
            : 'track.started';
        const stop: TSCEvents = this.options.before
            ? 'track.stop'
            : 'track.stopped';
        const change: TSCEvents = this.options.before
            ? 'track.change'
            : 'track.changed';

        const triggerEvents: TSCEvents[] = !this.options.checkOnChange
            ? [start, stop]
            : [start, stop, change];

        const events = triggerEvents.map(
            (e: TSCEvents): string => this.player?.sc.getEvent(e)!,
        );

        // EventService.listenEvent(this.player.sc.getEvent('sc.ready'), () => {
        EventService.listenEvent(events, () => {
            this.player?.checkIfPlayingThenExecCallback((paused) => {
                if (this.options.not) {
                    this.style.display = paused ? 'block' : 'none';
                    return;
                }
                this.style.display = paused ? 'none' : 'block';
            });
        });
        // });

        return this;
    }
}

if (customElements.get('sc-track-is-playing') !== null) {
    customElements.define('sc-track-is-playing', SCTrackIsPlaying);
}
