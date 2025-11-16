function parseThumbnails(raw) {
    return raw
        .sort((a, b) => { var _a, _b; return ((_a = a.width) !== null && _a !== void 0 ? _a : 0) - ((_b = b.width) !== null && _b !== void 0 ? _b : 0); })
        .map((e) => {
        var _a, _b;
        return {
            width: (_a = e.width) !== null && _a !== void 0 ? _a : 0,
            height: (_b = e.height) !== null && _b !== void 0 ? _b : 0,
            url: e.url
        };
    });
}
export function parseArtist(raw) {
    const artist = {
        id: raw.id,
        url: raw.externalUrl,
        name: raw.name
    };
    if (raw.avatar)
        artist.pictures = parseThumbnails(raw.avatar).map((e) => e.url);
    if (raw.albums)
        artist.albums = raw.albums.map((e) => parseAlbum(e));
    return artist;
}
export function parseTrack(raw) {
    var _a, _b, _c;
    const track = {
        title: raw.name,
        id: raw.id,
        url: raw.externalUrl,
        explicit: raw.explicit,
        trackNumber: raw.trackNumber,
        discNumber: raw.discNumber,
        artists: (_b = (_a = raw.artists) === null || _a === void 0 ? void 0 : _a.map((e) => parseArtist(e))) !== null && _b !== void 0 ? _b : [],
        durationMs: raw.durationMs
    };
    if (raw.album)
        track.album = parseAlbum(raw.album);
    if (raw === null || raw === void 0 ? void 0 : raw.isrc)
        track.isrc = raw.isrc;
    if ((_c = raw === null || raw === void 0 ? void 0 : raw.album) === null || _c === void 0 ? void 0 : _c.availableMarkets)
        track.regions = raw.album.availableMarkets;
    return track;
}
export function parseAlbum(raw) {
    const album = {
        title: raw.name,
        id: raw.id,
        url: raw.externalUrl,
        trackCount: raw.totalTracks,
        releaseDate: raw.releaseDate,
        coverArtwork: parseThumbnails(raw.coverArtwork),
        artists: raw.artists.map((e) => parseArtist(e))
    };
    if (raw.availableMarkets)
        album.regions = raw.availableMarkets;
    return album;
}
export function parseEpisode(raw) {
    const episode = {
        title: raw.name,
        id: raw.id,
        url: raw.externalUrl,
        explicit: raw.explicit,
        description: raw.description,
        coverArtwork: parseThumbnails(raw.coverArtwork),
        releaseDate: raw.releaseDate,
        durationMs: raw.durationMs
    };
    if (raw.podcast)
        episode.podcast = parsePodcast(raw.podcast);
    return episode;
}
export function parsePodcast(raw) {
    const podcast = {
        title: raw.name,
        id: raw.id,
        url: raw.externalUrl,
        description: raw.description,
        coverArtwork: parseThumbnails(raw.coverArtwork)
    };
    if (typeof raw.explicit == 'boolean')
        podcast.explicit = raw.explicit;
    if (raw.episodes)
        podcast.episodes = raw.episodes.map((e) => parseEpisode(e));
    return podcast;
}
export function parsePlaylist(raw) {
    const playlist = {
        id: raw.id,
        title: raw.name,
        url: raw.externalUrl,
        trackCount: raw.totalTracks,
        coverArtwork: parseThumbnails(raw.coverArtwork)
    };
    return playlist;
}
//# sourceMappingURL=parse.js.map