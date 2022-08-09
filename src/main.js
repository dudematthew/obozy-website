import {
    createApp
} from 'vue'
import App from './App.vue'
import router from './router'

const GOOGLE_ALBUM_IDS = [
    "9BQbhN8sajNfCdnW7"
];
const GOOGLE_PHOTOS_URL = 'https://photos.app.goo.gl';
const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;


function fetchAlbum(albumId) {
    const payload = {
        method: 'getGooglePhotosAlbum',
        params: {
            sharedLink: GOOGLE_PHOTOS_URL + '/' + albumId,
            imageWidth: IMAGE_WIDTH,
            imageHeight: IMAGE_HEIGHT,
            includeThumbnails: true,
            videoQuality: '1080p',
            attachMetadata: false
        },
        id: 1
    };

    return fetch('https://www.publicalbum.org/api/v2/webapp/embed-player/jsonrpc', {
            method: 'POST',
            referrer: "https://www.publicalbum.org/blog/embedding-google-photos-albums",
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'text/plain;charset=UTF-8',
                'Accept': 'application/json'
            },
        })
        .then(response => response.json())
        .then((response) => {
            if (response.error)
                console.error("Response: ", response)
        })
        .then(response => response["result"]);
}

window.onload = () => {
    (async () => {
        const items = [];
        for (const albumId of GOOGLE_ALBUM_IDS) {
            const album = await fetchAlbum(albumId);
            console.log("Album: ", album);
            const title = album.title;
            album.mediaItems.forEach((mediaItem, i) => {
                if (i === 0) {
                    const item = {
                        ID: albumId,
                        src: mediaItem.url,
                        srct: mediaItem.url.split('=')[0] + `=w${THUMBNAIL_L1_WIDTH}-h${THUMBNAIL_L1_HEIGHT}`,
                        kind: 'album',
                        title: title
                    };
                    items.push(item);
                }
                const item = {
                    ID: mediaItem.id,
                    albumID: albumId,
                    src: mediaItem.url,
                    srct: mediaItem.url.split('=')[0] + `=w${THUMBNAIL_WIDTH}-h${THUMBNAIL_HEIGHT}`
                };
                items.push(item);
            });
        }
        return items;
    })().then(items => console.log("Items: ", items));
}

           

// Single Page Apps for GitHub Pages
// MIT License
// https://github.com/rafgraph/spa-github-pages
// This script checks to see if a redirect is present in the query string,
// converts it back into the correct url and adds it to the
// browser's history using window.history.replaceState(...),
// which won't cause the browser to attempt to load the new url.
// When the single page app is loaded further down in this file,
// the correct url will be waiting in the browser's history for
// the single page app to route accordingly.
(function (l) {
    if (l.search[1] === '/') {
        var decoded = l.search.slice(1).split('&').map(function (s) {
            return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
    }
}(window.location))

createApp(App).use(router).mount('#app');