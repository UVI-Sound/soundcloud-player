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
     * Changes the track IDs of a playlist.
     *
     * @param {TSCTrack[]} tracks - The array of tracks with the new track IDs.
     *
     * @private
     * @return {void}
     */
    private changePlaylistTrackIds(tracks: TSCTrack[]): void {
        EventService.sendEvent<TSCPlaylistTracksChangedDetails>(
            this.getEvent('playlist.tracks.changed'),
            { tracks },
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
            this.soundcloud.getSounds((sounds: TSCTrack[]) => {
                this.currentPlaylist = sounds;
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
}
