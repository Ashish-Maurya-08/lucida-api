import { DOMParser } from 'xmldom-qsa';
export function parseArtist(raw) {
    var _a, _b;
    let picturePath;
    if ((raw === null || raw === void 0 ? void 0 : raw.picture) != null)
        picturePath = (_a = raw === null || raw === void 0 ? void 0 : raw.picture) === null || _a === void 0 ? void 0 : _a.replace(/-/gm, '/');
    else
        picturePath = null;
    const artist = {
        id: raw.id,
        url: (_b = raw.url) !== null && _b !== void 0 ? _b : `https://www.tidal.com/artist/${raw.id}`,
        name: raw.name
    };
    if (picturePath)
        artist.pictures = [
            `https://resources.tidal.com/images/${picturePath}/160x160.jpg`,
            `https://resources.tidal.com/images/${picturePath}/320x320.jpg`,
            `https://resources.tidal.com/images/${picturePath}/750x750.jpg`
        ];
    return artist;
}
export function parseAlbum(raw) {
    var _a;
    let coverPath;
    if (raw.cover)
        coverPath = raw.cover.replace(/-/gm, '/');
    else
        coverPath = null;
    const album = {
        id: raw.id,
        url: (_a = raw.url) !== null && _a !== void 0 ? _a : `https://tidal.com/browse/album/${raw.id}`,
        title: raw.title,
        coverArtwork: []
    };
    if (coverPath)
        album.coverArtwork = [
            {
                url: `https://resources.tidal.com/images/${coverPath}/160x160.jpg`,
                width: 160,
                height: 160
            },
            {
                url: `https://resources.tidal.com/images/${coverPath}/320x320.jpg`,
                width: 320,
                height: 320
            },
            {
                url: `https://resources.tidal.com/images/${coverPath}/1280x1280.jpg`,
                width: 1280,
                height: 1280
            }
        ];
    if (raw.upc)
        album.upc = raw.upc;
    if (raw.artists)
        album.artists = raw.artists.map(parseArtist);
    if (raw.numberOfTracks)
        album.trackCount = raw.numberOfTracks;
    if (raw.numberOfVolumes)
        album.discCount = raw.numberOfVolumes;
    if (raw.releaseDate)
        album.releaseDate = new Date(raw.releaseDate);
    return album;
}
export function parsePlaylist(raw) {
    let coverPath;
    if (raw.cover)
        coverPath = raw.cover.replace(/-/gm, '/');
    else
        coverPath = null;
    const playlist = {
        id: raw.uuid,
        title: raw.title,
        url: raw.url,
        trackCount: raw.numberOfTracks
    };
    playlist.coverArtwork = [
        {
            url: `https://resources.tidal.com/images/${coverPath}/160x160.jpg`,
            width: 160,
            height: 160
        },
        {
            url: `https://resources.tidal.com/images/${coverPath}/320x320.jpg`,
            width: 320,
            height: 320
        },
        {
            url: `https://resources.tidal.com/images/${coverPath}/1280x1280.jpg`,
            width: 1280,
            height: 1280
        }
    ];
    return playlist;
}
export function parseTrack(raw) {
    const track = {
        url: raw.url,
        id: raw.id,
        title: raw.version ? `${raw.title} (${raw.version})` : raw.title,
        durationMs: raw.duration * 1000,
        artists: raw.artists.map(parseArtist),
        album: parseAlbum(raw.album)
    };
    if (raw.producers)
        track.producers = raw.producers;
    if (raw.composers && raw.composers[0] != 'Not Documented')
        track.composers = raw.composers;
    if (raw.lyricists)
        track.lyricists = raw.lyricists;
    if (raw.isrc)
        track.isrc = raw.isrc;
    if (raw.copyright)
        track.copyright = raw.copyright;
    if (raw.explicit)
        track.explicit = raw.explicit;
    if (raw.trackNumber)
        track.trackNumber = raw.trackNumber;
    if (raw.volumeNumber)
        track.discNumber = raw.volumeNumber;
    return track;
}
export function addCredits(raw, credits) {
    if (credits.length > 0 && 'type' in credits[0]) {
        credits = credits
            .map((group) => {
            return group.contributors.map((contributor) => {
                return {
                    name: contributor.name,
                    role: group.type
                };
            });
        })
            .flat();
    }
    for (const contributor of credits) {
        switch (contributor.role) {
            case 'Producer':
                if (!raw.producers)
                    raw.producers = [];
                raw.producers.push(contributor.name);
                break;
            case 'Composer':
                if (!raw.composers)
                    raw.composers = [];
                raw.composers.push(contributor.name);
                break;
            case 'Lyricist':
                if (!raw.lyricists)
                    raw.lyricists = [];
                raw.lyricists.push(contributor.name);
                break;
            default:
                break;
        }
    }
    return raw;
}
export function parseMpd(mpdString) {
    var _a;
    const tracks = [];
    const { documentElement: doc } = new DOMParser().parseFromString(mpdString, 'application/xml');
    for (const adaptationSet of [...doc.querySelectorAll('AdaptationSet')]) {
        const contentType = adaptationSet.getAttribute('contentType');
        if (contentType != 'audio')
            throw new Error('Lucida only supports audio MPDs');
        for (const rep of [...doc.querySelectorAll('Representation')]) {
            let codec = (_a = rep.getAttribute('codecs')) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (codec === null || codec === void 0 ? void 0 : codec.startsWith('mp4a'))
                codec = 'aac';
            const segTemplate = rep.querySelector('SegmentTemplate');
            if (!segTemplate)
                throw new Error('No SegmentTemplate found');
            const initializationUrl = segTemplate.getAttribute('initialization');
            if (!initializationUrl)
                throw new Error('No initialization url');
            const mediaUrl = segTemplate.getAttribute('media');
            if (!mediaUrl)
                throw new Error('No media url');
            const trackUrls = [initializationUrl];
            const timeline = segTemplate.querySelector('SegmentTimeline');
            if (timeline) {
                let numSegments = 0;
                // let currentTime = 0
                for (const s of [...timeline.querySelectorAll('S')]) {
                    if (s.getAttribute('t')) {
                        // currentTime = parseInt(<string>s.getAttribute('t'))
                    }
                    const r = parseInt(s.getAttribute('r') || '0') + 1;
                    if (!s.getAttribute('d'))
                        throw new Error('No d property on SegmentTimeline');
                    numSegments += r;
                    // for (let i = 0; i < r; i++) {
                    // 	 currentTime += parseInt(<string>s.getAttribute('d'))
                    // }
                }
                for (let i = 1; i <= numSegments; i++) {
                    trackUrls.push(mediaUrl.replace('$Number$', i.toString()));
                }
            }
            tracks.push(trackUrls);
        }
    }
    return tracks[0];
}
//# sourceMappingURL=parse.js.map