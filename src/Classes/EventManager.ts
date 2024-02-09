export class EventManager {
    public static sendFrontEvent<EventDetailsType>(
        type: string,
        details?: EventDetailsType,
    ): void {
        const alpineEvent = new CustomEvent(type, { detail: details ?? {} });
        dispatchEvent(alpineEvent);
    }

    /**
     * Listen to one are more event and apply callback to
     *
     * @param types
     * @param callback
     * @returns
     */
    public static listenEvent<EventDetailsType>(
        types: string | string[],
        callback: (detail: EventDetailsType, event: Event) => void,
    ): void {
        types = Array.isArray(types) ? types : [types];
        types.forEach((type: string) => {
            window.addEventListener(type, function (e: Event) {
                const event = e as Event & { detail: EventDetailsType };
                callback(event.detail, e);
            });
        });
    }
}
