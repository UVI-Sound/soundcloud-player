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
    playButton!: SCPlay | null;
    stopButton!: SCStop | null;
    selectTracks!: NodeListOf<SCSelectTrack>;
    whenTrackPlaying!: NodeListOf<SCTrackIsPlaying>;
    whenTrackSelected!: NodeListOf<SCTrackIsSelected>;
    soundcloudInstance!: SCService;
    iframePlayer!: HTMLIFrameElement;

    uuid: string | undefined;
    playlistId!: string | null;
    playlistSecret!: string | null;
    playlistTrackIds: number[] = [];
    playlistTracks: TSCTrack[] = [];

    connectedCallback(): void {
        this.uuid = uuid();
        this.playlistId = this.getAttribute('playlist') ?? null;
        this.playlistSecret = this.getAttribute('secret') ?? null;

        if (!this.initSoundcloud()) {
            console.warn('Cant init soundcloud player');
            return;
        }

        this.playButton = this.querySelector('sc-play');
        this.stopButton = this.querySelector('sc-stop');
        this.selectTracks = this.querySelectorAll('sc-select-track');
        this.whenTrackPlaying = this.querySelectorAll('sc-track-is-playing');
        this.whenTrackSelected = this.querySelectorAll('sc-track-is-selected');

        this.bindEvents();
    }

    /**
     *
     * @private
     */
    private bindEvents(): void {
        EventService.listenEvent<TSCPlaylistTracksChangedDetails>(
            this.soundcloudInstance.getEvent('playlist.tracks.changed'),
            (detail) => {
                this.playlistTrackIds = detail.tracks.map((track): number =>
                    track.id ? track.id : -1,
                );
            },
        );

        this.playButton?.init(this);
        this.stopButton?.init(this);
        this.selectTracks?.forEach((el) => el.init(this));
        this.whenTrackPlaying?.forEach((el) => el.init(this));
        this.whenTrackSelected?.forEach((el) => el.init(this));
    }

    private initSoundcloud(): boolean {
        if (!(this.uuid && this.playlistId)) {
            return false;
        }

        this.iframePlayer = document.createElement('iframe');
        document.body.appendChild(this.iframePlayer);

        this.soundcloudInstance = new SCService(this.iframePlayer, this.uuid, {
            trackId: this.playlistId,
            secret: this.playlistSecret,
        });
        this.soundcloudInstance.init();
        return true;
    }

    getCurrentTrackIndex(): number {
        return getTrackIndexInPlaylist(
            this.soundcloudInstance.currentTrack,
            this.playlistTracks,
        );
    }
}

if (customElements.get('soundcloud-player') !== null) {
    customElements.define('soundcloud-player', SCPlayer);
}
