import { SCService } from '../Classes/SCService.ts';
import { uuid } from '../utils/uuid.ts';
import { EventManager } from '../Classes/EventManager.ts';
import { type SCSelectTrack } from './Controls/SCSelectTrack.ts';
import { type SCPlay } from './Controls/SCPlay.ts';
import { type SCStop } from './Controls/SCStop.ts';

export class SCPlayer extends HTMLElement {
    playButton?: SCPlay | null;
    stopButton?: SCStop | null;
    selectTracks: NodeListOf<SCSelectTrack> | undefined;
    // progress: NodeListOf<HTMLElement>;
    soundcloudInstance!: SCService;
    iframePlayer!: HTMLIFrameElement;
    // background!: HTMLImageElement | null;
    // time: HTMLInputElement | null;
    uuid: string | undefined;
    trackId?: string | null;

    connectedCallback(): void {
        this.uuid = uuid();
        this.trackId = this.getAttribute('track-id');

        if (!this.initSoundcloud()) {
            console.warn('Cant init soundcloud player');
            return;
        }

        this.playButton = this.querySelector('soundcloud-player-play');
        this.stopButton = this.querySelector('soundcloud-player-stop');
        this.selectTracks = this.querySelectorAll(
            'soundcloud-player-select-track',
        );
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

        this.playButton?.attachPlayer(this).bindEvents();
        this.stopButton?.attachPlayer(this).bindEvents();
        this.selectTracks?.forEach((el: SCSelectTrack) => {
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
        if (!(this.uuid && this.trackId)) {
            return false;
        }

        this.iframePlayer = document.createElement('iframe');
        document.body.appendChild(this.iframePlayer);

        this.soundcloudInstance = new SCService(this.iframePlayer, this.uuid, {
            trackId: this.trackId,
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
