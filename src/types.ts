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

export type TSCEvents =
    | 'sc.ready'
    | 'track.set-time'
    | 'track.time-set'
    | 'track.change'
    | 'track.changed'
    | 'track.start'
    | 'track.started'
    | 'track.stop'
    | 'track.stopped'
    | 'track.progressed'
    | 'playlist.tracks.changed';

export interface TSCTrackSkipDetails {
    index: number;
    resetTime: boolean;
}

export interface TSCTrackChangeDetails {
    currentTrackIndex: number;
    withTimeReset?: boolean;
}

export interface TSCPlaylistTracksChangedDetails {
    tracks: TSCTrack[];
}

export interface TSCTrackSetTime {
    // Current track millisecond position
    ms: number;
}
