var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Spotify_instances, _Spotify_getUrlParts;
import Librespot from 'librespot';
import { parseArtist, parseAlbum, parseTrack, parseEpisode, parsePodcast, parsePlaylist } from './parse.js';
class Spotify {
    constructor(options) {
        _Spotify_instances.add(this);
        this.hostnames = ['open.spotify.com'];
        this.testData = {
            'https://open.spotify.com/track/1jzIJcHCXneHw7ojC6LXiF': {
                type: 'track',
                title: 'Potato Salad'
            },
            'https://open.spotify.com/album/5zi7WsKlIiUXv09tbGLKsE': {
                type: 'album',
                title: 'IGOR'
            },
            'https://open.spotify.com/artist/4V8LLVI7PbaPR0K2TGSxFF': {
                type: 'artist',
                title: 'Tyler, The Creator'
            }
        };
        this.client = new Librespot(options);
        const { username, storedCredential } = options;
        this.username = username;
        this.storedCredential = storedCredential;
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.username && this.storedCredential)
                return yield this.client.loginWithStoredCreds(this.username, this.storedCredential);
            else
                return yield this.client.login(username, password);
        });
    }
    getStoredCredentials() {
        return this.client.getStoredCredentials();
    }
    getTypeFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let type = __classPrivateFieldGet(this, _Spotify_instances, "m", _Spotify_getUrlParts).call(this, url)[0];
            if (type == 'show')
                type = 'podcast';
            return type;
        });
    }
    getByUrl(url, limit = 0) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const [type, id] = __classPrivateFieldGet(this, _Spotify_instances, "m", _Spotify_getUrlParts).call(this, url);
            switch (type) {
                case 'track': {
                    const metadata = yield this.client.get.trackMetadata(id);
                    return {
                        type,
                        getStream: () => __awaiter(this, void 0, void 0, function* () {
                            const streamData = yield this.client.get.trackStream(id);
                            return {
                                mimeType: 'audio/ogg',
                                sizeBytes: streamData.sizeBytes,
                                stream: streamData.stream
                            };
                        }),
                        metadata: parseTrack(metadata)
                    };
                }
                case 'artist': {
                    const metadata = yield this.client.get.artistMetadata(id);
                    const albums = yield this.client.get.artistAlbums(id, limit);
                    return {
                        type,
                        metadata: Object.assign(Object.assign({}, parseArtist(metadata)), { albums: albums.map((e) => parseAlbum(e)) })
                    };
                }
                case 'album': {
                    const metadata = yield this.client.get.albumMetadata(id);
                    const tracks = yield this.client.get.albumTracks(id);
                    if (tracks) {
                        return {
                            type,
                            metadata: Object.assign(Object.assign({}, parseAlbum(metadata)), { trackCount: tracks.length }),
                            tracks: (_a = tracks === null || tracks === void 0 ? void 0 : tracks.map((e) => parseTrack(e))) !== null && _a !== void 0 ? _a : []
                        };
                    }
                    return {
                        type,
                        metadata: parseAlbum(metadata),
                        tracks: []
                    };
                }
                case 'episode': {
                    const metadata = yield this.client.get.episodeMetadata(id);
                    return {
                        type,
                        getStream: () => __awaiter(this, void 0, void 0, function* () {
                            const streamData = yield this.client.get.episodeStream(id);
                            return {
                                mimeType: 'audio/ogg',
                                sizeBytes: streamData.sizeBytes,
                                stream: streamData.stream
                            };
                        }),
                        metadata: parseEpisode(metadata)
                    };
                }
                case 'show': {
                    const metadata = yield this.client.get.podcastMetadata(id);
                    return {
                        type: 'podcast',
                        metadata: parsePodcast(metadata),
                        episodes: (_c = (_b = metadata.episodes) === null || _b === void 0 ? void 0 : _b.map((e) => parseEpisode(e))) !== null && _c !== void 0 ? _c : []
                    };
                }
                case 'playlist': {
                    const metadata = yield this.client.get.playlist(id);
                    return {
                        type: 'playlist',
                        metadata: parsePlaylist(metadata),
                        tracks: (_e = (_d = metadata.tracks) === null || _d === void 0 ? void 0 : _d.map((e) => parseTrack(e))) !== null && _e !== void 0 ? _e : []
                    };
                }
            }
        });
    }
    search(query) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.client.browse.search(query);
            return {
                query,
                albums: (_b = (_a = results.albums) === null || _a === void 0 ? void 0 : _a.map((e) => parseAlbum(e))) !== null && _b !== void 0 ? _b : [],
                artists: (_d = (_c = results.artists) === null || _c === void 0 ? void 0 : _c.map((e) => parseArtist(e))) !== null && _d !== void 0 ? _d : [],
                tracks: (_f = (_e = results.tracks) === null || _e === void 0 ? void 0 : _e.map((e) => parseTrack(e))) !== null && _f !== void 0 ? _f : []
            };
        });
    }
    isrcLookup(isrc) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.search(`isrc:${isrc}`);
            if (results === null || results === void 0 ? void 0 : results.tracks[0])
                return (yield this.getByUrl((_b = (_a = results.tracks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url)).metadata;
            else
                throw new Error(`Not available on Spotify.`);
        });
    }
    getAccountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.client.get.me();
            let premium;
            if (info.plan == 'premium')
                premium = true;
            else
                premium = false;
            return {
                valid: true,
                premium,
                country: info.country,
                explicit: info.allowExplicit
            };
        });
    }
}
_Spotify_instances = new WeakSet(), _Spotify_getUrlParts = function _Spotify_getUrlParts(url) {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.slice(1).split('/');
    if (parts.length > 2)
        throw new Error('Unknown Spotify URL');
    if (parts[0] != 'artist' &&
        parts[0] != 'track' &&
        parts[0] != 'album' &&
        parts[0] != 'show' &&
        parts[0] != 'episode' &&
        parts[0] != 'playlist') {
        throw new Error(`Spotify type "${parts[0]}" unsupported`);
    }
    if (!parts[1])
        throw new Error('Unknown Spotify URL');
    return [parts[0], parts[1]];
};
export default Spotify;
//# sourceMappingURL=main.js.map