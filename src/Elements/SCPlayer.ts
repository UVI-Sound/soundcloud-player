import { SCService } from '../Classes/SCService.ts';
import { uuid } from '../utils/uuid.ts';
import { EventService } from '../Classes/EventService.ts';
import { type SCPlay } from './Controls/SCPlay.ts';
import { type SCStop } from './Controls/SCStop.ts';
import { type SCSelectTrack } from './Controls/SCSelectTrack.ts';
import { type SCWhenTrackPlaying } from './Controls/SCWhenTrackPlaying.ts';
import { type TSCPlaylistTracksChangedDetails } from '../Classes/SCServiceEvents.ts';

export class SCPlayer extends HTMLElement {
    playButton!: SCPlay | null;
    stopButton!: SCStop | null;
    selectTracks!: NodeListOf<SCSelectTrack>;
    soundcloudInstance!: SCService;
    whenTrackPlaying!: NodeListOf<SCWhenTrackPlaying>;
    iframePlayer!: HTMLIFrameElement;

    uuid: string | undefined;
    playlistId!: string | null;
    playlistSecret!: string | null;
    playlistTrackIds: number[] = [];

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
        this.whenTrackPlaying = this.querySelectorAll('sc-when-track-playing');

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
        if (!this.soundcloudInstance.currentTrack.id) {
            return -1;
        }
        return this.playlistTrackIds.indexOf(
            this.soundcloudInstance.currentTrack.id,
        );
    }
}

if (customElements.get('soundcloud-player') !== null) {
    customElements.define('soundcloud-player', SCPlayer);
}
