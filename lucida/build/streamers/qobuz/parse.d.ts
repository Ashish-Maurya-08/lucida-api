import { Artist, Album, Track, PlaylistGetByUrlResponse } from '../../types.js';
export interface RawArtist {
    id: number;
    name: string;
    picture?: string;
    image?: {
        small: string;
        medium: string;
        large: string;
    };
    albums?: {
        items: RawAlbum[];
    };
    tracks_appears_on?: {
        items: RawTrack[];
    };
}
export declare function parseArtist(raw: RawArtist): Artist;
export interface RawAlbum {
    title: string;
    version?: string;
    id: string;
    url: string;
    image: {
        thumbnail: string;
        small: string;
        large: string;
    };
    tracks?: {
        items: RawTrack[];
    };
    artists?: RawArtist[];
    artist: RawArtist;
    upc: string;
    released_at: number;
    label?: {
        name: string;
        id: number;
    };
    genre?: {
        name: string;
        id: number;
        slug: string;
    };
    copyright: string;
}
export declare function parseAlbum(raw: RawAlbum): Album;
export interface RawTrack {
    title: string;
    version?: string;
    id: number;
    copyright?: string;
    performer: RawArtist;
    album?: RawAlbum;
    track_number?: number;
    media_number?: number;
    duration: number;
    parental_warning: boolean;
    isrc: string;
    performers?: string;
}
export declare function parseTrack(raw: RawTrack): Track;
export interface RawPlaylist {
    owner: {
        id: number;
        name: string;
    };
    id: number;
    name: string;
    images: string[];
    is_collaborative: boolean;
    description: string;
    created_at: number;
    duration: number;
    tracks_count: number;
    tracks: {
        offset?: number;
        limit?: number;
        total?: number;
        items: RawTrack[];
    };
}
export declare function parsePlaylist(raw: RawPlaylist): PlaylistGetByUrlResponse;
