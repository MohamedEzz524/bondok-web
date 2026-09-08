/* SAMPLE branch display data for the designer-approved branches page.
   Everything here is illustrative until the client sends real per-branch
   data (or it syncs from the Cloud-Kitchen API): addresses, hours, live
   status, kitchen pace, distances, and service features. Keyed by the ids
   in lib/branches.ts, which stays the single source of truth. */

export interface BranchSample {
  address: string;
  status: string;          // "Open Now" | "Open until Midnight" | ...
  closes: string;          // "Closes at 2:00 AM"
  distance: string;        // "0.4 km"
  walk: string;            // "~8 min walk"
  pace: string;            // "Normal" | "Busy"
  wait: string;            // "10-14 min wait"
  pacePct: number;         // progress bar fill
  note: string;            // compact-card right label
  features: string[];      // filter tags
  role?: string;           // "FLAGSHIP STORE"
}

export const branchSamples: Record<string, BranchSample> = {
  b01: {
    address: 'Abbas El Akkad St, Nasr City, Cairo',
    status: 'Open Now', closes: 'Closes at 2:00 AM',
    distance: '0.4 km', walk: '~8 min walk',
    pace: 'Normal', wait: '10-14 min wait', pacePct: 32,
    note: 'Pickup in 15 min',
    features: ['late', 'dinein', 'curbside'],
    role: 'Flagship Store',
  },
  b02: {
    address: 'El Merghany St, Heliopolis, Cairo',
    status: 'Open until Midnight', closes: 'Closes at 12:00 AM',
    distance: '1.1 km', walk: '~14 min walk',
    pace: 'Normal', wait: '8-12 min wait', pacePct: 26,
    note: 'Pickup in 15 min',
    features: ['dinein', 'curbside'],
  },
  b03: {
    address: 'Road 9, Maadi, Cairo',
    status: 'Open · Late Night Window', closes: 'Closes at 3:00 AM',
    distance: '0.9 km', walk: '~12 min walk',
    pace: 'Busy', wait: '15-20 min wait', pacePct: 64,
    note: 'Walk-up only',
    features: ['late'],
  },
  b04: {
    address: 'Gameat El Dewal St, Mohandessin, Giza',
    status: 'Drive-Thru & Counter', closes: 'Closes at 1:00 AM',
    distance: '1.8 km', walk: '~22 min walk',
    pace: 'Normal', wait: '6-10 min wait', pacePct: 22,
    note: 'Fast-lane ready',
    features: ['drivethru', 'late'],
  },
  b05: {
    address: 'Tahrir St, Dokki, Giza',
    status: 'Open Now', closes: 'Closes at 1:00 AM',
    distance: '2.2 km', walk: '~26 min walk',
    pace: 'Normal', wait: '10-14 min wait', pacePct: 35,
    note: 'Pickup in 20 min',
    features: ['dinein'],
  },
  b06: {
    address: 'El Hosary Square, 6th of October, Giza',
    status: 'Open Now', closes: 'Closes at 2:00 AM',
    distance: '9.4 km', walk: 'Drive ~15 min',
    pace: 'Normal', wait: '8-12 min wait', pacePct: 28,
    note: 'Drive-thru open',
    features: ['drivethru', 'late', 'curbside'],
  },
  b07: {
    address: 'Zayed Central Mall, Sheikh Zayed, Giza',
    status: 'Open Now', closes: 'Closes at 12:00 AM',
    distance: '11 km', walk: 'Drive ~18 min',
    pace: 'Normal', wait: '10-14 min wait', pacePct: 30,
    note: 'Dine-in & takeaway',
    features: ['dinein', 'curbside'],
  },
  b08: {
    address: '90th St, New Cairo, Cairo',
    status: 'Rooftop Lounge & Dine-in', closes: 'Closes at 2:00 AM',
    distance: '12 km', walk: 'Drive ~20 min',
    pace: 'Busy', wait: '12-18 min wait', pacePct: 58,
    note: 'Crowd: moderate',
    features: ['dinein', 'late'],
  },
  b09: {
    address: 'Shubra St, Shubra, Cairo',
    status: 'Open Now', closes: 'Closes at 1:00 AM',
    distance: '6.5 km', walk: 'Drive ~12 min',
    pace: 'Normal', wait: '8-12 min wait', pacePct: 25,
    note: 'Pickup in 15 min',
    features: ['curbside'],
  },
  b10: {
    address: 'Fouad St, Raml Station, Alexandria',
    status: 'Open Now', closes: 'Closes at 2:00 AM',
    distance: 'Alexandria', walk: '',
    pace: 'Normal', wait: '10-14 min wait', pacePct: 34,
    note: 'Dine-in & takeaway',
    features: ['dinein', 'late'],
  },
  b11: {
    address: 'El Geish St, Mansoura',
    status: 'Open Now', closes: 'Closes at 1:00 AM',
    distance: 'Mansoura', walk: '',
    pace: 'Normal', wait: '8-12 min wait', pacePct: 27,
    note: 'Pickup in 15 min',
    features: ['curbside', 'dinein'],
  },
};

export const BRANCH_FILTERS = [
  { key: 'all', label: 'All Kitchens' },
  { key: 'late', label: 'Open Now (Late Night)' },
  { key: 'drivethru', label: 'Drive-thru' },
  { key: 'dinein', label: 'Dine-in' },
  { key: 'curbside', label: 'Curbside Pickup' },
];
