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
var _Qobuz_instances, _Qobuz_get, _Qobuz_createSignature, _Qobuz_getSigned, _Qobuz_getFileUrl, _Qobuz_getTrackMetadata, _Qobuz_getAlbum, _Qobuz_getArtistMetadata, _Qobuz_getPlaylist, _Qobuz_getUrlParts;
import crypto from 'crypto';
import { fetch } from 'undici';
import { DEFAULT_HEADERS } from './constants.js';
import { parseAlbum, parseTrack, parseArtist, parsePlaylist } from './parse.js';
import { Readable } from 'stream';
function headers(token) {
    const headers = DEFAULT_HEADERS;
    if (token)
        headers['X-User-Auth-Token'] = token;
    return headers;
}
function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
class Qobuz {
    constructor(options) {
        _Qobuz_instances.add(this);
        this.hostnames = ['play.qobuz.com', 'open.qobuz.com', 'www.qobuz.com', 'qobuz.com'];
        this.testData = {
            'https://www.qobuz.com/us-en/interpreter/tyler-the-creator/589771': {
                title: 'Tyler, The Creator',
                type: 'artist'
            },
            'https://www.qobuz.com/us-en/album/igor-tyler-the-creator/qtz65tw2of0ha': {
                title: 'IGOR',
                type: 'album'
            }
        };
        this.appSecret = options.appSecret;
        this.appId = options.appId;
        if (options.token)
            this.token = options.token;
        if (options.dispatcher)
            this.dispatcher = options.dispatcher;
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token) {
                const params = {
                    username,
                    password: md5(password),
                    extra: 'partner',
                    app_id: this.appId
                };
                const loginResponse = yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getSigned).call(this, 'user/login', params);
                this.token = loginResponse.user_auth_token;
            }
        });
    }
    search(query, limit = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token)
                throw new Error('Not logged in.');
            const resultResponse = (yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_get).call(this, 'catalog/search', { query, limit, app_id: this.appId }));
            return {
                query: resultResponse.query,
                albums: resultResponse.albums.items.map(parseAlbum),
                tracks: resultResponse.tracks.items.map(parseTrack),
                artists: resultResponse.artists.items.map(parseArtist)
            };
        });
    }
    getTypeFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getUrlParts).call(this, url)[0];
        });
    }
    getByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const [type, id] = __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getUrlParts).call(this, url);
            switch (type) {
                case 'track': {
                    return {
                        type,
                        getStream: () => {
                            return __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getFileUrl).call(this, id);
                        },
                        metadata: yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getTrackMetadata).call(this, id)
                    };
                }
                case 'album': {
                    const album = yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getAlbum).call(this, id);
                    return {
                        type,
                        tracks: album.tracks,
                        metadata: album.metadata
                    };
                }
                case 'artist': {
                    return {
                        type,
                        metadata: yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getArtistMetadata).call(this, id)
                    };
                }
                case 'playlist': {
                    return yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getPlaylist).call(this, id);
                }
                default:
                    throw new Error('URL unrecognised');
            }
        });
    }
    getAccountInfo() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const loginResponse = yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getSigned).call(this, 'user/login', {
                extra: 'partner',
                device_manufacturer_id: 'undefined',
                app_id: this.appId
            });
            return {
                valid: true,
                premium: ((_c = (_b = (_a = loginResponse.user) === null || _a === void 0 ? void 0 : _a.credential) === null || _b === void 0 ? void 0 : _b.parameters) === null || _c === void 0 ? void 0 : _c.hires_streaming) ||
                    loginResponse.user.subscription.offer == 'studio',
                country: loginResponse.user.country,
                explicit: true
            };
        });
    }
    isrcLookup(isrc) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const isrcUrl = (_b = (_a = (yield this.search(isrc)).tracks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url;
            if (!isrcUrl)
                throw new Error(`Not available on Qobuz.`);
            else {
                const track = (yield this.getByUrl(isrcUrl)).metadata;
                return track;
            }
        });
    }
}
_Qobuz_instances = new WeakSet(), _Qobuz_get = function _Qobuz_get(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const key in params) {
            if (typeof params[key] == 'number')
                params[key] = params[key].toString();
        }
        const response = yield fetch(`https://www.qobuz.com/api.json/0.2/${url}?${new URLSearchParams(params)}`, {
            method: 'get',
            headers: headers(this.token),
            dispatcher: this.dispatcher
        });
        if (!response.ok) {
            const errMsg = yield response.text();
            try {
                console.error('Qobuz error response:', JSON.parse(errMsg));
            }
            catch (error) {
                console.error('Qobuz error response:', errMsg);
            }
            throw new Error(`Fetching ${url} from Qobuz failed with status code ${response.status}.`);
        }
        return yield response.json();
    });
}, _Qobuz_createSignature = function _Qobuz_createSignature(path, params) {
    if (!this.appSecret)
        throw new Error('appSecret not specified');
    const timestamp = Math.floor(Date.now() / 1000);
    let toHash = path.replace(/\//g, '');
    for (const key of Object.keys(params).sort()) {
        if (key != 'app_id' && key != 'user_auth_token') {
            toHash += key + params[key];
        }
    }
    toHash += timestamp + this.appSecret;
    return {
        timestamp,
        hash: md5(toHash)
    };
}, _Qobuz_getSigned = function _Qobuz_getSigned(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const signature = __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_createSignature).call(this, url, params);
        params.request_ts = signature.timestamp.toString();
        params.request_sig = signature.hash;
        return yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_get).call(this, url, params);
    });
}, _Qobuz_getFileUrl = function _Qobuz_getFileUrl(trackId, qualityId = 27) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.token)
            throw new Error('Not logged in.');
        const params = {
            track_id: trackId.toString(),
            format_id: qualityId.toString(),
            intent: 'stream',
            sample: 'false',
            app_id: this.appId,
            user_auth_token: this.token
        };
        const trackFileResponse = (yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_getSigned).call(this, 'track/getFileUrl', params));
        
        if (trackFileResponse.sample == true)
            throw new Error(`Could not get non-sample file. Make sure the track isn't purchase-only.`);

        return {
            trackUrl: trackFileResponse.url
        }
        // const streamResponse = yield fetch(trackFileResponse.url, { dispatcher: this.dispatcher });
        // return {
        //     mimeType: trackFileResponse.mime_type,
        //     sizeBytes: parseInt(streamResponse.headers.get('Content-Length')),
        //     stream: Readable.fromWeb(streamResponse.body)
        // };
    });
}, _Qobuz_getTrackMetadata = function _Qobuz_getTrackMetadata(trackId) {
    return __awaiter(this, void 0, void 0, function* () {
        return parseTrack(yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_get).call(this, 'track/get', {
            track_id: trackId,
            app_id: this.appId
        }));
    });
}, _Qobuz_getAlbum = function _Qobuz_getAlbum(albumId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const albumResponse = yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_get).call(this, 'album/get', {
            album_id: albumId,
            extra: 'albumsFromSameArtist,focusAll',
            app_id: this.appId
        });
        return {
            type: 'album',
            metadata: Object.assign(Object.assign({}, parseAlbum(albumResponse)), { trackCount: (_a = albumResponse.tracks) === null || _a === void 0 ? void 0 : _a.items.length }),
            tracks: (_b = albumResponse.tracks) === null || _b === void 0 ? void 0 : _b.items.map(parseTrack)
        };
    });
}, _Qobuz_getArtistMetadata = function _Qobuz_getArtistMetadata(artistId) {
    return __awaiter(this, void 0, void 0, function* () {
        return parseArtist(yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_get).call(this, 'artist/get', {
            artist_id: artistId,
            extra: 'albums,playlists,tracks_appears_on,albums_with_last_release,focusAll',
            limit: 100,
            offset: 0,
            app_id: this.appId
        }));
    });
}, _Qobuz_getPlaylist = function _Qobuz_getPlaylist(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const init = yield __classPrivateFieldGet(this, _Qobuz_instances, "m", _Qobuz_get).call(this, 'playlist/get', {
            playlist_id: id,
            extra: 'tracks,getSimilarPlaylists',
            offset: 0,
            limit: 1000,
            app_id: this.appId
        });
        if (init.tracks_count > 1000)
            throw new Error('To be added, playlists with over a thousand tracks.');
        else
            return parsePlaylist(init);
    });
}, _Qobuz_getUrlParts = function _Qobuz_getUrlParts(url) {
    var _a, _b;
    const urlObj = new URL(url);
    if (urlObj.hostname == 'www.qobuz.com' || urlObj.hostname == 'qobuz.com') {
        const urlParts = (_a = url
            .match(/^https?:\/\/(?:www\.)?qobuz\.com\/[a-z]{2}-[a-z]{2}\/(.*?)\/.*?\/(.*?)$/)) === null || _a === void 0 ? void 0 : _a.slice(1, 3);
        if (!urlParts)
            throw new Error('URL not supported');
        urlParts[1] = urlParts[1].replace(/\?.*?$/, '');
        const [type, id] = urlParts;
        switch (type) {
            case 'interpreter':
                return ['artist', id];
            case 'album':
            case 'track':
                return [type, id];
            case 'playlists':
                return ['playlist', id];
            default:
                throw new Error('URL unrecognised');
        }
    }
    const urlParts = (_b = url
        .match(/^https:\/\/(?:play|open)\.qobuz\.com\/(.*?)\/([^/]*?)\/?$/)) === null || _b === void 0 ? void 0 : _b.slice(1, 3);
    if (!urlParts)
        throw new Error('URL not supported');
    urlParts[1] = urlParts[1].replace(/\?.*?$/, '');
    if (urlParts[0] != 'artist' &&
        urlParts[0] != 'album' &&
        urlParts[0] != 'track' &&
        urlParts[0] != 'playlist') {
        throw new Error('URL unrecognised');
    }
    return [urlParts[0], urlParts[1]];
};
export default Qobuz;
//# sourceMappingURL=main.js.map