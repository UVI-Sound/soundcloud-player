var l = Object.defineProperty;
var h = (s, t, n) =>
    t in s
        ? l(s, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
        : (s[t] = n);
var i = (s, t, n) => (h(s, typeof t != 'symbol' ? t + '' : t, n), n);
(function () {
    const t = document.createElement('link').relList;
    if (t && t.supports && t.supports('modulepreload')) return;
    for (const e of document.querySelectorAll('link[rel="modulepreload"]'))
        o(e);
    new MutationObserver((e) => {
        for (const r of e)
            if (r.type === 'childList')
                for (const c of r.addedNodes)
                    c.tagName === 'LINK' && c.rel === 'modulepreload' && o(c);
    }).observe(document, { childList: !0, subtree: !0 });
    function n(e) {
        const r = {};
        return (
            e.integrity && (r.integrity = e.integrity),
            e.referrerPolicy && (r.referrerPolicy = e.referrerPolicy),
            e.crossOrigin === 'use-credentials'
                ? (r.credentials = 'include')
                : e.crossOrigin === 'anonymous'
                  ? (r.credentials = 'omit')
                  : (r.credentials = 'same-origin'),
            r
        );
    }
    function o(e) {
        if (e.ep) return;
        e.ep = !0;
        const r = n(e);
        fetch(e.href, r);
    }
})();
class p extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.get('soundcloud-player-play') !== null &&
    customElements.define('soundcloud-player-play', p);
class m extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.get('soundcloud-player-stop') !== null &&
    customElements.define('soundcloud-player-stop', m);
const g = (s, t) => {
    if (
        [].slice
            .call(document.getElementsByTagName('script'))
            .filter((e) => e.src === s).length > 0
    ) {
        window.setTimeout(t, 2e3);
        return;
    }
    const o = document.createElement('script');
    (o.onload = function () {
        t();
    }),
        (o.type = 'text/javascript'),
        (o.src = s),
        document.getElementsByTagName('body')[0].appendChild(o);
};
class d {
    static sendEvent(t, n) {
        return dispatchEvent(new CustomEvent(t, { detail: n ?? {} }));
    }
    static listenEvent(t, n) {
        (t = Array.isArray(t) ? t : [t]),
            t.forEach((o) => {
                window.addEventListener(o, function (e) {
                    n(e.detail, e);
                });
            });
    }
}
const y = (s) => {
        (s.style.opacity = '0'),
            (s.style.position = 'absolute'),
            (s.style.top = '-100000px');
    },
    a = window;
class f {
    constructor(t, n, o) {
        i(this, 'soundcloud');
        i(this, 'currentTrack');
        (this.iframe = t),
            (this.elementUuid = n),
            (this.options = o),
            (this.currentTrack = {
                title: '',
                duration: 0,
                percentPlayed: 0,
                artwork_url: '',
            }),
            this.bindEvents();
    }
    init() {
        (this.iframe.allow = 'autoplay'),
            (this.iframe.src =
                'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' +
                this.options.trackId +
                '&amp;auto_play=false'),
            y(this.iframe),
            g('https://w.soundcloud.com/player/api.js', () => {
                (this.soundcloud = a.SC.Widget(this.iframe)),
                    this.soundcloud.bind('ready', () => {
                        this.soundcloud.getSounds((t) => {
                            const n = t.filter((o) =>
                                Object.prototype.hasOwnProperty.call(
                                    o,
                                    'title',
                                ),
                            );
                            this.trackChanged(n[0]);
                        });
                    }),
                    this.soundcloud.bind(
                        a.SC.Widget.Events.PLAY_PROGRESS,
                        (t) => {
                            this.trackProgressed(t.currentPosition);
                        },
                    );
            });
    }
    trackChanged(t) {
        (this.currentTrack = t), d.sendEvent(this.getEvent('track.changed'), t);
    }
    trackProgressed(t) {
        (this.currentTrack.percentPlayed = Number(
            ((t / this.currentTrack.duration) * 100).toFixed(2),
        )),
            d.sendEvent(this.getEvent('track.progressed'));
    }
    bindEvents() {
        d.listenEvent(this.getEvent('track.play'), () => {
            const t = new AudioContext();
            t.resume().then(() => {
                console.trace(t.state), this.soundcloud.play();
            });
        }),
            d.listenEvent(this.getEvent('track.pause'), () => {
                this.soundcloud.pause();
            }),
            d.listenEvent(this.getEvent('track.time'), (t) => {
                this.soundcloud.seekTo(t);
            });
    }
    getEvent(t) {
        return this.elementUuid + t;
    }
}
const E = () =>
    '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (s) =>
        (
            parseInt(s) ^
            (crypto.getRandomValues(new Uint8Array(1))[0] &
                (15 >> (parseInt(s) / 4)))
        ).toString(16),
    );
class v extends HTMLElement {
    constructor() {
        super();
        i(this, 'titleContainer');
        i(this, 'playButton');
        i(this, 'stopButton');
        i(this, 'progress');
        i(this, 'soundcloudInstance');
        i(this, 'iframePlayer');
        i(this, 'background');
        i(this, 'time');
        i(this, 'uuid');
        (this.uuid = E()),
            this.initSoundcloud(),
            (this.titleContainer = this.querySelector('[data-title]')),
            (this.playButton = this.querySelector('soundcloud-player-play')),
            console.log(this.playButton),
            (this.stopButton = this.querySelector('soundcloud-player-stop')),
            (this.progress = this.querySelectorAll('[data-progress]')),
            (this.background = this.querySelector('[data-background]')),
            (this.time = this.querySelector('[data-time]')),
            this.bindEvents();
    }
    bindEvents() {
        var n, o, e;
        d.listenEvent(
            this.soundcloudInstance.getEvent('track.changed'),
            this.handleTrackChanged.bind(this),
        ),
            d.listenEvent(
                this.soundcloudInstance.getEvent('track.progressed'),
                this.handleTrackProgress.bind(this),
            ),
            (n = this.playButton) == null ||
                n.addEventListener('click', () => {
                    console.log('play'),
                        d.sendEvent(
                            this.soundcloudInstance.getEvent('track.play'),
                        );
                }),
            (o = this.stopButton) == null ||
                o.addEventListener('click', () => {
                    d.sendEvent(
                        this.soundcloudInstance.getEvent('track.pause'),
                    );
                }),
            (e = this.time) == null ||
                e.addEventListener('input', () => {
                    var u;
                    const c =
                        (parseInt(
                            ((u = this.time) == null ? void 0 : u.value) ?? '0',
                        ) /
                            100) *
                        this.soundcloudInstance.currentTrack.duration;
                    this.soundcloudInstance.soundcloud.seekTo(c);
                });
    }
    initSoundcloud() {
        (this.iframePlayer = document.createElement('iframe')),
            document.body.appendChild(this.iframePlayer),
            (this.soundcloudInstance = new f(this.iframePlayer, this.uuid, {
                trackId: this.getAttribute('track-id') ?? '',
            })),
            this.soundcloudInstance.init();
    }
    handleTrackProgress() {
        this.progress.forEach((n) => {
            var r;
            const o =
                ((r = n.dataset.progress) == null ? void 0 : r.split('.')) ??
                [];
            let e = n;
            for (let c = 0; c < o.length - 1; c++) e = e[o[c]];
            e[o[o.length - 1]] =
                this.soundcloudInstance.currentTrack.percentPlayed.toString();
        });
    }
    handleTrackChanged(n) {
        this.titleContainer !== null &&
            ((this.titleContainer.innerHTML = n.title),
            this.background !== null && (this.background.src = n.artwork_url));
    }
}
customElements.get('soundcloud-player') !== null &&
    customElements.define('soundcloud-player', v);
