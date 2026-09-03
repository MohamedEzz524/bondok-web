/* Legal & info page contents.
   PLACEHOLDERS: the client's official texts get pasted here (one place),
   and every legal page renders them automatically. */

export interface LegalSection {
  heading?: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  updated?: string;          // e.g. "January 2026" - set when client text arrives
  sections: LegalSection[];
  pending: boolean;          // true until official text is provided
}

const pendingDoc = (title: string, note: string): LegalDoc => ({
  title,
  pending: true,
  sections: [{ body: note }],
});

export const legalDocs: Record<string, LegalDoc> = {
  terms: pendingDoc(
    'Terms of Service',
    'The official Terms of Service are being prepared with Bondok and will be published here before launch.',
  ),
  privacy: pendingDoc(
    'Privacy Policy',
    'The official Privacy Policy (including how phone numbers and addresses are stored and used) is being prepared and will be published here before launch.',
  ),
  'delivery-terms': pendingDoc(
    'Delivery Terms',
    'Delivery areas, fees, minimums and estimated times are being finalized per branch and will be published here.',
  ),
  'offer-terms': pendingDoc(
    'Offer Terms',
    'Terms and conditions for promotions and offers will be published here when the first offers go live.',
  ),
  'nutritional-information': pendingDoc(
    'Nutrition & Allergen Information',
    'Nutrition values and allergen details for every product are being compiled with Bondok and will be published here.',
  ),
  careers: pendingDoc(
    "We're Hiring",
    'Open positions across our branches will be posted here. Meanwhile, you can leave your details at any branch.',
  ),
  franchise: pendingDoc(
    'Open A Bondok',
    'Franchise information and application details will be published here.',
  ),
  catering: pendingDoc(
    'Catering',
    'Feeding a crowd? Bondok catering details, packages, and how to order ahead for events will be published here.',
  ),
};
