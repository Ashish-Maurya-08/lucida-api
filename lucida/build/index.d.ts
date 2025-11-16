import { ItemType, GetByUrlResponse, SearchResults, Streamer, StreamerWithLogin, StreamerAccount } from './types.js';
export interface LucidaOptions {
    modules: {
        [key: string]: Streamer | StreamerWithLogin;
    };
    logins?: {
        [key: string]: {
            username: string;
            password: string;
        };
    };
}
declare class Lucida {
    modules: {
        [key: string]: Streamer | StreamerWithLogin;
    };
    hostnames: string[];
    logins?: {
        [key: string]: {
            username: string;
            password: string;
        };
    };
    constructor(options: LucidaOptions);
    login(ignoreFailures?: boolean): Promise<void>;
    search(query: string, limit: number): Promise<{
        [key: string]: SearchResults;
    }>;
    checkAccounts(): Promise<{
        [key: string]: StreamerAccount;
    }>;
    getTypeFromUrl(url: string): Promise<ItemType>;
    getByUrl(url: string, limit?: number): Promise<GetByUrlResponse>;
    disconnect(): Promise<(void | undefined)[]>;
    isrcLookup(isrc: string): Promise<{
        [k: string]: import("./types.js").Track | undefined;
    }>;
}
export default Lucida;
