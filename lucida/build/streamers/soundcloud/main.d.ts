import { Dispatcher } from 'undici';
import { ItemType, Streamer, SearchResults, GetByUrlResponse, StreamerAccount } from '../../types.js';
import { ScClient } from './parse.js';
interface SoundcloudOptions {
    oauthToken?: string;
    dispatcher: Dispatcher | undefined;
}
export default class Soundcloud implements Streamer {
    #private;
    hostnames: string[];
    testData: {
        readonly 'https://soundcloud.com/saoirsedream/charlikartlanparty': {
            readonly type: "track";
            readonly title: "Charli Kart LAN Party";
        };
        readonly 'https://soundcloud.com/saoirsedream/sets/star': {
            readonly type: "album";
            readonly title: "star★☆";
        };
    };
    oauthToken?: string;
    client?: ScClient;
    dispatcher: Dispatcher | undefined;
    constructor(options: SoundcloudOptions);
    search(query: string, limit?: number): Promise<SearchResults>;
    getTypeFromUrl(url: string): Promise<ItemType>;
    getByUrl(url: string): Promise<GetByUrlResponse>;
    getAccountInfo(): Promise<StreamerAccount>;
}
export {};
