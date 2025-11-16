export function parseArtist(raw) {
    const artist = {
        id: raw.id.toString(),
        url: `https://play.qobuz.com/artist/${raw.id.toString()}`,
        name: raw.name
    };
    if (raw.picture)
        artist.pictures = [raw.picture];
    else if (raw.image)
        artist.pictures = [raw.image.small, raw.image.medium, raw.image.large];
    if (raw.albums)
        artist.albums = raw.albums.items.map(parseAlbum);
    if (raw.tracks_appears_on)
        artist.tracks = raw.tracks_appears_on.items.map(parseTrack);
    return artist;
}
export function parseAlbum(raw) {
    var _a, _b, _c, _d, _e;
    const album = {
        title: raw.version ? `${raw.title} (${raw.version})` : raw.title,
        id: raw.id,
        url: (_a = raw.url) !== null && _a !== void 0 ? _a : `https://play.qobuz.com/album/${raw.id}`,
        coverArtwork: [
            {
                url: raw.image.thumbnail,
                width: 50,
                height: 50
            },
            {
                url: raw.image.small,
                width: 230,
                height: 230
            },
            {
                url: raw.image.large,
                width: 600,
                height: 600
            }
        ],
        artists: (_c = (_b = raw.artists) === null || _b === void 0 ? void 0 : _b.map(parseArtist)) !== null && _c !== void 0 ? _c : [parseArtist(raw.artist)],
        upc: raw.upc,
        releaseDate: new Date(raw.released_at * 1000),
        copyright: raw.copyright
    };
    if ((_d = raw.label) === null || _d === void 0 ? void 0 : _d.name)
        album.label = raw.label.name;
    if ((_e = raw.genre) === null || _e === void 0 ? void 0 : _e.name)
        album.genre = [raw.genre.name];
    return album;
}
export function parseTrack(raw) {
    var _a, _b;
    const artists = [];
    const artist = (_a = raw.performer) !== null && _a !== void 0 ? _a : (_b = raw.album) === null || _b === void 0 ? void 0 : _b.artist;
    if (artist)
        artists.push(parseArtist(artist));
    let track = {
        title: raw.version ? `${raw.title} (${raw.version})` : raw.title,
        id: raw.id.toString(),
        url: `https://play.qobuz.com/track/${raw.id.toString()}`,
        copyright: raw.copyright,
        artists,
        durationMs: raw.duration * 1000,
        explicit: raw.parental_warning,
        isrc: raw.isrc,
        genres: []
    };
    if (raw.album)
        track.album = parseAlbum(raw.album);
    if (raw.track_number)
        track.trackNumber = raw.track_number;
    if (raw.media_number)
        track.discNumber = raw.media_number;
    if (raw.performers)
        track = parsePerformers(raw.performers, track);
    return track;
}
function parsePerformers(performers, track) {
    const pre = performers.split(' - ');
    track.producers = [];
    track.composers = [];
    track.lyricists = [];
    track.performers = [];
    track.engineers = [];
    for (const i in pre) {
        const name = pre[i].split(', ')[0];
        const credits = pre[i].split(', ').slice(1).join(', ');
        if (credits.toLowerCase().includes('producer'))
            track.producers.push(name);
        if (credits.toLowerCase().includes('lyricist'))
            track.lyricists.push(name);
        if (credits.toLowerCase().includes('composer'))
            track.composers.push(name);
        if (credits.toLowerCase().includes('performer'))
            track.performers.push(name);
        if (credits.toLowerCase().includes('engineer'))
            track.engineers.push(name);
    }
    return track;
}
export function parsePlaylist(raw) {
    var _a, _b;
    return {
        type: 'playlist',
        metadata: {
            id: raw.id,
            title: raw.name,
            trackCount: (raw === null || raw === void 0 ? void 0 : raw.tracks_count) || ((_a = raw === null || raw === void 0 ? void 0 : raw.tracks) === null || _a === void 0 ? void 0 : _a.total),
            url: `https://open.qobuz.com/playlist/${raw.id}`
        },
        tracks: (_b = raw.tracks) === null || _b === void 0 ? void 0 : _b.items.map(parseTrack)
    };
}
//# sourceMappingURL=parse.js.map