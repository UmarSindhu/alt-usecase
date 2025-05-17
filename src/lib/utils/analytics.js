import ReactGA from 'react-ga4';

const GA4_MEASUREMENT_ID = 'G-FHWG8K9F6C'; // Replace with your GA4 ID

export const initGA = () => {
  ReactGA.initialize(GA4_MEASUREMENT_ID);
};

export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};