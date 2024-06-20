/**
 * EventService is a utility class for sending and listening to events.
 */
export class EventService {
    /**
     * Sends an event with the specified type and optional details.
     *
     * @param {string} type - The type of the event.
     * @param {TEventDetails} [details] - Optional details associated with the event.
     * @returns {boolean} - Returns a boolean indicating whether the event was successfully */
    public static sendEvent<TEventDetails>(type: string, details?: TEventDetails): boolean {
        return dispatchEvent(new CustomEvent(type, { detail: details ?? {} }));
    }

    /**
     * Listens for specified event types and executes the provided callback function when the event occurs.
     *
     * @param {string|string[]} types - The type or types of events to listen for.
     * @param {function} callback - The function to be called when the event occurs.
     * It accepts two parameters: the event details and the event object.
     * @template TEventDetails - The type of the event details.
     *
     * @return {void}
     */
    public static listenEvent<TEventDetails>(
        types: string | string[],
        callback: (detail: TEventDetails, event: Event) => void,
    ): void {
        types = Array.isArray(types) ? types : [types];
        types.forEach((type: string) => {
            window.addEventListener(type, function (e: Event) {
                const event = e as Event & { detail: TEventDetails };
                callback(event.detail, e);
            });
        });
    }
}
