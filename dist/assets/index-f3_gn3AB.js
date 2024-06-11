var h = Object.defineProperty;
var p = (s, t, e) =>
    t in s
        ? h(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e })
        : (s[t] = e);
var i = (s, t, e) => (p(s, typeof t != 'symbol' ? t + '' : t, e), e);
(function () {
    const t = document.createElement('link').relList;
    if (t && t.supports && t.supports('modulepreload')) return;
    for (const n of document.querySelectorAll('link[rel="modulepreload"]'))
        r(n);
    new MutationObserver((n) => {
        for (const o of n)
            if (o.type === 'childList')
                for (const u of o.addedNodes)
                    u.tagName === 'LINK' && u.rel === 'modulepreload' && r(u);
    }).observe(document, { childList: !0, subtree: !0 });
    function e(n) {
        const o = {};
        return (
            n.integrity && (o.integrity = n.integrity),
            n.referrerPolicy && (o.referrerPolicy = n.referrerPolicy),
            n.crossOrigin === 'use-credentials'
                ? (o.credentials = 'include')
                : n.crossOrigin === 'anonymous'
                  ? (o.credentials = 'omit')
                  : (o.credentials = 'same-origin'),
            o
        );
    }
    function r(n) {
        if (n.ep) return;
        n.ep = !0;
        const o = e(n);
        fetch(n.href, o);
    }
})();
class m extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.get('soundcloud-player-play') !== null &&
    customElements.define('soundcloud-player-play', m);
class g extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.get('soundcloud-player-stop') !== null &&
    customElements.define('soundcloud-player-stop', g);
const y = (s, t) => {
    if (
        [].slice
            .call(document.getElementsByTagName('script'))
            .filter((n) => n.src === s).length > 0
    ) {
        window.setTimeout(t, 2e3);
        return;
    }
    const r = document.createElement('script');
    (r.onload = function () {
        t();
    }),
        (r.type = 'text/javascript'),
        (r.src = s),
        document.getElementsByTagName('body')[0].appendChild(r);
};
class c {
    static sendEvent(t, e) {
        return dispatchEvent(
            new CustomEvent(t, { detail: e != null ? e : {} }),
        );
    }
    static listenEvent(t, e) {
        (t = Array.isArray(t) ? t : [t]),
            t.forEach((r) => {
                window.addEventListener(r, function (n) {
                    e(n.detail, n);
                });
            });
    }
}
const f = (s) => {
        (s.style.opacity = '0'),
            (s.style.position = 'absolute'),
            (s.style.top = '-100000px');
    },
    l = window;
class E {
    constructor(t, e, r) {
        i(this, 'soundcloud');
        i(this, 'currentTrack');
        (this.iframe = t),
            (this.elementUuid = e),
            (this.options = r),
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
            f(this.iframe),
            y('https://w.soundcloud.com/player/api.js', () => {
                (this.soundcloud = l.SC.Widget(this.iframe)),
                    this.soundcloud.bind('ready', () => {
                        this.soundcloud.getSounds((t) => {
                            const e = t.filter((r) =>
                                Object.prototype.hasOwnProperty.call(
                                    r,
                                    'title',
                                ),
                            );
                            this.trackChanged(e[0]);
                        });
                    }),
                    this.soundcloud.bind(
                        l.SC.Widget.Events.PLAY_PROGRESS,
                        (t) => {
                            this.trackProgressed(t.currentPosition);
                        },
                    );
            });
    }
    trackChanged(t) {
        (this.currentTrack = t), c.sendEvent(this.getEvent('track.changed'), t);
    }
    trackProgressed(t) {
        (this.currentTrack.percentPlayed = Number(
            ((t / this.currentTrack.duration) * 100).toFixed(2),
        )),
            c.sendEvent(this.getEvent('track.progressed'));
    }
    bindEvents() {
        c.listenEvent(this.getEvent('track.play'), () => {
            this.soundcloud.play();
        }),
            c.listenEvent(this.getEvent('track.pause'), () => {
                this.soundcloud.pause();
            }),
            c.listenEvent(this.getEvent('track.time'), (t) => {
                this.soundcloud.seekTo(t);
            });
    }
    getEvent(t) {
        return this.elementUuid + t;
    }
}
const v = () =>
    '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (s) =>
        (
            parseInt(s) ^
            (crypto.getRandomValues(new Uint8Array(1))[0] &
                (15 >> (parseInt(s) / 4)))
        ).toString(16),
    );
class k extends HTMLElement {
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
        (this.uuid = v()),
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
        var e, r, n;
        c.listenEvent(
            this.soundcloudInstance.getEvent('track.changed'),
            this.handleTrackChanged.bind(this),
        ),
            c.listenEvent(
                this.soundcloudInstance.getEvent('track.progressed'),
                this.handleTrackProgress.bind(this),
            ),
            (e = this.playButton) == null ||
                e.addEventListener('click', () => {
                    c.sendEvent(this.soundcloudInstance.getEvent('track.play'));
                }),
            (r = this.stopButton) == null ||
                r.addEventListener('click', () => {
                    c.sendEvent(
                        this.soundcloudInstance.getEvent('track.pause'),
                    );
                }),
            (n = this.time) == null ||
                n.addEventListener('input', () => {
                    var d, a;
                    const u =
                        (parseInt(
                            (a = (d = this.time) == null ? void 0 : d.value) !=
                                null
                                ? a
                                : '0',
                        ) /
                            100) *
                        this.soundcloudInstance.currentTrack.duration;
                    this.soundcloudInstance.soundcloud.seekTo(u);
                });
    }
    initSoundcloud() {
        var e;
        (this.iframePlayer = document.createElement('iframe')),
            document.body.appendChild(this.iframePlayer),
            (this.soundcloudInstance = new E(this.iframePlayer, this.uuid, {
                trackId: (e = this.getAttribute('track-id')) != null ? e : '',
            })),
            this.soundcloudInstance.init();
    }
    handleTrackProgress() {
        this.progress.forEach((e) => {
            var o, u;
            const r =
                (u =
                    (o = e.dataset.progress) == null ? void 0 : o.split('.')) !=
                null
                    ? u
                    : [];
            let n = e;
            for (let d = 0; d < r.length - 1; d++) n = n[r[d]];
            n[r[r.length - 1]] =
                this.soundcloudInstance.currentTrack.percentPlayed.toString();
        });
    }
    handleTrackChanged(e) {
        this.titleContainer !== null &&
            ((this.titleContainer.innerHTML = e.title),
            this.background !== null && (this.background.src = e.artwork_url));
    }
}
customElements.get('soundcloud-player') !== null &&
    customElements.define('soundcloud-player', k);
//# sourceMappingURL=index-f3_gn3AB.js.map
