import { loadScript } from '../utils/loadScript.ts';
import { EventService } from './EventService.ts';
import { hideIframe } from '../utils/hiddeIframe.ts';
import {
    type TSCEvents,
    type TSCPlaylistTracksChangedDetails,
    type TSCTrackChangedDetails,
    type TSCTrackSkipDetails,
    type TSCTrackSetTime,
} from './SCServiceEvents.ts';

export interface TSCTrack {
    title: string;
    duration: number;
    percentPlayed: number;
    artwork_url: string;
    id?: number;
}

export interface TSCWidget {
    bind: <T>(type: string, callback: (data: T) => void) => void;
    getSounds: (callback: (sounds: TSCTrack[]) => void) => void;
    play: () => void;
    pause: () => void;
    seekTo: (ms: number) => void;
    skip: (soundIndex: number) => void;
    getCurrentSound: (callback: (currentSound: TSCTrack) => void) => void;
}

const scWindow = window as unknown as {
    SC: {
        Widget: ((iframe: HTMLIFrameElement) => TSCWidget) & {
            Events: {
                PLAY: string;
                PLAY_PROGRESS: string;
                PAUSE: string;
            };
        };
    };
};

export class SCService {
    soundcloud!: TSCWidget;
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
            this.bindEvents();
        });
    }

    /**
     * Track changed
     * @param track
     * @private
     */
    private trackChanged(track: TSCTrack): void {
        this.currentTrack = track;
        EventService.sendEvent<TSCTrackChangedDetails>(
            this.getEvent('track.changed'),
            { track },
        );
    }

    private changePlaylistTrackIds(tracks: TSCTrack[]): void {
        EventService.sendEvent<TSCPlaylistTracksChangedDetails>(
            this.getEvent('playlist.tracks.changed'),
            { tracks },
        );
    }

    private bindEvents(): void {
        this.soundcloud.bind('ready', () => {
            EventService.sendEvent(this.getEvent('sc.ready'));
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
                EventService.sendEvent(this.getEvent('track.progressed'));
            },
        );

        this.soundcloud.bind(scWindow.SC.Widget.Events.PLAY, () =>
            EventService.sendEvent(this.getEvent('track.started')),
        );
        this.soundcloud.bind(scWindow.SC.Widget.Events.PAUSE, () =>
            EventService.sendEvent(this.getEvent('track.stopped')),
        );

        EventService.listenEvent(this.getEvent('track.start'), () => {
            console.log('play');
            this.soundcloud.play();
        });
        EventService.listenEvent(this.getEvent('track.stop'), () => {
            console.log('pause');
            this.soundcloud.pause();
        });

        EventService.listenEvent<TSCTrackSetTime>(
            this.getEvent('track.set-time'),
            (detail) => {
                this.soundcloud.seekTo(detail.ms);
                EventService.sendEvent<TSCTrackSetTime>(
                    this.getEvent('track.time-set'),
                    { ms: detail.ms },
                );
            },
        );
        EventService.listenEvent<TSCTrackSkipDetails>(
            this.getEvent('track.change'),
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
        if (resetTime) {
            EventService.sendEvent<TSCTrackSetTime>(
                this.getEvent('track.set-time'),
                { ms: 0 },
            );
        }
        this.soundcloud.skip(index);
        this.soundcloud.getCurrentSound(this.trackChanged.bind(this));
    }

    getEvent(type: TSCEvents): string {
        return this.elementUuid + type;
    }
}
