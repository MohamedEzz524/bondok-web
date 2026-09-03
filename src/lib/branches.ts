/* Bondok branches - 11 locations.
   PLACEHOLDER DATA: names/areas are illustrative; addresses, hotlines,
   WhatsApp numbers, hours, delivery areas/fees/ETA all arrive from the
   client (or via the Cloud-Kitchen API). The UI renders "pending" states
   until each field is filled. */

export interface Branch {
  id: string;
  name: string;
  area: string;
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

export const branches: Branch[] = [
  { id: 'b01', name: 'Bondok Nasr City',     area: 'Nasr City',      ...pending },
  { id: 'b02', name: 'Bondok Heliopolis',    area: 'Heliopolis',     ...pending },
  { id: 'b03', name: 'Bondok Maadi',         area: 'Maadi',          ...pending },
  { id: 'b04', name: 'Bondok Mohandessin',   area: 'Mohandessin',    ...pending },
  { id: 'b05', name: 'Bondok Dokki',         area: 'Dokki',          ...pending },
  { id: 'b06', name: 'Bondok 6th of October',area: '6th of October', ...pending },
  { id: 'b07', name: 'Bondok Sheikh Zayed',  area: 'Sheikh Zayed',   ...pending },
  { id: 'b08', name: 'Bondok New Cairo',     area: 'New Cairo',      ...pending },
  { id: 'b09', name: 'Bondok Shubra',        area: 'Shubra',         ...pending },
  { id: 'b10', name: 'Bondok Alexandria',    area: 'Alexandria',     ...pending },
  { id: 'b11', name: 'Bondok Mansoura',      area: 'Mansoura',       ...pending },
];

/* site-wide contact (sticky buttons); numbers pending from client */
export const CONTACT = {
  hotline: null as string | null,
  whatsapp: null as string | null,
};
