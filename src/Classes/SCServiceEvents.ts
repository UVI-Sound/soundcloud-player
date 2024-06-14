import { type TSCTrack } from './SCService.ts';

export interface TSCTrackSkipDetails {
    index: number;
    resetTime: boolean;
}

export interface TSCTrackChangedDetails {
    track: TSCTrack;
}

export interface TSCPlaylistTracksChangedDetails {
    tracks: TSCTrack[];
}

export interface TSCTrackTime {
    // Current track millisecond position
    ms: number;
}
