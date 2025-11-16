import { Dispatcher } from 'undici';
import { GetByUrlResponse, ItemType, SearchResults, StreamerAccount, StreamerWithLogin, Track } from '../../types.js';
import { DeezerFormat } from './parse.js';
interface DeezerOptions {
    arl?: string;
    dispatcher?: Dispatcher | undefined;
}
export default class Deezer implements StreamerWithLogin {
    #private;
    hostnames: string[];
    testData: {
        readonly 'https://www.deezer.com/us/artist/1194083': {
            readonly type: "artist";
            readonly title: "Tyler, The Creator";
        };
        readonly 'https://www.deezer.com/us/track/559711712': {
            readonly type: "track";
            readonly title: "Potato Salad";
        };
        readonly 'https://www.deezer.com/us/album/97140952': {
            readonly type: "album";
            readonly title: "IGOR";
        };
    };
    headers: {
        [header: string]: string;
    };
    arl?: string;
    apiToken?: string;
    licenseToken?: string;
    country?: string;
    language?: string;
    dispatcher?: Dispatcher | undefined;
    availableFormats: Set<DeezerFormat>;
    constructor(options?: DeezerOptions);
    login(username: string, password: string): Promise<void>;
    search(query: string, limit: number): Promise<SearchResults>;
    getTypeFromUrl(url: string): Promise<ItemType>;
    getByUrl(url: string): Promise<GetByUrlResponse>;
    getAccountInfo(): Promise<StreamerAccount>;
    isrcLookup(isrc: string): Promise<Track>;
}
export {};
