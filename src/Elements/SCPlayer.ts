import { SCService } from '../Classes/SCService.ts';
import { type SCPlay } from './Controls/SCPlay.ts';
import { type SCStop } from './Controls/SCStop.ts';
import { type SCSelectTrack } from './Controls/SCSelectTrack.ts';
import { type SCTrackIsPlaying } from './Controls/SCTrackIsPlaying.ts';
import { type SCTrackIsSelected } from './Controls/SCTrackIsSelected.ts';
import type SubPlayerElement from './SubPlayerElement.ts';
import { uuid } from '../helpers.ts';

export class SCPlayer extends HTMLElement {
    // Elements
    play!: SCPlay | null;
    stop!: SCStop | null;
    selectTracks!: NodeListOf<SCSelectTrack>;
    trackIsPlaying!: NodeListOf<SCTrackIsPlaying>;
    trackIsSelected!: NodeListOf<SCTrackIsSelected>;

    // Attached soundcloud instance
    sc!: SCService;

    private iframePlayer!: HTMLIFrameElement;

    connectedCallback(): void {
        if (!this.initSoundcloud(this.getAttribute('playlist') ?? null, this.getAttribute('secret') ?? null)) {
            console.warn('Failed to init soundcloud player');
            return;
        }

        this.play = this.querySelector('sc-play');
        this.stop = this.querySelector('sc-stop');
        this.selectTracks = this.querySelectorAll('sc-select-track');
        this.trackIsPlaying = this.querySelectorAll('sc-track-is-playing');
        this.trackIsSelected = this.querySelectorAll('sc-track-is-selected');

        this.bindEvents();
    }

    /**
     * Binds event listeners and initializes play, stop, selectTracks, trackIsPlaying, and trackIsSelected elements.
     *
     * @private
     * @return {void}
     */
    private bindEvents(): void {
        [this.play, this.stop, ...this.selectTracks, ...this.trackIsPlaying, ...this.trackIsSelected].forEach(
            (elem: SubPlayerElement | null) => elem?.init(this),
        );
    }

    /**
     * Initializes the Soundcloud playlist.
     *
     * @private
     * @returns {boolean} - Returns true if initialization is successful, false otherwise.
     */
    private initSoundcloud(playlistId: string | null, playlistSecret: string | null): boolean {
        if (!playlistId) {
            return false;
        }

        this.iframePlayer = document.createElement('iframe');
        document.body.appendChild(this.iframePlayer);

        this.sc = new SCService(this.iframePlayer, uuid(), {
            playlistId,
            playlistSecret,
        });
        this.sc.init();
        return true;
    }
}

if (customElements.get('soundcloud-player') !== null) {
    customElements.define('soundcloud-player', SCPlayer);
}
