import { type TSCTrack } from './Classes/SCService.ts';

export function getTrackIndexInPlaylist(
    track: TSCTrack,
    tracks: TSCTrack[],
): number {
    return tracks.findIndex((t) => t.id === track.id);
}
