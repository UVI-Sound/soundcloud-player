import { loadScript } from '../utils/loadScript.ts';
import { EventManager } from './EventManager.ts';
import { hideIframe } from '../utils/hiddeIframe.ts';

export interface TrackType {
    title: string;
    duration: number;
    percentPlayed: number;
    artwork_url: string;
}

export interface SoundcloudType {
    bind: <T>(type: string, callback: (data: T) => void) => void;
    getSounds: (callback: (sounds: TrackType[]) => void) => void;
    play: () => void;
    pause: () => void;
    seekTo: (ms: number) => void;
    skip: (soundIndex: number) => void;
}

export interface ScOptionsType {
    trackId: string;
}

export type ScEventTypes =
    | 'track.play'
    | 'track.changed'
    | 'track.pause'
    | 'track.progressed'
    | 'track.time'
    | 'track.skip';

const scWindow = window as unknown as {
    SC: {
        Widget: ((iframe: HTMLIFrameElement) => SoundcloudType) & {
            Events: {
                PLAY_PROGRESS: string;
            };
        };
    };
};

export class SCService {
    soundcloud!: SoundcloudType;
    currentTrack: TrackType;

    constructor(
        private readonly iframe: HTMLIFrameElement,
        private readonly elementUuid: string,
        private readonly options: ScOptionsType,
    ) {
        this.currentTrack = {
            title: '',
            duration: 0,
            percentPlayed: 0,
            artwork_url: '',
        };
        this.bindEvents();
    }

    init(): void {
        this.iframe.allow = 'autoplay';
        this.iframe.src =
            'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' +
            this.options.trackId +
            '%3Fsecret_token%3Ds-0j1baSmbbsa';

        hideIframe(this.iframe);
        loadScript('https://w.soundcloud.com/player/api.js', () => {
            this.soundcloud = scWindow.SC.Widget(this.iframe);
            this.soundcloud.bind('ready', () => {
                this.soundcloud.getSounds((sounds) => {
                    console.log(sounds);
                    const tracks = sounds.filter((sound) =>
                        Object.prototype.hasOwnProperty.call(sound, 'title'),
                    );
                    this.trackChanged(tracks[0]);
                });
            });
            this.soundcloud.bind(
                scWindow.SC.Widget.Events.PLAY_PROGRESS,
                (progress: { currentPosition: number }) => {
                    this.trackProgressed(progress.currentPosition);
                },
            );
        });
    }

    /**
     * Track changed
     * @param track
     * @private
     */
    private trackChanged(track: TrackType): void {
        this.currentTrack = track;
        EventManager.sendEvent(this.getEvent('track.changed'), track);
    }

    /**
     * Track progressed
     * @param currentPosition
     * @private
     */
    private trackProgressed(currentPosition: number): void {
        this.currentTrack.percentPlayed = Number(
            ((currentPosition / this.currentTrack.duration) * 100).toFixed(2),
        );
        EventManager.sendEvent(this.getEvent('track.progressed'));
    }

    private bindEvents(): void {
        EventManager.listenEvent(this.getEvent('track.play'), () => {
            this.soundcloud.play();
        });
        EventManager.listenEvent(this.getEvent('track.pause'), () => {
            this.soundcloud.pause();
        });

        EventManager.listenEvent(this.getEvent('track.time'), (ms: number) => {
            this.soundcloud.seekTo(ms);
        });
        EventManager.listenEvent(
            this.getEvent('track.skip'),
            (index: number) => {
                this.soundcloud.skip(index);
            },
        );
    }

    public getEvent(type: ScEventTypes): string {
        return this.elementUuid + type;
    }
}
