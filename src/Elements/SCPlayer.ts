import { SCService, type TSCTrack } from '../Classes/SCService.ts';
import { uuid } from '../utils/uuid.ts';
import { EventService } from '../Classes/EventService.ts';
import { type SCPlay } from './Controls/SCPlay.ts';
import { type SCStop } from './Controls/SCStop.ts';
import { type SCSelectTrack } from './Controls/SCSelectTrack.ts';
import { type SCTrackIsPlaying } from './Controls/SCTrackIsPlaying.ts';
import { type TSCPlaylistTracksChangedDetails } from '../Classes/SCServiceEvents.ts';
import { type SCTrackIsSelected } from './Controls/SCTrackIsSelected.ts';
import { getTrackIndexInPlaylist } from '../helpers.ts';

export class SCPlayer extends HTMLElement {
    // Elements
    play!: SCPlay | null;
    stop!: SCStop | null;
    selectTracks!: NodeListOf<SCSelectTrack>;
    trackIsPlaying!: NodeListOf<SCTrackIsPlaying>;
    trackIsSelected!: NodeListOf<SCTrackIsSelected>;

    // Attached soundcloud instance
    sc!: SCService;

    // Current playlist tracks
    tracks: TSCTrack[] = [];

    private playlistId!: string | null;
    private playlistSecret!: string | null;
    private iframePlayer!: HTMLIFrameElement;
    private uuid: string | undefined;

    connectedCallback(): void {
        this.uuid = uuid();
        this.playlistId = this.getAttribute('playlist') ?? null;
        this.playlistSecret = this.getAttribute('secret') ?? null;

        if (!this.initSoundcloud()) {
            console.warn('Cant init soundcloud player');
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
        EventService.listenEvent<TSCPlaylistTracksChangedDetails>(
            this.sc.getEvent('playlist.tracks.changed'),
            ({ tracks }) => (this.tracks = tracks),
        );

        this.play?.init(this);
        this.stop?.init(this);

        [
            ...this.selectTracks,
            ...this.trackIsPlaying,
            ...this.trackIsSelected,
        ].forEach((elem) => elem.init(this));
    }

    /**
     * Initializes the Soundcloud playlist.
     *
     * @private
     * @returns {boolean} - Returns true if initialization is successful, false otherwise.
     */
    private initSoundcloud(): boolean {
        if (!(this.uuid && this.playlistId)) {
            return false;
        }

        this.iframePlayer = document.createElement('iframe');
        document.body.appendChild(this.iframePlayer);

        this.sc = new SCService(this.iframePlayer, this.uuid, {
            playlistId: this.playlistId,
            playlistSecret: this.playlistSecret,
        });
        this.sc.init();
        return true;
    }

    /**
     * Returns the index of the current track in the playlist.
     *
     * @returns {number} The index of the current track.
     */
    getCurrentTrackIndex(): number {
        return getTrackIndexInPlaylist(this.sc.currentTrack, this.tracks);
    }
}

if (customElements.get('soundcloud-player') !== null) {
    customElements.define('soundcloud-player', SCPlayer);
}
