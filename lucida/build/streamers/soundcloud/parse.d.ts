/// <reference types="node" resolution-mode="require"/>
import { Artist, Album, Track } from '../../types.js';
export interface RawArtist {
    id: number;
    username: string;
    full_name: string;
    avatar_url?: string;
    permalink_url: string;
    kind: 'user';
}
export interface Headers {
    Authorization?: string;
    'User-Agent': string;
}
export declare function parseArtist(raw: RawArtist): Promise<Artist>;
export interface RawAlbum {
    title: string;
    id: number;
    permalink_url: string;
    tracks: RawTrack[];
    track_count: number;
    release_date: string;
    user: RawArtist;
    user_id: number | string;
    kind: 'playlist';
}
export declare function parseAlbum(raw: RawAlbum): Promise<Album>;
export interface RawTrack {
    media?: {
        transcodings?: {
            duration: number;
        }[];
    };
    kind: 'track';
    id: number | string;
    title: string;
    duration: number;
    created_at: string;
    full_duration: number;
    permalink_url: string;
    artwork_url?: string;
    user: RawArtist;
    last_modified: string;
    description: string;
    user_id: number | string;
}
export declare function parseTrack(raw: RawTrack): Promise<Track>;
export declare function parseHls(url: string, container: string): Promise<NodeJS.ReadableStream>;
export interface RawSearchResults {
    collection: (RawAlbum | RawTrack | RawArtist)[];
    total_results: number;
    facets: [];
    next_href: string;
    query_urn: string;
}
export interface ScClient {
    anonId: string;
    version: string;
    id: string | undefined;
}
