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
var _Deezer_instances, _Deezer_apiCall, _Deezer_loginViaArl, _Deezer_md5, _Deezer_searchArtists, _Deezer_searchAlbums, _Deezer_searchTracks, _Deezer_unshortenUrl, _Deezer_getInfoFromUrl, _Deezer_getArtist, _Deezer_getAlbum, _Deezer_getPlaylist, _Deezer_getTrackPage, _Deezer_getStream, _Deezer_getTrackUrl, _Deezer_getTrackDecryptionKey;
import { fetch } from 'undici';
import { BLOWFISH_SECRET, CLIENT_ID, CLIENT_SECRET, GW_LIGHT_URL } from './constants.js';
import { createHash } from 'crypto';
import { DeezerFormat, parseAlbum, parseArtist, parseTrack, parsePlaylistMetadata } from './parse.js';
import { Readable, Transform } from 'stream';
import { Blowfish } from 'blowfish-cbc';
class Deezer {
    constructor(options) {
        _Deezer_instances.add(this);
        this.hostnames = ['deezer.com', 'www.deezer.com', 'deezer.page.link'];
        this.testData = {
            'https://www.deezer.com/us/artist/1194083': {
                type: 'artist',
                title: 'Tyler, The Creator'
            },
            'https://www.deezer.com/us/track/559711712': {
                type: 'track',
                title: 'Potato Salad'
            },
            'https://www.deezer.com/us/album/97140952': {
                type: 'album',
                title: 'IGOR'
            }
        };
        this.headers = {
            Accept: '*/*',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
            'Content-Type': 'text/plain;charset=UTF-8',
            Origin: 'https://www.deezer.com',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'same-origin',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'https://www.deezer.com/',
            'Accept-Language': 'en-US,en;q=0.9'
        };
        this.availableFormats = new Set();
        if (options === null || options === void 0 ? void 0 : options.arl)
            this.arl = options.arl;
        //if (options?.dispatcher) this.dispatcher = options.dispatcher
    }
    login(username, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.arl)
                yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_loginViaArl).call(this, this.arl);
            else {
                const resp = yield fetch('https://www.deezer.com/', {
                    headers: this.headers,
                    dispatcher: this.dispatcher
                });
                const setCookie = (_a = resp.headers.get('Set-Cookie')) !== null && _a !== void 0 ? _a : '';
                const sid = setCookie.match(/sid=(fr[0-9a-f]+)/)[1];
                this.headers['Cookie'] = `sid=${sid}`;
                password = __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_md5).call(this, password);
                const loginReq = yield fetch(`https://connect.deezer.com/oauth/user_auth.php?${new URLSearchParams({
                    app_id: CLIENT_ID,
                    login: username,
                    password,
                    hash: __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_md5).call(this, CLIENT_ID + username + password + CLIENT_SECRET)
                })}`, { headers: this.headers, dispatcher: this.dispatcher });
                const { error } = yield loginReq.json();
                if (error)
                    throw new Error('Error while getting access token, check your credentials');
                const arl = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'user.getArl');
                yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_loginViaArl).call(this, arl);
            }
        });
    }
    /* ---------- SEARCH ---------- */
    search(query, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all([
                __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_searchArtists).call(this, query, limit),
                __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_searchAlbums).call(this, query, limit),
                __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_searchTracks).call(this, query, limit)
            ]);
            const [artists, albums, tracks] = results;
            return { query, albums, tracks, artists };
        });
    }
    getTypeFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlObj = new URL(url);
            const { type } = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getInfoFromUrl).call(this, urlObj);
            return type;
        });
    }
    getByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, id } = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getInfoFromUrl).call(this, new URL(url));
            switch (type) {
                case 'artist': {
                    return {
                        type: 'artist',
                        metadata: yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getArtist).call(this, id)
                    };
                }
                case 'album': {
                    return Object.assign({ type: 'album' }, (yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getAlbum).call(this, id)));
                }
                case 'track': {
                    const trackPage = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getTrackPage).call(this, id);
                    return {
                        type: 'track',
                        metadata: parseTrack(trackPage.DATA, trackPage.LYRICS),
                        getStream: () => {
                            return __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getStream).call(this, trackPage.DATA);
                        }
                    };
                }
                case 'playlist': {
                    return yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getPlaylist).call(this, id);
                }
                default:
                    throw new Error('URL unrecognised');
            }
        });
    }
    getAccountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'deezer.getUserData');
            return {
                valid: userData.USER.USER_ID != 0,
                premium: userData.OFFER_ID != 0,
                country: userData.COUNTRY,
                explicit: userData.USER.EXPLICIT_CONTENT_LEVEL != 'explicit_hide'
            };
        });
    }
    isrcLookup(isrc) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = (yield (yield fetch(`https://api.deezer.com/track/isrc:${isrc}`)).json());
            if (resp.type == 'track' && resp.link) {
                const track = (yield this.getByUrl(resp.link)).metadata;
                return track;
            }
            else
                throw new Error(`Not available on Deezer.`);
        });
    }
}
_Deezer_instances = new WeakSet(), _Deezer_apiCall = function _Deezer_apiCall(method, data = {}, doSessionRenewal = true) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return __awaiter(this, void 0, void 0, function* () {
        let apiToken = this.apiToken;
        if (method == 'deezer.getUserData' || method == 'user.getArl')
            apiToken = '';
        const url = `${GW_LIGHT_URL}?${new URLSearchParams({
            method,
            input: '3',
            api_version: '1.0',
            api_token: apiToken !== null && apiToken !== void 0 ? apiToken : '',
            cid: Math.floor(Math.random() * 1e9).toString()
        })}`;
        const body = JSON.stringify(data);
        const req = yield fetch(url, {
            method: 'POST',
            body,
            headers: this.headers,
            dispatcher: this.dispatcher
        });
        const { results, error } = yield req.json();
        if (error.constructor.name == 'Object') {
            const [type, msg] = Object.entries(error)[0];
            // session renewal
            if (doSessionRenewal &&
                (type == 'VALID_TOKEN_REQUIRED' || type == 'NEED_USER_AUTH_REQUIRED')) {
                const userData = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'deezer.getUserData', {}, false);
                if (userData.USER.USER_ID == 0)
                    throw new Error('ARL expired');
                return yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, method, data, false);
            }
            throw new Error(`API Error: ${type}\n${msg}`);
        }
        if (method == 'deezer.getUserData') {
            const setCookie = (_a = req.headers.get('Set-Cookie')) !== null && _a !== void 0 ? _a : '';
            const sid = setCookie.match(/sid=(fr[0-9a-f]+)/)[1];
            this.headers['Cookie'] = `arl=${this.arl}; sid=${sid}`;
            const res = results;
            this.apiToken = res.checkForm;
            this.licenseToken = (_c = (_b = res.USER) === null || _b === void 0 ? void 0 : _b.OPTIONS) === null || _c === void 0 ? void 0 : _c.license_token;
            this.country = res === null || res === void 0 ? void 0 : res.COUNTRY;
            this.language = (_f = (_e = (_d = res === null || res === void 0 ? void 0 : res.USER) === null || _d === void 0 ? void 0 : _d.SETTING) === null || _e === void 0 ? void 0 : _e.global) === null || _f === void 0 ? void 0 : _f.language;
            this.availableFormats = new Set([DeezerFormat.MP3_128]);
            if ((_h = (_g = res === null || res === void 0 ? void 0 : res.USER) === null || _g === void 0 ? void 0 : _g.OPTIONS) === null || _h === void 0 ? void 0 : _h.web_hq)
                this.availableFormats.add(DeezerFormat.MP3_320);
            if ((_k = (_j = res === null || res === void 0 ? void 0 : res.USER) === null || _j === void 0 ? void 0 : _j.OPTIONS) === null || _k === void 0 ? void 0 : _k.web_lossless)
                this.availableFormats.add(DeezerFormat.FLAC);
        }
        return results;
    });
}, _Deezer_loginViaArl = function _Deezer_loginViaArl(arl) {
    return __awaiter(this, void 0, void 0, function* () {
        this.arl = arl;
        this.headers['Cookie'] = `arl=${arl}`;
        const userData = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'deezer.getUserData');
        if (userData.USER.USER_ID == 0) {
            delete this.headers['Cookie'];
            this.arl = undefined;
            throw new Error('Invalid ARL');
        }
        return userData;
    });
}, _Deezer_md5 = function _Deezer_md5(str) {
    return createHash('md5').update(str).digest('hex');
}, _Deezer_searchArtists = function _Deezer_searchArtists(query, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'search.music', {
            query,
            start: 0,
            nb: limit,
            filter: 'ALL',
            output: 'ARTIST'
        });
        return data.map((a) => parseArtist(a));
    });
}, _Deezer_searchAlbums = function _Deezer_searchAlbums(query, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'search.music', {
            query,
            start: 0,
            nb: limit,
            filter: 'ALL',
            output: 'ALBUM'
        });
        return data.map((a) => parseAlbum(a));
    });
}, _Deezer_searchTracks = function _Deezer_searchTracks(query, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'search.music', {
            query,
            start: 0,
            nb: limit,
            filter: 'ALL',
            output: 'TRACK'
        });
        return data.map((t) => parseTrack(t));
    });
}, _Deezer_unshortenUrl = function _Deezer_unshortenUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url, { redirect: 'manual', dispatcher: this.dispatcher });
        const location = res.headers.get('Location');
        if (res.status != 302 || !location)
            throw new Error('URL not supported');
        return new URL(location);
    });
}, _Deezer_getInfoFromUrl = function _Deezer_getInfoFromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        if (url.hostname == 'deezer.page.link')
            url = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_unshortenUrl).call(this, url);
        const match = url.pathname.match(/^\/(?:[a-z]{2}\/)?(track|album|artist|playlist)\/(\d+)\/?$/);
        if (!match)
            throw new Error('URL not supported');
        const [, type, id] = match;
        return { type: type, id: parseInt(id) };
    });
}, _Deezer_getArtist = function _Deezer_getArtist(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { DATA, TOP, ALBUMS } = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'deezer.pageArtist', {
            art_id: id,
            lang: 'en'
        });
        return parseArtist(DATA, TOP.data, ALBUMS.data);
    });
}, _Deezer_getAlbum = function _Deezer_getAlbum(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { DATA, SONGS } = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'deezer.pageAlbum', {
            alb_id: id,
            lang: 'en'
        });
        const data = {
            metadata: Object.assign(Object.assign({}, parseAlbum(DATA)), { trackCount: SONGS.data.length }),
            tracks: SONGS.data.map((t) => parseTrack(t))
        };
        if (!data.metadata.trackCount)
            data.metadata.trackCount = data.tracks.length;
        return data;
    });
}, _Deezer_getPlaylist = function _Deezer_getPlaylist(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlistMetadata = (yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'deezer.pagePlaylist', {
            playlist_id: id
        })).DATA;
        const playlistTracks = (yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'playlist.getSongs', {
            playlist_id: id,
            nb: 9999,
            start: 0
        })).data;
        return {
            type: 'playlist',
            metadata: parsePlaylistMetadata(playlistMetadata),
            tracks: playlistTracks.map((t) => parseTrack(t))
        };
    });
}, _Deezer_getTrackPage = function _Deezer_getTrackPage(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'deezer.pageTrack', {
            sng_id: id
        });
    });
}, _Deezer_getStream = function _Deezer_getStream(track) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if ('FALLBACK' in track)
            track = track.FALLBACK;
        const countries = (_a = track === null || track === void 0 ? void 0 : track.AVAILABLE_COUNTRIES) === null || _a === void 0 ? void 0 : _a.STREAM_ADS;
        if (!(countries === null || countries === void 0 ? void 0 : countries.length))
            throw new Error('Track not available in any country');
        if (!countries.includes(this.country))
            throw new Error("Track not available in the account's country");
        let format = DeezerFormat.MP3_128;
        const formatsToCheck = [
            {
                format: DeezerFormat.FLAC,
                filesize: track.FILESIZE_FLAC
            },
            {
                format: DeezerFormat.MP3_320,
                filesize: track.FILESIZE_MP3_320
            }
        ];
        for (const f of formatsToCheck) {
            if (f.filesize != '0' && this.availableFormats.has(f.format)) {
                format = f.format;
                break;
            }
        }
        const id = track.SNG_ID;
        const trackToken = track.TRACK_TOKEN;
        const trackTokenExpiry = track.TRACK_TOKEN_EXPIRE;
        let mimeType = '';
        switch (format) {
            case DeezerFormat.MP3_128:
            case DeezerFormat.MP3_320:
                mimeType = 'audio/mpeg';
                break;
            case DeezerFormat.FLAC:
                mimeType = 'audio/flac';
        }
        // download
        const url = yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getTrackUrl).call(this, id, trackToken, trackTokenExpiry, format);
        const streamResp = yield fetch(url, { dispatcher: this.dispatcher });
        if (!streamResp.ok)
            throw new Error(`Failed to get track stream. Status code: ${streamResp.status}`);
        const decryptionKey = __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_getTrackDecryptionKey).call(this, id);
        const blowfish = new Blowfish(decryptionKey);
        const chunkSize = 2048 * 3;
        const buf = Buffer.alloc(chunkSize);
        let bufSize = 0;
        const decryption = new Transform({
            transform(c, _, callback) {
                const chunk = c;
                let chunkBytesRead = 0;
                while (chunkBytesRead != chunk.length) {
                    const slice = chunk.subarray(chunkBytesRead, chunkBytesRead + (chunkSize - (bufSize % chunkSize)));
                    chunkBytesRead += slice.length;
                    slice.copy(buf, bufSize);
                    bufSize += slice.length;
                    if (bufSize == chunkSize) {
                        bufSize = 0;
                        const copy = Buffer.alloc(chunkSize);
                        buf.copy(copy, 0);
                        if (copy.length >= 2048) {
                            const encryptedChunk = copy.subarray(0, 2048);
                            blowfish.decryptChunk(encryptedChunk);
                        }
                        this.push(copy);
                    }
                }
                callback();
            },
            flush(callback) {
                if (bufSize != 0) {
                    const final = buf.subarray(0, bufSize);
                    if (final.length >= 2048) {
                        const encryptedChunk = final.subarray(0, 2048);
                        blowfish.decryptChunk(encryptedChunk);
                    }
                    this.push(final);
                }
                callback();
            }
        });
        return {
            stream: Readable.fromWeb(streamResp.body)
                .on('error', function (e) {
                throw new Error('Error while downloading track stream:' + e);
            })
                .pipe(decryption)
                .on('error', function (e) {
                throw new Error('Error while decrypting track stream:' + e);
            }),
            mimeType
        };
    });
}, _Deezer_getTrackUrl = function _Deezer_getTrackUrl(id, trackToken, trackTokenExpiry, format) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Date.now() / 1000 - trackTokenExpiry >= 0)
            // renew track token
            trackToken = (yield __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_apiCall).call(this, 'song.getData', {
                sng_id: id,
                array_default: ['TRACK_TOKEN']
            })).TRACK_TOKEN;
        const req = yield fetch('https://media.deezer.com/v1/get_url', {
            method: 'POST',
            body: JSON.stringify({
                license_token: this.licenseToken,
                media: [
                    {
                        type: 'FULL',
                        formats: [{ cipher: 'BF_CBC_STRIPE', format: DeezerFormat[format] }]
                    }
                ],
                track_tokens: [trackToken]
            }),
            dispatcher: this.dispatcher
        });
        const res = yield req.json();
        return res.data[0].media[0].sources[0].url;
    });
}, _Deezer_getTrackDecryptionKey = function _Deezer_getTrackDecryptionKey(id) {
    const hash = __classPrivateFieldGet(this, _Deezer_instances, "m", _Deezer_md5).call(this, id);
    const key = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        key[i] = hash.charCodeAt(i) ^ hash.charCodeAt(i + 16) ^ BLOWFISH_SECRET.charCodeAt(i);
    }
    return key;
};
export default Deezer;
//# sourceMappingURL=main.js.map