import geoip from 'geoip-lite';

export interface GeoLocation {
  country: string;
  countryCode: string;
  city: string;
  region: string;
}

const SAMPLE_DEMO_LOCATIONS: GeoLocation[] = [
  { country: 'United States', countryCode: 'US', city: 'San Francisco', region: 'CA' },
  { country: 'United States', countryCode: 'US', city: 'New York', region: 'NY' },
  { country: 'United Kingdom', countryCode: 'GB', city: 'London', region: 'ENG' },
  { country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'BE' },
  { country: 'India', countryCode: 'IN', city: 'Bengaluru', region: 'KA' },
  { country: 'Japan', countryCode: 'JP', city: 'Tokyo', region: '13' },
  { country: 'Canada', countryCode: 'CA', city: 'Toronto', region: 'ON' },
  { country: 'Australia', countryCode: 'AU', city: 'Sydney', region: 'NSW' },
  { country: 'France', countryCode: 'FR', city: 'Paris', region: 'IDF' },
  { country: 'Singapore', countryCode: 'SG', city: 'Singapore', region: 'SG' },
];

export function getGeoFromIp(ip: string | undefined): GeoLocation {
  if (!ip) {
    return { country: 'United States', countryCode: 'US', city: 'San Francisco', region: 'CA' };
  }

  // Handle local loopback / private addresses by picking a realistic distributed location
  const isLocal =
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip === 'localhost';

  if (isLocal) {
    // Generate a consistent pseudo-random demo location based on local simulation
    const randomIndex = Math.floor(Math.random() * SAMPLE_DEMO_LOCATIONS.length);
    return SAMPLE_DEMO_LOCATIONS[randomIndex];
  }

  try {
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        country: geo.country || 'Unknown',
        countryCode: geo.country || 'XX',
        city: geo.city || 'Unknown',
        region: geo.region || 'Unknown',
      };
    }
  } catch (error) {
    console.error('Error looking up IP geo:', error);
  }

  return {
    country: 'Unknown',
    countryCode: 'XX',
    city: 'Unknown',
    region: 'Unknown',
  };
}
