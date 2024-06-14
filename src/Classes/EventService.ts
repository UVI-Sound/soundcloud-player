export class EventService {
    public static sendEvent<TEventDetails>(
        type: string,
        details?: TEventDetails,
    ): boolean {
        return dispatchEvent(new CustomEvent(type, { detail: details ?? {} }));
    }

    /**
     * Listen to one are more event and apply callback to
     *
     * @param types
     * @param callback
     * @returns
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
