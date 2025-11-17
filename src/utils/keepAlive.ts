/**
 * Keep-alive utility to prevent Render free tier from spinning down
 * Pings the backend every 10 minutes to keep it warm
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://avalanche-backend.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

let pingInterval: NodeJS.Timeout | null = null;

/**
 * Ping the backend health endpoint to keep it alive
 */
const pingBackend = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('[KeepAlive] Backend pinged successfully');
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.warn('[KeepAlive] Failed to ping backend:', error);
  }
};

/**
 * Start the keep-alive service
 */
export const startKeepAlive = () => {
  if (pingInterval) {
    return; // Already running
  }

  // Ping immediately on start
  pingBackend();

  // Then ping every 10 minutes
  pingInterval = setInterval(pingBackend, PING_INTERVAL);
  console.log('[KeepAlive] Service started');
};

/**
 * Stop the keep-alive service
 */
export const stopKeepAlive = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('[KeepAlive] Service stopped');
  }
};
