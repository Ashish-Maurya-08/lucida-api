import type { SpotifyAlbum, SpotifyArtist, SpotifyTrack, SpotifyEpisode, SpotifyPodcast, SpotifyPlaylist } from 'librespot/types';
import { Album, Artist, Episode, Playlist, Podcast, Track } from '../../types.js';
export declare function parseArtist(raw: SpotifyArtist): Artist;
export declare function parseTrack(raw: SpotifyTrack): Track;
export declare function parseAlbum(raw: SpotifyAlbum): Album;
export declare function parseEpisode(raw: SpotifyEpisode): Episode;
export declare function parsePodcast(raw: SpotifyPodcast): Podcast;
export declare function parsePlaylist(raw: SpotifyPlaylist): Playlist;
