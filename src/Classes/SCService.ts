import { loadScript } from '../utils/loadScript.ts';
import { EventManager } from './EventManager.ts';
import { hideIframe } from '../utils/hiddeIframe.ts';
import {
    type TSCPlaylistTracksChangedDetails,
    type TSCTrackChangedDetails,
    type TSCTrackSkipDetails,
    type TSCTrackTime,
} from './SCServiceEvents.ts';

export interface TSCTrack {
    title: string;
    duration: number;
    percentPlayed: number;
    artwork_url: string;
    id?: number;
}

export interface SoundcloudType {
    bind: <T>(type: string, callback: (data: T) => void) => void;
    getSounds: (callback: (sounds: TSCTrack[]) => void) => void;
    play: () => void;
    pause: () => void;
    seekTo: (ms: number) => void;
    skip: (soundIndex: number) => void;
    getCurrentSound: (callback: (currentSound: TSCTrack) => void) => void;
}

export type ScEventTypes =
    | 'track.play'
    | 'track.start-playing'
    | 'track.stop-playing'
    | 'track.changed'
    | 'track.pause'
    | 'track.progressed'
    | 'track.time'
    | 'track.skip'
    | 'playlist.tracks.changed'
    | 'sc.ready';

const scWindow = window as unknown as {
    SC: {
        Widget: ((iframe: HTMLIFrameElement) => SoundcloudType) & {
            Events: {
                PLAY: string;
                PLAY_PROGRESS: string;
                PAUSE: string;
            };
        };
    };
};

export class SCService {
    soundcloud!: SoundcloudType;
    currentTrack: TSCTrack;

    constructor(
        private readonly iframe: HTMLIFrameElement,
        private readonly elementUuid: string,
        private readonly options: { trackId: string; secret: string | null },
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
            (this.options.secret
                ? '%3Fsecret_token%3' + this.options.secret
                : '');

        hideIframe(this.iframe);
        loadScript('https://w.soundcloud.com/player/api.js', () => {
            this.soundcloud = scWindow.SC.Widget(this.iframe);
            this.soundcloud.bind('ready', () => {
                EventManager.sendEvent(this.getEvent('sc.ready'));
                this.soundcloud.getSounds((sounds: TSCTrack[]) => {
                    this.changePlaylistTrackIds(sounds);
                    this.trackChanged(sounds[0]);
                });
            });
            this.soundcloud.bind(
                scWindow.SC.Widget.Events.PLAY_PROGRESS,
                (progress: { currentPosition: number }) => {
                    this.currentTrack.percentPlayed = Number(
                        (
                            (progress.currentPosition /
                                this.currentTrack.duration) *
                            100
                        ).toFixed(2),
                    );
                    EventManager.sendEvent(this.getEvent('track.progressed'));
                },
            );
            this.soundcloud.bind(scWindow.SC.Widget.Events.PLAY, () =>
                EventManager.sendEvent(this.getEvent('track.start-playing')),
            );
            this.soundcloud.bind(scWindow.SC.Widget.Events.PAUSE, () =>
                EventManager.sendEvent(this.getEvent('track.stop-playing')),
            );
        });
    }

    /**
     * Track changed
     * @param track
     * @private
     */
    private trackChanged(track: TSCTrack): void {
        this.currentTrack = track;
        EventManager.sendEvent<TSCTrackChangedDetails>(
            this.getEvent('track.changed'),
            { track },
        );
    }

    private changePlaylistTrackIds(tracks: TSCTrack[]): void {
        EventManager.sendEvent<TSCPlaylistTracksChangedDetails>(
            this.getEvent('playlist.tracks.changed'),
            { tracks },
        );
    }

    private bindEvents(): void {
        EventManager.listenEvent(this.getEvent('track.play'), () => {
            this.soundcloud.play();
        });
        EventManager.listenEvent(this.getEvent('track.pause'), () => {
            this.soundcloud.pause();
        });

        EventManager.listenEvent<TSCTrackTime>(
            this.getEvent('track.time'),
            (detail) => {
                this.soundcloud.seekTo(detail.ms);
            },
        );
        EventManager.listenEvent<TSCTrackSkipDetails>(
            this.getEvent('track.skip'),
            (detail) => {
                this.skipTo(detail.index, detail.resetTime);
            },
        );
    }

    /**
     *
     * @param index - track index in playlist
     * @param resetTime - if true, time will be set to 0
     */
    skipTo(index: number, resetTime: boolean = false): void {
        this.soundcloud.skip(index);
        if (resetTime) {
            this.soundcloud.seekTo(0);
        }
        this.soundcloud.getCurrentSound(this.trackChanged.bind(this));
    }

    getEvent(type: ScEventTypes): string {
        return this.elementUuid + type;
    }
}
