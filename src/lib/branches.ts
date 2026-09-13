/* Bondok branches - 11 locations.
   PLACEHOLDER DATA: names/areas are illustrative; addresses, hotlines,
   WhatsApp numbers, hours, delivery areas/fees/ETA all arrive from the
   client (or via the Cloud-Kitchen API). The UI renders "pending" states
   until each field is filled. */

export interface Branch {
  id: string;
  name: string;
  area: string;
  governorate: string;           // e.g. "Cairo", "Giza" - drives the checkout area picker
  city: string;                  // the branch's home city/district
  cities: string[];              // districts/cities this branch delivers to (coverage)
  address: string | null;
  hotline: string | null;        // click-to-call
  whatsapp: string | null;       // wa.me number
  hours: string | null;          // e.g. "10:00 - 02:00"
  deliveryAreas: string | null;  // short description of coverage
  mapUrl: string | null;         // Google Maps link
}

const pending = {
  address: null, hotline: null, whatsapp: null,
  hours: null, deliveryAreas: null, mapUrl: null,
};

/* governorate + city + coverage cities are illustrative placeholders alongside the
   sample coords; real coverage (which governorates/cities each branch serves)
   arrives from the client or the Cloud-Kitchen API. Coverage lists intentionally
   OVERLAP — a city can be served by several branches (shared zones), so the
   picker shows every branch that reaches that city, not just one. */
export const branches: Branch[] = [
  { id: 'b01', name: 'Bondok Nasr City',     area: 'Nasr City',      governorate: 'Cairo',      city: 'Nasr City',      cities: ['Nasr City', 'Madinaty', 'Rehab', 'Sheraton', 'Ain Shams', 'Heliopolis'],       ...pending },
  { id: 'b02', name: 'Bondok Heliopolis',    area: 'Heliopolis',     governorate: 'Cairo',      city: 'Heliopolis',     cities: ['Heliopolis', 'Roxy', 'El Nozha', 'Almaza', 'Masr El Gedida', 'Nasr City', 'Ain Shams'], ...pending },
  { id: 'b03', name: 'Bondok Maadi',         area: 'Maadi',          governorate: 'Cairo',      city: 'Maadi',          cities: ['Maadi', 'Zahraa El Maadi', 'El Basateen', 'Tura', 'Dar El Salam', 'New Cairo'], ...pending },
  { id: 'b04', name: 'Bondok Mohandessin',   area: 'Mohandessin',    governorate: 'Giza',       city: 'Mohandessin',    cities: ['Mohandessin', 'Agouza', 'Kit Kat', 'Imbaba', 'Dokki'],                ...pending },
  { id: 'b05', name: 'Bondok Dokki',         area: 'Dokki',          governorate: 'Giza',       city: 'Dokki',          cities: ['Dokki', 'Giza Square', 'El Manial', 'El Haram', 'Mohandessin'],       ...pending },
  { id: 'b06', name: 'Bondok 6th of October',area: '6th of October', governorate: 'Giza',       city: '6th of October', cities: ['6th of October', 'El Hosary', 'Dreamland', 'El Motamayez', 'Sheikh Zayed'], ...pending },
  { id: 'b07', name: 'Bondok Sheikh Zayed',  area: 'Sheikh Zayed',   governorate: 'Giza',       city: 'Sheikh Zayed',   cities: ['Sheikh Zayed', 'Beverly Hills', 'Zayed 2000', 'El Rabwa', '6th of October'], ...pending },
  { id: 'b08', name: 'Bondok New Cairo',     area: 'New Cairo',      governorate: 'Cairo',      city: 'New Cairo',      cities: ['New Cairo', 'Fifth Settlement', 'Katameya', 'El Tagamoa', 'El Rehab', 'Madinaty'], ...pending },
  { id: 'b09', name: 'Bondok Shubra',        area: 'Shubra',         governorate: 'Cairo',      city: 'Shubra',         cities: ['Shubra', 'Rod El Farag', 'El Sahel', 'Shubra El Kheima'],             ...pending },
  { id: 'b10', name: 'Bondok Alexandria',    area: 'Alexandria',     governorate: 'Alexandria', city: 'Alexandria',     cities: ['Raml Station', 'Smouha', 'Miami', 'Sidi Gaber', 'Sporting', 'Stanley'], ...pending },
  { id: 'b11', name: 'Bondok Mansoura',      area: 'Mansoura',       governorate: 'Dakahlia',   city: 'Mansoura',       cities: ['Mansoura', 'Talkha', 'Mit Khamis', 'El Gomhouria St'],                ...pending },
];

/* --- area helpers for the checkout branch picker (governorate -> city -> branch) --- */

/* governorates that currently have at least one deliverable branch */
export const GOVERNORATES: string[] = [...new Set(branches.map((b) => b.governorate))];

/* covered cities/districts (across every branch) inside a governorate */
export function citiesIn(governorate: string): string[] {
  const set = new Set<string>();
  branches.filter((b) => b.governorate === governorate).forEach((b) => b.cities.forEach((c) => set.add(c)));
  return [...set];
}

/* branches serving a governorate (optionally narrowed to those covering one city) */
export function branchesIn(governorate: string, city?: string): Branch[] {
  return branches.filter((b) => b.governorate === governorate && (!city || b.cities.includes(city)));
}

/* site-wide contact (sticky buttons); numbers pending from client */
export const CONTACT = {
  hotline: null as string | null,
  whatsapp: null as string | null,
};
