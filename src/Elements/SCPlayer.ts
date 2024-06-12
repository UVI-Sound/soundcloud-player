import { SCService, type TrackType } from '../Classes/SCService.ts';
import { uuid } from '../utils/uuid.ts';
import { EventManager } from '../Classes/EventManager.ts';
import { type SCPlay } from './Controls/SCPlay.ts';
import { type SCStop } from './Controls/SCStop.ts';
import { type SCSelectTrack } from './Controls/SCSelectTrack.ts';
import { type SCWhenTrackPlaying } from './Controls/SCWhenTrackPlaying.ts';

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
        // this.progress = this.querySelectorAll('[data-progress]');
        // this.background = this.querySelector('[data-background]');
        // this.time = this.querySelector('[data-time]');

        this.bindEvents();
    }

    /**
     *
     * @private
     */
    private bindEvents(): void {
        // EventManager.listenEvent<TrackType>(
        //     this.soundcloudInstance.getEvent('track.changed'),
        //     this.handleTrackChanged.bind(this),
        // );

        EventManager.listenEvent(
            this.soundcloudInstance.getEvent('track.progressed'),
            this.handleTrackProgress.bind(this),
        );

        EventManager.listenEvent(
            this.soundcloudInstance.getEvent('playlist.tracks.changed'),
            (tracks: TrackType[]) => {
                this.playlistTrackIds = tracks.map((track): number =>
                    track.id ? track.id : -1,
                );
            },
        );

        this.playButton?.attachPlayer(this).bindEvents();
        this.stopButton?.attachPlayer(this).bindEvents();
        this.selectTracks?.forEach((el: SCSelectTrack) => {
            el.attachPlayer(this).bindEvents();
        });
        this.whenTrackPlaying?.forEach((el: SCWhenTrackPlaying) => {
            el.attachPlayer(this).bindEvents();
        });

        // this.time?.addEventListener('input', () => {
        //     const percentage = parseInt(this.time?.value ?? '0');
        //     const newTime =
        //         (percentage / 100) *
        //         this.soundcloudInstance.currentTrack.duration;
        //     this.soundcloudInstance.soundcloud.seekTo(newTime);
        // });
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

    private handleTrackProgress(): void {
        // this.progress.forEach((el) => {
        //     const propertyArray = el.dataset.progress?.split('.') ?? [];
        //     let obj = el;
        //
        //     for (let i = 0; i < propertyArray.length - 1; i++) {
        //         // @ts-expect-error todo
        //         obj = obj[propertyArray[i]];
        //     }
        //
        //     // @ts-expect-error todo
        //     obj[propertyArray[propertyArray.length - 1]] =
        //         this.soundcloudInstance.currentTrack.percentPlayed.toString();
        // });
    }

    getCurrentTrackIndex(): number {
        if (!this.soundcloudInstance.currentTrack.id) {
            console.log(this.soundcloudInstance.currentTrack.id)
            return -1;
        }
        return this.playlistTrackIds.indexOf(
            this.soundcloudInstance.currentTrack.id,
        );
    }

    // private handleTrackChanged(newTrack: TrackType): void {
    // if (this.titleContainer === null) return;
    // this.titleContainer.innerHTML = newTrack.title;
    //
    // if (this.background === null) return;
    //
    // this.background.src = newTrack.artwork_url;
    // }
}

if (customElements.get('soundcloud-player') !== null) {
    customElements.define('soundcloud-player', SCPlayer);
}
