import { SIZES } from './constants.js';
export var DeezerFormat;
(function (DeezerFormat) {
    DeezerFormat[DeezerFormat["MP3_128"] = 1] = "MP3_128";
    DeezerFormat[DeezerFormat["MP3_320"] = 3] = "MP3_320";
    DeezerFormat[DeezerFormat["FLAC"] = 9] = "FLAC";
})(DeezerFormat || (DeezerFormat = {}));
export function parseArtist(artist, tracks, albums) {
    let pictures;
    if (artist.ART_PICTURE)
        pictures = SIZES.map((s) => `https://e-cdns-images.dzcdn.net/images/artist/${artist.ART_PICTURE}/${s}x${s}-000000-80-0-0.jpg`);
    let parsedTracks;
    if (tracks)
        parsedTracks = tracks.map((t) => parseTrack(t));
    let parsedAlbums;
    if (albums)
        parsedAlbums = albums.map(parseAlbum);
    return {
        id: artist.ART_ID,
        url: `https://www.deezer.com/artist/${artist.ART_ID}`,
        pictures,
        name: artist.ART_NAME,
        tracks: parsedTracks,
        albums: parsedAlbums
    };
}
export function parseAlbum(album) {
    const data = {
        title: album.ALB_TITLE,
        id: album.ALB_ID,
        url: `https://www.deezer.com/album/${album.ALB_ID}`,
        trackCount: album.NUMBER_TRACK ? parseInt(album.NUMBER_TRACK) : undefined,
        releaseDate: album.ORIGINAL_RELEASE_DATE ? new Date(album.ORIGINAL_RELEASE_DATE) : undefined,
        coverArtwork: parseArtwork(album.ALB_PICTURE),
        artists: album.ARTISTS ? album.ARTISTS.map((a) => parseArtist(a)) : undefined,
        label: album.LABEL_NAME
    };
    if (album.COPYRIGHT)
        data.copyright = album.COPYRIGHT;
    if (album.UPC)
        data.upc = album.UPC;
    return data;
}
export function parseTrack(track, lyricsData) {
    var _a, _b, _c, _d, _e, _f, _g;
    const addt = {};
    if ((_a = track === null || track === void 0 ? void 0 : track.AVAILABLE_COUNTRIES) === null || _a === void 0 ? void 0 : _a.STREAM_ADS)
        addt.regions = [...track.AVAILABLE_COUNTRIES.STREAM_ADS];
    if (track === null || track === void 0 ? void 0 : track.COPYRIGHT)
        addt.copyright = track.COPYRIGHT;
    if ((_b = track.SNG_CONTRIBUTORS) === null || _b === void 0 ? void 0 : _b.producer)
        addt.producers = (_c = track.SNG_CONTRIBUTORS) === null || _c === void 0 ? void 0 : _c.producer;
    if ((_d = track.SNG_CONTRIBUTORS) === null || _d === void 0 ? void 0 : _d.composer)
        addt.composers = (_e = track.SNG_CONTRIBUTORS) === null || _e === void 0 ? void 0 : _e.composer;
    if ((_f = track.SNG_CONTRIBUTORS) === null || _f === void 0 ? void 0 : _f.composer)
        addt.lyricists = (_g = track.SNG_CONTRIBUTORS) === null || _g === void 0 ? void 0 : _g.lyricist;
    let lyrics;
    if (lyricsData) {
        const lines = [];
        const syncedLyrics = lyricsData.LYRICS_SYNC_JSON;
        if (syncedLyrics) {
            let lastLineEnd = 0;
            for (const line of syncedLyrics) {
                if (!line.line) {
                    const lastLine = lines[lines.length - 1];
                    if (lastLine)
                        lastLine.endTimeMs = lastLineEnd;
                    continue;
                }
                lines.push({
                    text: line.line,
                    startTimeMs: parseInt(line.milliseconds)
                });
                lastLineEnd = parseInt(line.milliseconds) + parseInt(line.duration);
            }
        }
        else {
            lines.push({
                text: lyricsData.LYRICS_TEXT
            });
        }
        lyrics = {
            id: lyricsData.LYRICS_ID,
            source: 'deezer',
            lines
        };
    }
    return Object.assign({ title: track.VERSION ? `${track.SNG_TITLE} ${track.VERSION}` : track.SNG_TITLE, id: track.SNG_ID, url: `https://www.deezer.com/track/${track.SNG_ID}`, explicit: track.EXPLICIT_LYRICS == '1', trackNumber: parseInt(track.TRACK_NUMBER), discNumber: parseInt(track.DISK_NUMBER), artists: track.ARTISTS.map((a) => parseArtist(a)), isrc: track.ISRC, album: parseAlbum({
            ALB_ID: track.ALB_ID,
            ALB_PICTURE: track.ALB_PICTURE,
            ALB_TITLE: track.ALB_TITLE
        }), durationMs: parseInt(track.DURATION) * 1e3, coverArtwork: parseArtwork(track.ALB_PICTURE), lyrics }, addt);
}
export function parseArtwork(picture) {
    return SIZES.map((size) => ({
        url: `https://e-cdns-images.dzcdn.net/images/cover/${picture}/${size}x${size}-000000-80-0-0.jpg`,
        height: size,
        width: size
    }));
}
export function parsePlaylistMetadata(raw) {
    return {
        id: raw.PLAYLIST_ID,
        title: raw.TITLE,
        url: `https://www.deezer.com/playlist/${raw.PLAYLIST_ID}`,
        coverArtwork: parseArtwork(raw.PLAYLIST_PICTURE),
        trackCount: raw.NB_SONG
    };
}
//# sourceMappingURL=parse.js.map