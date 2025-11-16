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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _Tidal_instances, _Tidal_get, _Tidal_getTrack, _Tidal_getAlbum, _Tidal_getAlbumTracks, _Tidal_getPlaylist, _Tidal_getPlaylistTracks, _Tidal_getArtist, _Tidal_getFileUrl, _Tidal_getFfArgs, _Tidal_getUrlParts;
import { fetch } from 'undici';
import { spawn } from 'child_process';
import os from 'node:os';
import fs from 'node:fs';
import { TIDAL_AUTH_BASE, TIDAL_API_BASE, TIDAL_SUBSCRIPTION_BASE } from './constants.js';
import { addCredits, parseAlbum, parseArtist, parseMpd, parsePlaylist, parseTrack } from './parse.js';
import Stream, { Readable } from 'stream';
class Tidal {
    constructor(options) {
        _Tidal_instances.add(this);
        this.hostnames = ['tidal.com', 'www.tidal.com', 'listen.tidal.com'];
        this.testData = {
            'https://tidal.com/browse/artist/3908662': {
                type: 'artist',
                title: 'Tyler, The Creator'
            },
            'https://tidal.com/browse/album/109485854': {
                type: 'album',
                title: 'IGOR'
            },
            'https://tidal.com/browse/track/95691774': {
                type: 'track',
                title: 'Potato Salad'
            }
        };
        this.failedAuth = false;
        this.tvToken = options.tvToken;
        this.tvSecret = options.tvSecret;
        // TODO: ideally this should be stored in a .config file
        this.accessToken = options.accessToken;
        this.refreshToken = options.refreshToken;
        this.expires = options.expires;
        this.countryCode = options.countryCode;
        if (options.dispatcher)
            this.dispatcher = options.dispatcher;
    }
    headers() {
        return {
            'X-Tidal-Token': this.tvToken,
            Authorization: `Bearer ${this.accessToken}`,
            'Accept-Encoding': 'gzip',
            'User-Agent': 'TIDAL_ANDROID/1039 okhttp/3.14.9'
        };
    }
    isrcLookup(isrc) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const isrcQuery = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, 'tracks', { isrc });
            if ((_a = isrcQuery === null || isrcQuery === void 0 ? void 0 : isrcQuery.items) === null || _a === void 0 ? void 0 : _a[0])
                return (yield this.getByUrl(isrcQuery.items[0].url)).metadata;
            else
                throw new Error(`Not available on Tidal.`);
        });
    }
    sessionValid() {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch('https://api.tidal.com/v1/sessions', {
                headers: this.headers(),
                dispatcher: this.dispatcher
            });
            return resp.ok;
        });
    }
    getCountryCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionResponse = yield fetch('https://api.tidal.com/v1/sessions', {
                headers: this.headers(),
                dispatcher: this.dispatcher
            });
            if (sessionResponse.status != 200)
                return false;
            const sessionData = yield sessionResponse.json();
            this.countryCode = sessionData.countryCode;
            this.userId = sessionData.userId;
            return true;
        });
    }
    getTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceAuthResponse = yield fetch(`${TIDAL_AUTH_BASE}oauth2/device_authorization`, {
                method: 'post',
                body: new URLSearchParams({
                    client_id: this.tvToken,
                    scope: 'r_usr w_usr'
                }),
                dispatcher: this.dispatcher
            });
            if (deviceAuthResponse.status != 200)
                throw new Error(`Couldn't authorize Tidal`);
            const deviceAuth = yield deviceAuthResponse.json();
            const linkUrl = `https://link.tidal.com/${deviceAuth.userCode}`;
            const checkToken = () => __awaiter(this, void 0, void 0, function* () {
                const params = {
                    client_id: this.tvToken,
                    client_secret: this.tvSecret,
                    device_code: deviceAuth.deviceCode,
                    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    scope: 'r_usr w_usr'
                };
                let loginData = null;
                let statusCode = 400;
                while (statusCode == 400) {
                    yield new Promise((r) => setTimeout(r, 1000));
                    const loginResponse = yield fetch(`${TIDAL_AUTH_BASE}oauth2/token`, {
                        method: 'post',
                        body: new URLSearchParams(params),
                        dispatcher: this.dispatcher
                    });
                    statusCode = loginResponse.status;
                    loginData = (yield loginResponse.json());
                }
                if (statusCode != 200 || !loginData)
                    throw new Error(`Failed to log in. ${loginData === null || loginData === void 0 ? void 0 : loginData.error}`);
                this.accessToken = loginData.access_token;
                this.refreshToken = loginData.refresh_token;
                this.expires = Date.now() + loginData.expires_in * 1000;
                yield this.getCountryCode();
                console.log('[tidal] Using the following new config:', this.getCurrentConfig());
            });
            console.log(`[tidal] Log in at ${linkUrl}`);
            checkToken();
            return linkUrl;
        });
    }
    getCurrentConfig() {
        return {
            tvToken: this.tvToken,
            tvSecret: this.tvSecret,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            expires: this.expires,
            countryCode: this.countryCode
        };
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshResponse = yield fetch(`${TIDAL_AUTH_BASE}oauth2/token`, {
                method: 'post',
                body: new URLSearchParams({
                    refresh_token: this.refreshToken,
                    client_id: this.tvToken,
                    client_secret: this.tvSecret,
                    grant_type: 'refresh_token'
                }),
                dispatcher: this.dispatcher
            });
            if (refreshResponse.status == 200) {
                const refreshData = yield refreshResponse.json();
                this.expires = Date.now() + refreshData.expires_in * 1000;
                this.accessToken = refreshData.access_token;
                if (refreshData.refresh_token)
                    this.refreshToken = refreshData.refresh_token;
                return true;
            }
            return false;
        });
    }
    search(query, limit = 20) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, 'search/top-hits', {
                query: query,
                limit: limit,
                offset: 0,
                types: 'ARTISTS,ALBUMS,TRACKS',
                includeContributors: 'true',
                includeUserPlaylists: 'true',
                supportsUserData: 'true'
            });
            return {
                query,
                albums: results.albums.items.map((raw) => parseAlbum(raw)),
                artists: results.artists.items.map(parseArtist),
                tracks: results.tracks.items.map(parseTrack)
            };
        });
    }
    getTypeFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getUrlParts).call(this, url)[0];
        });
    }
    getByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const [type, id] = __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getUrlParts).call(this, url);
            switch (type) {
                case 'track':
                    return {
                        type,
                        getStream: () => {
                            return __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getFileUrl).call(this, id);
                        },
                        metadata: yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getTrack).call(this, id)
                    };
                case 'album':
                    // eslint-disable-next-line no-case-declarations
                    const tracks = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getAlbumTracks).call(this, id);
                    return {
                        type,
                        tracks: tracks,
                        metadata: Object.assign(Object.assign({}, (yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getAlbum).call(this, id))), { trackCount: tracks.length })
                    };
                case 'artist':
                    return {
                        type,
                        metadata: yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getArtist).call(this, id)
                    };
                case 'playlist':
                    return {
                        type,
                        tracks: yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getPlaylistTracks).call(this, id),
                        metadata: yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getPlaylist).call(this, id)
                    };
            }
        });
    }
    getAccountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userId == undefined || this.countryCode == undefined) {
                if (Date.now() > this.expires)
                    yield this.refresh();
                const sessionResponse = yield fetch('https://api.tidal.com/v1/sessions', {
                    headers: this.headers(),
                    dispatcher: this.dispatcher
                });
                const sessionData = yield sessionResponse.json();
                this.userId = sessionData.userId;
                this.countryCode = sessionData.countryCode;
            }
            const subscription = (yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `users/${this.userId}/subscription`, {}, TIDAL_SUBSCRIPTION_BASE));
            return {
                valid: true,
                premium: subscription.premiumAccess,
                country: this.countryCode,
                explicit: true
            };
        });
    }
}
_Tidal_instances = new WeakSet(), _Tidal_get = function _Tidal_get(url, params = {}, base = TIDAL_API_BASE) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        if (this.failedAuth)
            throw new Error(`Last request failed to authorize, get new tokens`);
        if (Date.now() > this.expires)
            yield this.refresh();
        if (!this.countryCode)
            yield this.getCountryCode();
        params.countryCode = (_a = params.countryCode) !== null && _a !== void 0 ? _a : this.countryCode;
        params.locale = (_b = params.locale) !== null && _b !== void 0 ? _b : 'en_US';
        params.deviceType = (_c = params.deviceType) !== null && _c !== void 0 ? _c : 'TV';
        for (const key in params) {
            if (typeof params[key] == 'number')
                params[key] = params[key].toString();
        }
        const response = yield fetch(`${base}${url}?${new URLSearchParams(params)}`, {
            headers: this.headers(),
            dispatcher: this.dispatcher
        });
        if (!response.ok) {
            const errMsg = yield response.text();
            try {
                const json = JSON.parse(errMsg);
                const sessionValid = yield this.sessionValid();
                if (json.status == 401 && !sessionValid) {
                    this.failedAuth = !(yield this.refresh());
                    console.log('[tidal] Refreshed tokens');
                    if (this.failedAuth) {
                        throw new Error('Auth failed. Try getting new tokens.');
                    }
                    return __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, url, params);
                }
                console.error('[tidal] Tidal error response:', json);
            }
            catch (error) {
                console.error('[tidal] Tidal error response:', errMsg);
            }
            throw new Error(`Fetching ${url} from Tidal failed with status code ${response.status}.`);
        }
        return yield response.json();
    });
}, _Tidal_getTrack = function _Tidal_getTrack(trackId) {
    return __awaiter(this, void 0, void 0, function* () {
        const trackResponse = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `tracks/${trackId}`);
        const contributorResponse = (yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `tracks/${trackId}/contributors`)).items;
        trackResponse.album = (yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `albums/${trackResponse.album.id}`));
        return parseTrack(addCredits(trackResponse, contributorResponse));
    });
}, _Tidal_getAlbum = function _Tidal_getAlbum(albumId) {
    return __awaiter(this, void 0, void 0, function* () {
        const albumResponse = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `albums/${albumId}`);
        return parseAlbum(albumResponse);
    });
}, _Tidal_getAlbumTracks = function _Tidal_getAlbumTracks(albumId) {
    return __awaiter(this, void 0, void 0, function* () {
        const contributorResponse = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `albums/${albumId}/items/credits`, {
            replace: 'true',
            offset: 0,
            includeContributors: 'true',
            limit: 100
        });
        return contributorResponse.items.map((item) => parseTrack(addCredits(item.item, item.credits)));
    });
}, _Tidal_getPlaylist = function _Tidal_getPlaylist(playlistId) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlistResponse = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `playlists/${playlistId}`);
        return parsePlaylist(playlistResponse);
    });
}, _Tidal_getPlaylistTracks = function _Tidal_getPlaylistTracks(playlistId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tracksResponse = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `playlists/${playlistId}/tracks`, {
            offset: 0,
            limit: 10000
        });
        return tracksResponse.items.map((item) => parseTrack(item));
    });
}, _Tidal_getArtist = function _Tidal_getArtist(artistId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [artistResponse, albumsResponse, tracksResponse] = yield Promise.all([
            __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `artists/${artistId}`),
            __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `artists/${artistId}/albums`, {
                limit: 20
            }),
            __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `artists/${artistId}/toptracks`, {
                limit: 20
            })
        ]);
        return Object.assign(Object.assign({}, parseArtist(artistResponse)), { albums: albumsResponse.items.map(parseAlbum), tracks: tracksResponse.items.map(parseTrack) });
    });
}, _Tidal_getFileUrl = function _Tidal_getFileUrl(trackId, quality = 'HI_RES_LOSSLESS') {
    return __awaiter(this, void 0, void 0, function* () {
        const playbackInfoResponse = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_get).call(this, `tracks/${trackId}/playbackinfopostpaywall/v4`, {
            playbackmode: 'STREAM',
            assetpresentation: 'FULL',
            audioquality: quality,
            prefetch: 'false'
        });
        const manifestStr = Buffer.from(playbackInfoResponse.manifest, 'base64').toString('utf-8');
        if (playbackInfoResponse.manifestMimeType != 'application/dash+xml') {
            const manifest = JSON.parse(manifestStr);
            const streamResponse = yield fetch(manifest.urls[0], { dispatcher: this.dispatcher });
            return {
                mimeType: manifest.mimeType,
                sizeBytes: parseInt(streamResponse.headers.get('Content-Length')),
                stream: Readable.fromWeb(streamResponse.body)
            };
        }
        const trackUrls = parseMpd(manifestStr);
        const args = yield __classPrivateFieldGet(this, _Tidal_instances, "m", _Tidal_getFfArgs).call(this, playbackInfoResponse.audioQuality);
        const ffmpegProc = spawn('ffmpeg', args);
        switch (playbackInfoResponse.audioQuality) {
            case 'LOW':
            case 'HIGH': {
                return new Promise(function (resolve, reject) {
                    const stream = new Stream.Readable({
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        read() { }
                    });
                    function load() {
                        var _a, e_1, _b, _c;
                        return __awaiter(this, void 0, void 0, function* () {
                            for (const url of trackUrls) {
                                const resp = yield fetch(url);
                                if (!resp.body)
                                    throw new Error('Response has no body');
                                try {
                                    for (var _d = true, _e = (e_1 = void 0, __asyncValues(resp.body)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                                        _c = _f.value;
                                        _d = false;
                                        const chunk = _c;
                                        stream.push(chunk);
                                    }
                                }
                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                finally {
                                    try {
                                        if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                }
                            }
                            stream.push(null);
                        });
                    }
                    stream.pipe(ffmpegProc.stdin);
                    let err;
                    ffmpegProc.stderr.on('data', function (data) {
                        err = data.toString();
                    });
                    load();
                    ffmpegProc.once('exit', function (code) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const folder = args[args.length - 1]
                                .split('/')
                                .slice(0, args[args.length - 1].split('/').length - 1)
                                .join('/');
                            if (code == 0)
                                resolve({
                                    mimeType: 'audio/mp4',
                                    stream: fs.createReadStream(args[args.length - 1]).once('end', function () {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            yield fs.promises.rm(folder, { recursive: true });
                                        });
                                    })
                                });
                            else {
                                reject(`FFMPEG error: ${err}` || 'FFMPEG could not handle the file.');
                                yield fs.promises.rm(folder, { recursive: true });
                            }
                        });
                    });
                });
            }
            default: {
                const stream = new Stream.Readable({
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    read() { }
                });
                // eslint-disable-next-line no-inner-declarations
                function load() {
                    var _a, e_2, _b, _c;
                    return __awaiter(this, void 0, void 0, function* () {
                        for (const url of trackUrls) {
                            const resp = yield fetch(url);
                            if (!resp.body)
                                throw new Error('Response has no body');
                            try {
                                for (var _d = true, _e = (e_2 = void 0, __asyncValues(resp.body)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                                    _c = _f.value;
                                    _d = false;
                                    const chunk = _c;
                                    stream.push(chunk);
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                        }
                        stream.push(null);
                    });
                }
                stream.pipe(ffmpegProc.stdin);
                load();
                return {
                    mimeType: 'audio/flac',
                    stream: ffmpegProc.stdout
                };
            }
        }
    });
}, _Tidal_getFfArgs = function _Tidal_getFfArgs(audioQuality) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (audioQuality) {
            case 'LOW':
            case 'HIGH':
                // eslint-disable-next-line no-case-declarations
                const folder = yield fs.promises.mkdtemp(`${os.tmpdir()}/lucida`);
                return [
                    '-hide_banner',
                    '-loglevel',
                    'error',
                    '-i',
                    '-',
                    '-c:a',
                    'copy',
                    '-y',
                    `${folder}/data.m4a`
                ];
            default:
                return ['-hide_banner', '-loglevel', 'error', '-i', '-', '-c:a', 'copy', '-f', 'flac', '-'];
        }
    });
}, _Tidal_getUrlParts = function _Tidal_getUrlParts(url) {
    var _a;
    const urlParts = (_a = url
        .match(/^https?:\/\/(?:www\.|listen\.)?tidal\.com\/(?:browse\/)?(.*?)\/(.*?)\/?$/)) === null || _a === void 0 ? void 0 : _a.slice(1, 3);
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
export default Tidal;
//# sourceMappingURL=main.js.map