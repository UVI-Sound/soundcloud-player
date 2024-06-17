import { type SCPlayer } from './SCPlayer.ts';

export default class SubPlayerElement extends HTMLElement {
    protected player!: SCPlayer;

    init(player: SCPlayer): this {
        this.player = player;

        return this.initOptions().bindEvents();
    }

    initOptions(): this {
        return this;
    }

    bindEvents(): this {
        return this;
    }
}
