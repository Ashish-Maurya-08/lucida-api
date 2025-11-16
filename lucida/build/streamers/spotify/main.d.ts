import Librespot, { LibrespotOptions } from 'librespot';
import { GetByUrlResponse, SearchResults, StreamerAccount, StreamerWithLogin, Track } from '../../types.js';
interface SpotifyOptions extends LibrespotOptions {
    username?: string;
    storedCredential?: string;
}
declare class Spotify implements StreamerWithLogin {
    #private;
    client: Librespot;
    hostnames: string[];
    testData: {
        readonly 'https://open.spotify.com/track/1jzIJcHCXneHw7ojC6LXiF': {
            readonly type: "track";
            readonly title: "Potato Salad";
        };
        readonly 'https://open.spotify.com/album/5zi7WsKlIiUXv09tbGLKsE': {
            readonly type: "album";
            readonly title: "IGOR";
        };
        readonly 'https://open.spotify.com/artist/4V8LLVI7PbaPR0K2TGSxFF': {
            readonly type: "artist";
            readonly title: "Tyler, The Creator";
        };
    };
    username?: string;
    storedCredential?: string;
    constructor(options: SpotifyOptions);
    login(username: string, password: string): Promise<void>;
    getStoredCredentials(): {
        username: string;
        storedCredential: string;
    };
    getTypeFromUrl(url: string): Promise<"artist" | "album" | "track" | "episode" | "podcast" | "playlist">;
    getByUrl(url: string, limit?: number): Promise<GetByUrlResponse>;
    search(query: string): Promise<SearchResults>;
    isrcLookup(isrc: string): Promise<Track>;
    getAccountInfo(): Promise<StreamerAccount>;
}
export default Spotify;
