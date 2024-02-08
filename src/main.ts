import "./style.css";
import { loadScript } from "./utils/loadScript.ts";
import { hideIframe } from "./utils/hiddeIframe.ts";
import { EventManager } from "./utils/EventManager.ts";
import { uuidv4 } from "./utils/uuid.ts";

type TrackType = {
    title: string;
};

type SouncloudType = {
    bind: (type: string, callback: () => void) => void;
    getSounds: (callback: (sounds: TrackType[]) => void) => void;
    play: () => void;
};

type ScOptionsType = {
    trackId: string;
};

const scWindow = window as unknown as {
    SC: {
        Widget: (iframe: HTMLIFrameElement) => SouncloudType;
    };
};

const title = document.createElement("div");
document.body.appendChild(title);

class SC {
    soundcloud!: SouncloudType;
    currentTrack: TrackType;

    constructor(
        private iframe: HTMLIFrameElement,
        private elementUuid: string,
        private options: ScOptionsType,
    ) {
        this.currentTrack = { title: "" };
        console.log(this.options);
        this.bindEvents();
    }

    init() {
        this.iframe.src =
            "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" +
            this.options.trackId +
            "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
        hideIframe(this.iframe);

        loadScript("https://w.soundcloud.com/player/api.js", () => {
            this.soundcloud = scWindow.SC.Widget(this.iframe);
            this.soundcloud.bind("ready", () => {
                this.soundcloud.getSounds((sounds) => {
                    const tracks = sounds.filter((sound) =>
                        sound.hasOwnProperty("title"),
                    );
                    this.trackChanged(tracks[0]);
                });
            });
        });
    }

    /**
     * Track changed
     * @param track
     * @private
     */
    private trackChanged(track: TrackType) {
        this.currentTrack = track;
        EventManager.sendFrontEvent(this.elementUuid + "track-changed", track);
    }

    private bindEvents() {
        EventManager.listenEvent(this.elementUuid + "play", () => {
            this.soundcloud.play();
        });
    }
}

class SouncloudPlayer extends HTMLElement {
    // Container for currentSound title
    titleContainer: NodeListOf<HTMLElement>;
    playButtons: NodeListOf<HTMLElement>;
    souncloudInstance!: SC;
    iframePlayer!: HTMLIFrameElement;
    uuid: string;

    constructor() {
        super();

        this.uuid = uuidv4();
        this.initSouncloud();

        this.titleContainer = this.querySelectorAll("[data-title]");
        this.playButtons = this.querySelectorAll("[data-play]");

        this.bindEvents();
    }

    /**
     *
     * @private
     */
    private bindEvents() {
        EventManager.listenEvent<TrackType>(
            this.uuid + "track-changed",
            (track) => {
                this.titleContainer?.forEach(
                    (el) => (el.innerHTML = track.title),
                );
            },
        );

        this.playButtons.forEach((el) => {
            el.addEventListener("click", () => {
                EventManager.sendFrontEvent(this.uuid + "play");
            });
        });
    }

    private initSouncloud() {
        this.iframePlayer = document.createElement("iframe");
        document.body.appendChild(this.iframePlayer);
        this.souncloudInstance = new SC(this.iframePlayer, this.uuid, {
            trackId: this.getAttribute("track-id") ?? "",
        });
        this.souncloudInstance.init();
    }
}

if (!customElements.get("soundcloud-player")) {
    customElements.define("soundcloud-player", SouncloudPlayer);
}

declare global {
    interface HTMLElementTagNameMap {
        soundcloud: SouncloudPlayer;
    }
}
