// This is the user-facing app's analytics helper

// We'll set the URL for our new analytics portal
// In a real Vercel deployment, you would set NEXT_PUBLIC_ANALYTICS_API_ENDPOINT
// as an environment variable pointing to your deployed analytics portal.
const ANALYTICS_API_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_API_ENDPOINT || '/api/ingest';

/**
 * Tracks a user event and sends it to the analytics portal.
 * This is a "fire-and-forget" call.
 * @param eventName The name of the event (e.g., 'page_viewed', 'otp_verified')
 * @param payload Extra data for the event
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackEvent = (eventName: string, payload: Record<string, any> = {}) => {
  // We get a persistent, anonymous user ID from localStorage
  // In a real app, this would be a more robust identifier.
  let anonymousId = localStorage.getItem('anonymous_user_id');
  if (!anonymousId) {
    anonymousId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('anonymous_user_id', anonymousId);
  }

  const eventData = {
    event: eventName,
    properties: {
      ...payload,
      anonymousId: anonymousId,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
    },
  };

  // We use `navigator.sendBeacon` if available, as it's designed
  // to send data even if the user is closing the page.
  // This is crucial for tracking drop-offs.
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
      navigator.sendBeacon(ANALYTICS_API_ENDPOINT, blob);
    } else {
      // Fallback to fetch
      fetch(ANALYTICS_API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(eventData),
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }


  // We also log it to the console for easy debugging in the demo
  console.log('📈 ANALYTICS EVENT:', eventData);
};
