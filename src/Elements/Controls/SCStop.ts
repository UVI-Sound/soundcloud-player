import { EventService } from '../../Classes/EventService.ts';
import SubPlayerElement from '../SubPlayerElement.ts';

export class SCStop extends SubPlayerElement {
    bindEvents(): this {
        if (!this.player) {
            console.warn('Cant init event without player attached');
            return this;
        }
        const scInstance = this.player.sc;

        EventService.listenEvent(this.player.sc.getEvent('sc.ready'), () => {
            this.addEventListener('click', () => {
                EventService.sendEvent(scInstance.getEvent('track.stop'));
            });
        });

        return this;
    }
}

if (customElements.get('sc-stop') !== null) {
    customElements.define('sc-stop', SCStop);
}
