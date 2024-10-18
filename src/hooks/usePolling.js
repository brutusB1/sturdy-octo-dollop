// src/hooks/usePolling.js

import { useRef } from 'react';

const usePolling = () => {
  const pollingRef = useRef(null);

  const startPolling = (callback, interval) => {
    if (pollingRef.current) return; // Prevent multiple polling intervals
    pollingRef.current = setInterval(callback, interval);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  return { startPolling, stopPolling };
};

export default usePolling; // ES6 default export
