import { Album, Artist, CoverArtwork, Playlist, Track } from '../../types.js';
export declare enum DeezerFormat {
    MP3_128 = 1,
    MP3_320 = 3,
    FLAC = 9
}
export interface DeezerLoginResponse {
    error?: {
        type: string;
        message: string;
    };
}
export interface DeezerMediaResponse {
    data: [
        {
            media: [
                {
                    sources: [
                        {
                            url: string;
                        }
                    ];
                }
            ];
        }
    ];
}
export interface DeezerUserData {
    USER: {
        USER_ID: number;
        EXPLICIT_CONTENT_LEVEL: string;
        OPTIONS: {
            license_token: string;
            web_hq: boolean;
            web_lossless: boolean;
        };
        SETTING: {
            global: {
                language: string;
            };
        };
    };
    OFFER_ID: number;
    COUNTRY: string;
    checkForm: string;
}
export interface DeezerArtist {
    ART_ID: string;
    ART_NAME: string;
    ART_PICTURE: string;
}
export declare function parseArtist(artist: DeezerArtist, tracks?: DeezerTrack[], albums?: DeezerAlbum[]): Artist;
export interface DeezerAlbum {
    ALB_ID: string;
    ALB_TITLE: string;
    ALB_PICTURE: string;
    ARTISTS?: DeezerArtist[];
    ORIGINAL_RELEASE_DATE?: string;
    NUMBER_TRACK?: string;
    COPYRIGHT?: string;
    UPC?: string;
    LABEL_NAME?: string;
}
export declare function parseAlbum(album: DeezerAlbum): Album;
export interface DeezerTrack {
    SNG_ID: string;
    SNG_TITLE: string;
    VERSION: string;
    EXPLICIT_LYRICS: '0' | '1';
    TRACK_NUMBER: string;
    DISK_NUMBER: string;
    ARTISTS: DeezerArtist[];
    ISRC: string;
    SNG_CONTRIBUTORS: {
        [role: string]: string[];
    };
    ALB_ID: string;
    ALB_TITLE: string;
    ALB_PICTURE: string;
    DURATION: string;
    AVAILABLE_COUNTRIES?: {
        STREAM_ADS?: string;
    };
    COPYRIGHT: string;
    TRACK_TOKEN: string;
    TRACK_TOKEN_EXPIRE: number;
    MD5_ORIGIN: string;
    MEDIA_VERSION: string;
    FILESIZE_MP3_320: string;
    FILESIZE_FLAC: string;
    FALLBACK?: DeezerTrack;
}
export interface DeezerLyrics {
    LYRICS_ID: string;
    LYRICS_SYNC_JSON: DeezerSyncedLine[];
    LYRICS_TEXT: string;
}
export interface DeezerSyncedLine {
    lrc_timestamp?: string;
    milliseconds?: string;
    duration?: string;
    line: string;
}
export declare function parseTrack(track: DeezerTrack, lyricsData?: DeezerLyrics): Track;
export declare function parseArtwork(picture: string): CoverArtwork[];
export interface DeezerPlaylistMetadata {
    PLAYLIST_ID: string;
    TITLE: string;
    DESCRIPTION: string;
    PLAYLIST_PICTURE: string;
    DURATION: number;
    NB_SONG: number;
}
export declare function parsePlaylistMetadata(raw: DeezerPlaylistMetadata): Playlist;
