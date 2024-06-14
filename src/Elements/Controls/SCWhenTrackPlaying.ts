import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';

interface TSCWhenTrackPlayingOptions {
    // If true, the condition will be inverted
    not: boolean;

    // If true, element will be initially hidden
    initialHide: boolean;
}

export class SCWhenTrackPlaying extends HTMLElement {
    private player: SCPlayer | null = null;
    private options!: TSCWhenTrackPlayingOptions;

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
        this.options = {
            not: inverted !== null,
            initialHide: initialHide !== null,
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

        EventService.listenEvent(
            this.player.soundcloudInstance.getEvent('track.started'),
            () => {
                const display = !this.options.not;
                this.style.display = display ? 'block' : 'none';
            },
        );

        EventService.listenEvent(
            this.player.soundcloudInstance.getEvent('track.stopped'),
            () => {
                const display = this.options.not;
                this.style.display = display ? 'block' : 'none';
            },
        );

        return this;
    }
}

if (customElements.get('sc-when-track-playing') !== null) {
    customElements.define('sc-when-track-playing', SCWhenTrackPlaying);
}
