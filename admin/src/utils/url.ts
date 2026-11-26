/**
 * Returns the URL for the Live Storefront.
 * When accessed from a live domain (e.g. esp32.site or custom domain), it opens the current host.
 * When accessed locally (localhost / 127.0.0.1), it opens the live deployed storefront.
 */
export const getLiveStorefrontUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `${window.location.protocol}//${window.location.host}`;
    }
  }
  return 'https://maxitecom.maxapi.esp32.site';
};
