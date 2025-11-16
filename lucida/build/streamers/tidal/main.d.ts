import { Dispatcher } from 'undici';
import { ItemType, GetByUrlResponse, SearchResults, Streamer, Track, StreamerAccount } from '../../types.js';
interface TidalOptions {
    tvToken: string;
    tvSecret: string;
    accessToken: string;
    refreshToken: string;
    expires: number;
    countryCode: string;
    dispatcher?: Dispatcher;
}
export default class Tidal implements Streamer {
    #private;
    tvToken: string;
    tvSecret: string;
    accessToken: string;
    refreshToken: string;
    expires: number;
    countryCode: string;
    userId: number | undefined;
    dispatcher: Dispatcher | undefined;
    hostnames: string[];
    testData: {
        readonly 'https://tidal.com/browse/artist/3908662': {
            readonly type: "artist";
            readonly title: "Tyler, The Creator";
        };
        readonly 'https://tidal.com/browse/album/109485854': {
            readonly type: "album";
            readonly title: "IGOR";
        };
        readonly 'https://tidal.com/browse/track/95691774': {
            readonly type: "track";
            readonly title: "Potato Salad";
        };
    };
    failedAuth: boolean;
    constructor(options: TidalOptions);
    headers(): {
        'X-Tidal-Token': string;
        Authorization: string;
        'Accept-Encoding': string;
        'User-Agent': string;
    };
    isrcLookup(isrc: string): Promise<Track>;
    sessionValid(): Promise<boolean>;
    getCountryCode(): Promise<boolean>;
    getTokens(): Promise<string>;
    getCurrentConfig(): {
        tvToken: string;
        tvSecret: string;
        accessToken: string;
        refreshToken: string;
        expires: number;
        countryCode: string;
    };
    refresh(): Promise<boolean>;
    search(query: string, limit?: number): Promise<SearchResults>;
    getTypeFromUrl(url: string): Promise<ItemType>;
    getByUrl(url: string): Promise<GetByUrlResponse>;
    getAccountInfo(): Promise<StreamerAccount>;
}
export {};
