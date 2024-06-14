import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';

export class SCPlay extends HTMLElement {
    private player: SCPlayer | null = null;

    init(player: SCPlayer): this {
        this.attachPlayer(player);
        return this.bindEvents();
    }

    attachPlayer(player: SCPlayer): this {
        this.player = player;
        return this;
    }

    bindEvents(): this {
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return this;
        }
        const scInstance = this.player.soundcloudInstance;

        this.addEventListener('click', () => {
            EventService.sendEvent(scInstance.getEvent('track.play'));
        });
        return this;
    }
}

if (customElements.get('sc-play') !== null) {
    customElements.define('sc-play', SCPlay);
}
