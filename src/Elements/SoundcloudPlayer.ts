import { Soundcloud, type TrackType } from '../Classes/Soundcloud.ts';
import { uuid } from '../utils/uuid.ts';
import { EventManager } from '../Classes/EventManager.ts';

export class SoundcloudPlayer extends HTMLElement {
    titleContainer: HTMLElement | null;
    playButton: HTMLElement | null;
    stopButton: HTMLElement | null;
    selectTracks: NodeListOf<HTMLElement>;
    progress: NodeListOf<HTMLElement>;
    soundcloudInstance!: Soundcloud;
    iframePlayer!: HTMLIFrameElement;
    background!: HTMLImageElement | null;
    time: HTMLInputElement | null;
    uuid: string;

    constructor() {
        super();

        this.uuid = uuid();
        this.initSoundcloud();

        this.titleContainer = this.querySelector('[data-title]');
        this.playButton = this.querySelector('soundcloud-player-play');
        this.stopButton = this.querySelector('soundcloud-player-stop');
        this.selectTracks = this.querySelectorAll('soundcloud-player-select-track');
        this.progress = this.querySelectorAll('[data-progress]');
        this.background = this.querySelector('[data-background]');
        this.time = this.querySelector('[data-time]');

        this.bindEvents();
    }

    /**
     *
     * @private
     */
    private bindEvents(): void {
        EventManager.listenEvent<TrackType>(
            this.soundcloudInstance.getEvent('track.changed'),
            this.handleTrackChanged.bind(this),
        );

        EventManager.listenEvent(
            this.soundcloudInstance.getEvent('track.progressed'),
            this.handleTrackProgress.bind(this),
        );

        this.playButton?.addEventListener('click', () => {
            EventManager.sendEvent(
                this.soundcloudInstance.getEvent('track.play'),
            );
        });

        this.stopButton?.addEventListener('click', () => {
            EventManager.sendEvent(this.soundcloudInstance.getEvent('track.pause'));
        });

        this.time?.addEventListener('input', () => {
            const percentage = parseInt(this.time?.value ?? '0');
            const newTime =
                (percentage / 100) *
                this.soundcloudInstance.currentTrack.duration;
            this.soundcloudInstance.soundcloud.seekTo(newTime);
        });


        this.selectTracks.forEach((el) => {
            el.addEventListener('click', () => {
                EventManager.sendEvent(
                    this.soundcloudInstance.getEvent('track.skip'),
                    el.dataset.trackId,
                );
                console.log(this.soundcloudInstance.currentTrack)
                // EventManager.sendEvent(
                //     this.soundcloudInstance.getEvent('track.play'),
                // );
            });
        })
    }

    private initSoundcloud(): void {
        this.iframePlayer = document.createElement('iframe');
        document.body.appendChild(this.iframePlayer);
        this.soundcloudInstance = new Soundcloud(this.iframePlayer, this.uuid, {
            trackId: this.getAttribute('track-id') ?? '',
        });
        this.soundcloudInstance.init();
    }

    private handleTrackProgress(): void {
        this.progress.forEach((el) => {
            const propertyArray = el.dataset.progress?.split('.') ?? [];
            let obj = el;

            for (let i = 0; i < propertyArray.length - 1; i++) {
                // @ts-expect-error todo
                obj = obj[propertyArray[i]];
            }

            // @ts-expect-error todo
            obj[propertyArray[propertyArray.length - 1]] =
                this.soundcloudInstance.currentTrack.percentPlayed.toString();
        });
    }

    private handleTrackChanged(newTrack: TrackType): void {
        if (this.titleContainer === null) return;
        this.titleContainer.innerHTML = newTrack.title;

        if (this.background === null) return;

        this.background.src = newTrack.artwork_url;
    }
}

if (customElements.get('soundcloud-player') !== null) {
    customElements.define('soundcloud-player', SoundcloudPlayer);
}
