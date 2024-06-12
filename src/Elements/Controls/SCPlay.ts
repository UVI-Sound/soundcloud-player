import { SCPlayer } from '../SCPlayer.ts';
import { EventManager } from '../../Classes/EventManager.ts';

export class SCPlay extends HTMLElement {
    private player: SCPlayer | null = null;

    constructor() {
        super();
    }

    attachPlayer(player: SCPlayer) {
        this.player = player;
        return this;
    }

    bindEvents() {
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return;
        }
        const scInstance = this.player.soundcloudInstance;

        this.addEventListener('click', () => {
            EventManager.sendEvent(scInstance.getEvent('track.play'));
        });
    }
}

if (customElements.get('sc-play') !== null) {
    customElements.define('sc-play', SCPlay);
}
