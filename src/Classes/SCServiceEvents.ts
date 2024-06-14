import { type TSCTrack } from './SCService.ts';

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
