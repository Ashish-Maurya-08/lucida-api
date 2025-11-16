var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn } from 'child_process';
import { fetch } from 'undici';
import { imageSize as sizeOf } from 'image-size';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
function parseCoverArtwork(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch(url);
        if (!resp.body)
            throw new Error('No body on image');
        const body = yield resp.arrayBuffer();
        const dimensions = sizeOf(new Uint8Array(body));
        if (!dimensions.width || !dimensions.height)
            throw new Error(`Couldn't get dimensions`);
        return {
            url,
            width: dimensions.width,
            height: dimensions.height
        };
    });
}
export function parseArtist(raw) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const artist = {
            id: raw.id,
            url: raw.permalink_url,
            name: raw.username
        };
        if (raw.avatar_url) {
            artist.pictures = [raw.avatar_url, (_a = raw.avatar_url) === null || _a === void 0 ? void 0 : _a.replace('-large', '-original')];
        }
        return artist;
    });
}
export function parseAlbum(raw) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const album = {
            id: raw.id,
            title: raw.title,
            url: raw.permalink_url,
            trackCount: raw.track_count,
            releaseDate: new Date(raw.release_date),
            artists: [yield parseArtist(raw.user)]
        };
        if (((_b = (_a = raw.tracks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.artwork_url) != undefined) {
            album.coverArtwork = [yield parseCoverArtwork((_d = (_c = raw === null || raw === void 0 ? void 0 : raw.tracks) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.artwork_url)];
        }
        return album;
    });
}
export function parseTrack(raw) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const track = {
            id: raw.id,
            title: raw.title,
            url: raw.permalink_url,
            artists: [yield parseArtist(raw.user)],
            durationMs: raw.full_duration || ((_c = (_b = (_a = raw.media) === null || _a === void 0 ? void 0 : _a.transcodings) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.duration),
            releaseDate: new Date(raw.created_at),
            description: raw.description
        };
        if ((raw === null || raw === void 0 ? void 0 : raw.artwork_url) != undefined)
            track.coverArtwork = [yield parseCoverArtwork(raw === null || raw === void 0 ? void 0 : raw.artwork_url)];
        return track;
    });
}
export function parseHls(url, container) {
    return __awaiter(this, void 0, void 0, function* () {
        const folder = yield fs.promises.mkdtemp(path.join(os.tmpdir(), 'lucida'));
        return new Promise(function (resolve, reject) {
            const ffmpegProc = spawn('ffmpeg', [
                '-hide_banner',
                '-loglevel',
                'error',
                '-i',
                url,
                '-c:a',
                'copy',
                '-f',
                container,
                `${folder}/hls.${container}`
            ]);
            let err;
            ffmpegProc.stderr.on('data', function (data) {
                err = data.toString();
            });
            ffmpegProc.once('exit', function (code) {
                if (code == 0)
                    resolve(fs.createReadStream(`${folder}/hls.${container}`));
                else
                    reject(`FFMPEG HLS error: ${err}` || 'FFMPEG could not parse the HLS.');
            });
        });
    });
}
//# sourceMappingURL=parse.js.map