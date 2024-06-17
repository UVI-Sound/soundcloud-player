import { EventService } from '../../Classes/EventService.ts';
import SubPlayerElement from '../SubPlayerElement.ts';

export class SCPlay extends SubPlayerElement {
    bindEvents(): this {
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return this;
        }
        const scInstance = this.player.sc;

        this.addEventListener('click', () => {
            EventService.sendEvent(scInstance.getEvent('track.start'));
        });
        return this;
    }
}

if (customElements.get('sc-play') !== null) {
    customElements.define('sc-play', SCPlay);
}
