import { Dispatcher } from 'undici';
import { ItemType, StreamerWithLogin, SearchResults, GetByUrlResponse, Track, StreamerAccount } from '../../types.js';
interface QobuzOptions {
    appSecret: string;
    appId: string;
    token?: string;
    dispatcher?: Dispatcher;
}
export default class Qobuz implements StreamerWithLogin {
    #private;
    hostnames: string[];
    testData: {
        readonly 'https://www.qobuz.com/us-en/interpreter/tyler-the-creator/589771': {
            readonly title: "Tyler, The Creator";
            readonly type: "artist";
        };
        readonly 'https://www.qobuz.com/us-en/album/igor-tyler-the-creator/qtz65tw2of0ha': {
            readonly title: "IGOR";
            readonly type: "album";
        };
    };
    token?: string;
    appSecret: string;
    appId: string;
    dispatcher: Dispatcher | undefined;
    fetch?(url: URL | RequestInfo, init?: RequestInit): Promise<Response>;
    constructor(options: QobuzOptions);
    login(username: string, password: string): Promise<void>;
    search(query: string, limit?: number): Promise<SearchResults>;
    getTypeFromUrl(url: string): Promise<ItemType>;
    getByUrl(url: string): Promise<GetByUrlResponse>;
    getAccountInfo(): Promise<StreamerAccount>;
    isrcLookup(isrc: string): Promise<Track>;
}
export {};
