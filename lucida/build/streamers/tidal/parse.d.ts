import { Album, Artist, Playlist, Track } from '../../types.js';
export interface RawArtist {
    id: string;
    url?: string;
    name: string;
    picture?: string;
}
export declare function parseArtist(raw: RawArtist): Artist;
export interface RawAlbum {
    cover: string;
    id: number;
    url: string;
    numberOfTracks?: number;
    numberOfVolumes?: number;
    title: string;
    artists?: RawArtist[];
    upc?: string;
    releaseDate?: string;
}
export declare function parseAlbum(raw: RawAlbum): Album;
export interface RawPlaylist {
    uuid: string;
    title: string;
    url: string;
    numberOfTracks: number;
    tracks: Track[];
    cover: string;
}
export declare function parsePlaylist(raw: RawPlaylist): Playlist;
export interface RawTrack {
    url: string;
    id: number;
    artists: RawArtist[];
    duration: number;
    copyright: string;
    isrc?: string;
    producers?: string[];
    composers?: string[];
    lyricists?: string[];
    explicit?: boolean;
    trackNumber?: number;
    volumeNumber?: number;
    title: string;
    version?: string;
    album: RawAlbum;
}
export declare function parseTrack(raw: RawTrack): Track;
export interface Contributor {
    name: string;
    role: string;
}
export interface ContributorsByType {
    type: string;
    contributors: {
        name: string;
        id: number;
    }[];
}
export declare function addCredits(raw: RawTrack, credits: Contributor[] | ContributorsByType[]): RawTrack;
export declare function parseMpd(mpdString: string): string[];
