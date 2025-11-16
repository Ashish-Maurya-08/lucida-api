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
var _Soundcloud_instances, _Soundcloud_getClient, _Soundcloud_formatURL, _Soundcloud_getMetadata, _Soundcloud_getRawTrackInfo;
import { fetch } from 'undici';
import { DEFAULT_HEADERS } from './constants.js';
import { parseAlbum, parseTrack, parseArtist, parseHls } from './parse.js';
import { Readable } from 'stream';
function headers(oauthToken) {
    const headers = DEFAULT_HEADERS;
    if (oauthToken)
        headers['Authorization'] = 'OAuth ' + oauthToken;
    return headers;
}
class Soundcloud {
    constructor(options) {
        _Soundcloud_instances.add(this);
        this.hostnames = ['soundcloud.com', 'm.soundcloud.com', 'www.soundcloud.com', 'on.soundcloud.com'];
        this.testData = {
            'https://soundcloud.com/saoirsedream/charlikartlanparty': {
                type: 'track',
                title: 'Charli Kart LAN Party'
            },
            'https://soundcloud.com/saoirsedream/sets/star': {
                type: 'album',
                title: 'star★☆'
            }
        };
        this.oauthToken = options === null || options === void 0 ? void 0 : options.oauthToken;
        this.dispatcher = options === null || options === void 0 ? void 0 : options.dispatcher;
    }
    search(query, limit = 20) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client || (yield __classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_getClient).call(this));
            const response = yield fetch(__classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_formatURL).call(this, `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(query)}&offset=0&linked_partitioning=1&app_locale=en&limit=${limit}`, client), { method: 'get', headers: headers(this.oauthToken), dispatcher: this.dispatcher });
            if (!response.ok) {
                const errMsg = yield response.text();
                try {
                    throw new Error(JSON.parse(errMsg));
                }
                catch (error) {
                    if (errMsg)
                        throw new Error(errMsg);
                    else
                        throw new Error('Soundcloud request failed. Try removing the OAuth token, if added.');
                }
            }
            const resultResponse = yield response.json();
            const items = {
                query,
                albums: [],
                tracks: [],
                artists: []
            };
            for (const i in resultResponse.collection) {
                if (resultResponse.collection[i].kind == 'track')
                    items.tracks.push(yield parseTrack(resultResponse.collection[i]));
                else if (resultResponse.collection[i].kind == 'playlist')
                    items.albums.push(yield parseAlbum(resultResponse.collection[i]));
                else if (resultResponse.collection[i].kind == 'user')
                    items.artists.push(yield parseArtist(resultResponse.collection[i]));
            }
            return items;
        });
    }
    getTypeFromUrl(url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { pathname } = new URL(url);
            if (pathname.split('/').slice(1).length == 1)
                return 'artist';
            else {
                if (((_a = pathname.split('/')) === null || _a === void 0 ? void 0 : _a[2]) == 'sets')
                    return 'album';
                else
                    return 'track';
            }
        });
    }
    getByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hostname } = new URL(url);
            if (hostname == 'on.soundcloud.com')
                url = yield followRedirect(url);
            return yield __classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_getMetadata).call(this, url);
        });
    }
    getAccountInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.oauthToken)
                return { valid: false };
            const client = this.client || (yield __classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_getClient).call(this));
            const response = yield fetch(__classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_formatURL).call(this, `https://api-v2.soundcloud.com/payments/quotations/consumer-subscription`, client), {
                method: 'get',
                headers: headers(this.oauthToken),
                dispatcher: this.dispatcher
            });
            if (response.status != 200)
                return { valid: false };
            const subscriptionQuery = yield response.json();
            return {
                valid: true,
                premium: ((_a = subscriptionQuery === null || subscriptionQuery === void 0 ? void 0 : subscriptionQuery.active_subscription) === null || _a === void 0 ? void 0 : _a.state) == 'active',
                explicit: true
            };
        });
    }
}
_Soundcloud_instances = new WeakSet(), _Soundcloud_getClient = function _Soundcloud_getClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (yield fetch(`https://soundcloud.com/`, {
            method: 'get',
            headers: headers(this.oauthToken),
            dispatcher: this.dispatcher
        })).text();
        const client = {
            version: response.split(`__sc_version="`)[1].split(`"</script>`)[0],
            anonId: response.split(`[{"hydratable":"anonymousId","data":"`)[1].split(`"`)[0],
            id: yield fetchKey(response)
        };
        this.client = client;
        return client;
    });
}, _Soundcloud_formatURL = function _Soundcloud_formatURL(og, client) {
    const parsed = new URL(og);
    if (client.anonId && !this.oauthToken)
        parsed.searchParams.append('user_id', client.anonId);
    if (client.id)
        parsed.searchParams.append('client_id', client.id);
    if (client.version)
        parsed.searchParams.append('app_version', client.version);
    if (!parsed.searchParams.get('app_locale'))
        parsed.searchParams.append('app_locale', 'en');
    return parsed.href;
}, _Soundcloud_getMetadata = function _Soundcloud_getMetadata(url) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __awaiter(this, void 0, void 0, function* () {
        // loosely based off: https://github.com/wukko/cobalt/blob/92c0e1d7b7df262fcd82ea7f5cf8c58c6d2ad744/src/modules/processing/services/soundcloud.js
        const type = yield this.getTypeFromUrl(url);
        const client = this.client || (yield __classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_getClient).call(this));
        url = url.replace('//m.', '//');
        // getting the IDs and track authorization
        const html = yield (yield fetch(url, {
            method: 'get',
            headers: headers(this.oauthToken),
            dispatcher: this.dispatcher
        })).text();
        switch (type) {
            case 'track': {
                let trackId = (_c = (_b = (_a = html.split('"soundcloud://sounds:')) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.split('">')) === null || _c === void 0 ? void 0 : _c[0];
                if (!trackId)
                    trackId = (_e = (_d = html
                        .split('content="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F')) === null || _d === void 0 ? void 0 : _d[1]) === null || _e === void 0 ? void 0 : _e.split('%3F')[0];
                if (!trackId)
                    throw new Error('Could not extract track ID.');
                let naked = `https://api-v2.soundcloud.com/tracks/${trackId}`;
                const path = new URL(url).pathname;
                if (path.split('/').length == 4)
                    naked = `${naked}?secret_token=${path.split('/')[3]}`;
                const api = JSON.parse(yield (yield fetch(__classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_formatURL).call(this, naked, client), {
                    method: 'get',
                    headers: headers(this.oauthToken),
                    dispatcher: this.dispatcher
                })).text());
                return {
                    type: 'track',
                    getStream: (hq) => __awaiter(this, void 0, void 0, function* () {
                        if (!hq)
                            hq = false;
                        return yield getStream(hq, api.media.transcodings, api.track_authorization, client, this.oauthToken);
                    }),
                    metadata: yield parseTrack(api)
                };
            }
            case 'album': {
                const data = JSON.parse(html.split(`"hydratable":"playlist","data":`)[1].split(`}];`)[0]);
                const parsed = {
                    type: 'album',
                    metadata: yield parseAlbum(data),
                    tracks: []
                };
                for (const i in data.tracks) {
                    let track = data.tracks[i];
                    if (!track.title)
                        track = yield __classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_getRawTrackInfo).call(this, track.id, client);
                    const parsedTrack = {
                        type: 'track',
                        id: track.id,
                        title: track.title,
                        url: track.permalink_url,
                        artists: [
                            {
                                id: data.user.id,
                                name: data.user.username,
                                url: data.user.permalink_url,
                                pictures: [data.user.avatar_url.replace('-large', '-original')]
                            }
                        ],
                        durationMs: (_h = (_g = (_f = track.media) === null || _f === void 0 ? void 0 : _f.transcodings) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.duration,
                        coverArtwork: (_j = track.artwork_url) === null || _j === void 0 ? void 0 : _j.replace('-large', '-original')
                    };
                    parsed.tracks.push(parsedTrack);
                }
                return parsed;
            }
            case 'artist': {
                const data = JSON.parse(html.split(`{"hydratable":"user","data":`)[1].split(`}];`)[0]);
                return {
                    type: 'artist',
                    metadata: yield parseArtist(data)
                };
            }
            default:
                throw new Error(`Type "${type}" not supported.`);
        }
    });
}, _Soundcloud_getRawTrackInfo = function _Soundcloud_getRawTrackInfo(id, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const api = JSON.parse(yield (yield fetch(__classPrivateFieldGet(this, _Soundcloud_instances, "m", _Soundcloud_formatURL).call(this, `https://api-v2.soundcloud.com/tracks/${id}`, client), {
            method: 'get',
            headers: headers(this.oauthToken),
            dispatcher: this.dispatcher
        })).text());
        return Object.assign(Object.assign({}, api), { id });
    });
};
export default Soundcloud;
function fetchKey(response) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        // loosely based on https://gitlab.com/sylviiu/soundcloud-key-fetch/-/blob/master/index.js
        const keys = response.split(`<script crossorigin src="`);
        let streamKey;
        for (const i in keys) {
            if (typeof streamKey == 'string')
                continue;
            const key = keys[i].split(`"`)[0];
            const keyregex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
            if (!keyregex.test(key))
                continue;
            const script = yield (yield fetch(key)).text();
            if (script.split(`,client_id:"`).length > 1 && !streamKey) {
                streamKey = (_c = (_b = (_a = script.split(`,client_id:"`)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.split(`"`)) === null || _c === void 0 ? void 0 : _c[0];
            }
            else
                continue;
        }
        return streamKey;
    });
}
function getStream(hq, transcodings, trackAuth, client, oauthToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let filter = transcodings.filter((x) => x.quality == 'hq');
        if (hq == true && filter.length == 0)
            throw new Error('Could not find HQ format.');
        if (filter.length == 0)
            filter = transcodings.filter((x) => x.preset.startsWith('aac_')); // prioritize aac (go+)
        if (filter.length == 0)
            filter = transcodings.filter((x) => x.preset.startsWith('mp3_')); // then mp3
        if (filter.length == 0)
            filter = transcodings.filter((x) => x.preset.startsWith('opus_')); // then opus
        if (filter.length == 0)
            throw new Error('Could not find applicable format.'); // and this is just in case none of those exist
        const transcoding = filter[0];
        const streamUrl = new URL(transcoding.url);
        if (client === null || client === void 0 ? void 0 : client.id)
            streamUrl.searchParams.append('client_id', client === null || client === void 0 ? void 0 : client.id);
        streamUrl.searchParams.append('track_authorization', trackAuth);
        const streamUrlResp = yield fetch(streamUrl.toString(), {
            headers: headers(oauthToken)
        });
        const json = yield streamUrlResp.json();
        if (!json.url)
            throw new Error('Stream URL could not be retreieved.');
        if (transcoding.format.protocol == 'progressive') {
            const streamResp = yield fetch(json.url);
            return {
                mimeType: transcoding.format.mime_type,
                sizeBytes: parseInt(streamResp.headers.get('Content-Length')),
                stream: Readable.fromWeb(streamResp.body)
            };
        }
        else {
            let container = transcoding.format.mime_type.split('/')[1].split(';')[0].split('+')[0];
            if (container == 'mpeg')
                container = 'mp3';
            return {
                mimeType: transcoding.format.mime_type,
                stream: yield parseHls(json.url, container)
            };
        }
    });
}
function followRedirect(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url, { redirect: 'manual' });
        const location = res.headers.get('Location');
        if (res.status != 302 || !location)
            throw new Error('URL not supported');
        return location;
    });
}
//# sourceMappingURL=main.js.map