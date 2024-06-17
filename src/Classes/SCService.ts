import { loadScript } from '../utils/loadScript.ts';
import { EventService } from './EventService.ts';
import { hideIframe } from '../utils/hiddeIframe.ts';
import {
    type TSCEvents,
    type TSCPlaylistTracksChangedDetails,
    type TSCTrackChangeDetails,
    type TSCTrackSetTime,
} from './SCServiceEvents.ts';
import { getTrackIndexInPlaylist } from '../helpers.ts';

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

    isPaused: (callback: (isPaused: boolean) => void) => void;
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
    currentPlaylist!: TSCTrack[];

    constructor(
        private readonly iframe: HTMLIFrameElement,
        private readonly elementUuid: string,
        private readonly options: {
            playlistId: string;
            playlistSecret: string | null;
        },
    ) {
        this.currentTrack = {
            title: '',
            duration: 0,
            percentPlayed: 0,
            artwork_url: '',
        };
    }

    /**
     * Initializes the SoundCloud player by setting up the required properties and loading the necessary scripts.
     *
     * @returns {void}
     */
    init(): void {
        this.iframe.allow = 'autoplay';
        this.iframe.src =
            'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' +
            this.options.playlistId +
            (this.options.playlistSecret
                ? '%3Fsecret_token%3' + this.options.playlistSecret
                : '');

        hideIframe(this.iframe);
        loadScript('https://w.soundcloud.com/player/api.js', () => {
            this.soundcloud = scWindow.SC.Widget(this.iframe);
            this.bindEvents();
        });
    }

    /**
     * Skips to the specified index in the track list.
     *
     * @param {number} index - The index of the track to skip to.
     * @param {boolean} [resetTime=false] - Specifies whether to reset the playback time to 0 when skipping.
     *
     * @returns {void}
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

    /**
     * Retrieves the event associated with the given type.
     *
     * @param {TSCEvents} type - The type of event.
     * @returns {string} - The event associated with the given type.
     */
    getEvent(type: TSCEvents): string {
        return this.elementUuid + type;
    }

    /**
     * Returns the index of the current track in the playlist.
     *
     * @returns {number} The index of the current track.
     */
    getCurrentTrackIndex(): number {
        return getTrackIndexInPlaylist(this.currentTrack, this.currentPlaylist);
    }

    /**
     * Checks if the audio is currently playing or paused, and executes the specified callback function with the result.
     *
     * @return {void}
     * @param callback
     */
    checkIfPlayingThenExecCallback(
        callback: (isPaused: boolean) => void,
    ): void {
        this.soundcloud.isPaused(callback);
    }

    /**
     * Updates the current track and triggers an event to notify track change.
     *
     * @param {TSCTrack} track - The new track to set as the current track.
     *
     * @private
     * @returns {void}
     */
    private trackChanged(track: TSCTrack): void {
        this.currentTrack = track;
        EventService.sendEvent<TSCTrackChangeDetails>(
            this.getEvent('track.changed'),
            {
                currentTrackIndex: getTrackIndexInPlaylist(
                    track,
                    this.currentPlaylist,
                ),
            },
        );
    }

    /**
     * Binds events to the SoundCloud player.
     *
     * @private
     */
    private bindEvents(): void {
        this.soundcloud.bind('ready', () => {
            EventService.sendEvent(this.getEvent('sc.ready'));
            this.soundcloud.getSounds((tracks: TSCTrack[]) => {
                this.currentPlaylist = tracks;

                EventService.sendEvent<TSCPlaylistTracksChangedDetails>(
                    this.getEvent('playlist.tracks.changed'),
                    { tracks },
                );

                this.trackChanged(tracks[0]);
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

        this.soundcloud.bind(scWindow.SC.Widget.Events.PLAY, () => {
            EventService.sendEvent(this.getEvent('track.started'));
        });
        this.soundcloud.bind(scWindow.SC.Widget.Events.PAUSE, () =>
            EventService.sendEvent(this.getEvent('track.stopped')),
        );

        EventService.listenEvent(this.getEvent('track.start'), () => {
            this.soundcloud.play();
        });
        EventService.listenEvent(this.getEvent('track.stop'), () => {
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

        EventService.listenEvent<TSCTrackChangeDetails>(
            this.getEvent('track.change'),
            (detail) => {
                this.skipTo(detail.currentTrackIndex, detail.withTimeReset);
            },
        );
    }
}
