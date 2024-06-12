import { SCPlayer } from '../SCPlayer.ts';

export default interface SCPlayerDependant {
    attachPlayer(player: SCPlayer): SCPlayerDependant;
}
