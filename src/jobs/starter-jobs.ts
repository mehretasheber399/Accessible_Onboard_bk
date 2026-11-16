export const SUPPORT_IDS = ['screen', 'step', 'flexible', 'written', 'sign'] as const;

export type SupportId = (typeof SUPPORT_IDS)[number];

export interface StarterJob {
  id: string;
  title: string;
  organization: string;
  location: string;
  summary: string;
  supports: SupportId[];
}

export const STARTER_JOBS: StarterJob[] = [
  {
    id: 'customer-support-assistant',
    title: 'Customer Support Assistant',
    organization: 'Selam Connect',
    location: 'Addis Ababa · Hybrid',
    summary: 'Help customers by phone and message. Training and clear scripts are provided.',
    supports: ['screen', 'flexible'],
  },
  {
    id: 'junior-data-clerk',
    title: 'Junior Data Clerk',
    organization: 'Bright Path Logistics',
    location: 'Remote',
    summary: 'Check and organize simple delivery records from home.',
    supports: ['screen', 'flexible'],
  },
  {
    id: 'workshop-assistant',
    title: 'Workshop Assistant',
    organization: 'Unity Hall',
    location: 'Addis Ababa · On-site',
    summary: 'Welcome learners, set out materials, and keep the room easy to move through.',
    supports: ['step', 'written'],
  },
  {
    id: 'community-guide',
    title: 'Community Guide',
    organization: 'Selam Connect',
    location: 'Addis Ababa · Hybrid',
    summary: 'Share updates in writing and on captioned video calls with a small team.',
    supports: ['written', 'sign', 'flexible'],
  },
];
