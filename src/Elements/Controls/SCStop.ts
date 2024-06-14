import { type SCPlayer } from '../SCPlayer.ts';
import { EventService } from '../../Classes/EventService.ts';

export class SCStop extends HTMLElement {
    private player: SCPlayer | null = null;

    bindEvents(): this {
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return this;
        }
        const scInstance = this.player.soundcloudInstance;

        this.addEventListener('click', () => {
            EventService.sendEvent(scInstance.getEvent('track.stop'));
        });
        return this;
    }

    init(player: SCPlayer): this {
        this.player = player;
        return this.bindEvents();
    }
}

if (customElements.get('sc-stop') !== null) {
    customElements.define('sc-stop', SCStop);
}
