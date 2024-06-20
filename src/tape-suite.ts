import { type SCSelectTrack } from './Elements/Controls/SCSelectTrack.ts';
import { type SCPlayer } from './Elements/SCPlayer.ts';

const player: SCPlayer | null = document.querySelector('soundcloud-player');

if (!player) {
    throw new Error('Player not found');
}

const drum = player.querySelector('#drum');
const guitare = player.querySelector('#guitare');
const bass = player.querySelector('#bass');
const key = player.querySelector('#key');
const vocal = player.querySelector('#vocal');

const instruments = [drum, guitare, bass, key, vocal];

interface InstrumentElement extends HTMLElement {
    id: 'guitare' | 'drum' | 'bass' | 'key' | 'vocal';
}

function isInstrumentElement(element: Element): element is InstrumentElement {
    return ['guitare', 'drum', 'bass', 'key', 'vocal'].includes(element.id);
}

function getInstrumentRelatedTrackSelection(instrument: InstrumentElement): NodeListOf<SCSelectTrack> {
    if (!player) {
        throw new Error('Player not found');
    }
    return player.querySelectorAll(`#${instrument.id}-control sc-select-track`);
}

function addClass(element: Element | null, className: string): void {
    element?.classList.add(className);
}

function removeClass(element: Element | null, className: string): void {
    element?.classList.remove(className);
}

function activateButton(element: Element): void {
    addClass(element, 'bg-white/50');
}

function deactivateButton(element: Element): void {
    removeClass(element, 'bg-white/50');
}

function otherInstruments(instrument: InstrumentElement): InstrumentElement[] {
    return instruments.filter(
        (other) => other !== null && other?.id !== instrument?.id && isInstrumentElement(other),
    ) as InstrumentElement[];
}

instruments.forEach((instrument) => {
    if (instrument === null || !isInstrumentElement(instrument)) {
        throw new Error('Not supported instrument ' + instrument?.id);
    }

    const relatedTrackSelections = getInstrumentRelatedTrackSelection(instrument);

    relatedTrackSelections.forEach((trackSelection) => {
        trackSelection.addEventListener('click', () => {
            document.querySelectorAll('sc-select-track').forEach(deactivateButton);
            activateButton(trackSelection);

            player.classList.forEach((className) => {
                if (className.includes('-background')) {
                    removeClass(player, className);
                }
            });

            addClass(player, trackSelection.getAttribute('data-background-class') ?? '');
        });
    });

    instrument.addEventListener('click', () => {
        activateButton(instrument);

        // Hide not related track selection
        otherInstruments(instrument).forEach((otherInstrument) => {
            deactivateButton(otherInstrument);

            const trackSelectionContainer = player.querySelector(`#${otherInstrument.id}-control`);
            addClass(trackSelectionContainer, 'hidden');
            removeClass(trackSelectionContainer, 'flex');
        });

        // Show instrument related track selection
        const relatedControl = player.querySelector(`#${instrument.id}-control`);
        addClass(relatedControl, 'flex');
        removeClass(relatedControl, 'hidden');

        // Activate new instrument related track
        const currentTrackSelection = relatedTrackSelections[player.sc.getCurrentTrackIndex() % 5];

        const trackId = parseInt(currentTrackSelection.getAttribute('track-id')!);
        activateButton(currentTrackSelection);

        player.sc.skipTo(trackId);
    });
});
