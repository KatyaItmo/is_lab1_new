import { useEffect, useRef } from 'react';

export function useWebSocket(enabled, onMessage) {
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let socket = null;
        let reconnectTimer = null;
        let isUnmounted = false;

        const connect = () => {
            if (isUnmounted) return;

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const appPrefix = window.location.pathname.replace(/\/$/, '');
            const wsUrl = `${protocol}//${window.location.host}${appPrefix}/ws/updates`;

            socket = new WebSocket(wsUrl);

            socket.onmessage = (event) => {
                if (onMessageRef.current) {
                    onMessageRef.current(event.data);
                }
            };

            socket.onclose = () => {
                if (!isUnmounted) {
                    reconnectTimer = setTimeout(connect, 3000);
                }
            };

            socket.onerror = () => {
                socket.close();
            };
        };

        connect();

        return () => {
            isUnmounted = true;
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }
            if (socket) {
                socket.close();
            }
        };
    }, [enabled]);
}
