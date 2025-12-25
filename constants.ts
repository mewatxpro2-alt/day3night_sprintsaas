import { Listing } from './types';

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'fees-ledger',
    title: 'Fintech Ledger OS',
    description: 'Double-entry accounting system with audit logs. Save 3 months of backend logic work.',
    price: 129,
    image: 'https://picsum.photos/800/600?random=99',
    category: 'Fintech',
    techStack: ['Next.js', 'PostgreSQL', 'Tailwind'],
    likes: 84,
    views: 3200,
    isLive: true,
    featured: true,
    previewUrl: 'https://agent-694c2b7befaca990--heartfelt-baklava-cbef9a.netlify.app/',
    creator: {
      id: 'c1',
      name: 'ShipFast Studios',
      avatar: 'https://picsum.photos/100/100?random=10',
      verified: true,
      rating: 4.9
    }
  },
  {
    id: '1',
    title: 'Enterprise SaaS Starter',
    description: 'The standard for B2B apps. Includes Multi-tenancy, RBAC, and Stripe Billing pre-configured.',
    price: 149,
    image: 'https://picsum.photos/800/600?random=1',
    category: 'SaaS',
    techStack: ['Next.js 14', 'Supabase', 'Stripe'],
    likes: 342,
    views: 12500,
    isLive: true,
    featured: true,
    previewUrl: 'https://agent-694c2b7befaca990--heartfelt-baklava-cbef9a.netlify.app/',
    creator: {
      id: 'c1',
      name: 'ShipFast Studios',
      avatar: 'https://picsum.photos/100/100?random=10',
      verified: true,
      rating: 4.9
    }
  },
  {
    id: '2',
    title: 'Creator Portfolio OS',
    description: 'Deploy a high-converting portfolio in minutes. CMS-ready for case studies and digital products.',
    price: 69,
    image: 'https://picsum.photos/800/600?random=2',
    category: 'Portfolio',
    techStack: ['Framer', 'React', 'Notion API'],
    likes: 89,
    views: 4300,
    isLive: true,
    previewUrl: 'https://example.com',
    creator: {
      id: 'c2',
      name: 'Mono Systems',
      avatar: 'https://picsum.photos/100/100?random=11',
      verified: true,
      rating: 4.8
    }
  },
  {
    id: '3',
    title: 'Marketplace Core',
    description: 'Complete multi-vendor logic. User profiles, listings, and payout splits ready to ship.',
    price: 249,
    image: 'https://picsum.photos/800/600?random=3',
    category: 'E-commerce',
    techStack: ['Node.js', 'Postgres', 'React'],
    likes: 210,
    views: 8900,
    isLive: false,
    creator: {
      id: 'c3',
      name: 'Commerce Core',
      avatar: 'https://picsum.photos/100/100?random=12',
      verified: false,
      rating: 4.5
    }
  },
  {
    id: '4',
    title: 'Web3 Launchpad',
    description: 'High-trust crypto landing page. Includes wallet connect and roadmap modules.',
    price: 49,
    image: 'https://picsum.photos/800/600?random=4',
    category: 'Landing',
    techStack: ['React', 'Wagmi', 'Tailwind'],
    likes: 156,
    views: 6700,
    isLive: true,
    creator: {
      id: 'c1',
      name: 'ShipFast Studios',
      avatar: 'https://picsum.photos/100/100?random=10',
      verified: true,
      rating: 4.9
    }
  },
  {
    id: '5',
    title: 'Client Portal System',
    description: 'Replace email threads. A secure dashboard for agencies to manage deliverables and invoices.',
    price: 199,
    image: 'https://picsum.photos/800/600?random=5',
    category: 'Agency',
    techStack: ['Laravel', 'Vue', 'Inertia'],
    likes: 56,
    views: 2100,
    isLive: true,
    creator: {
      id: 'c4',
      name: 'System UI',
      avatar: 'https://picsum.photos/100/100?random=13',
      verified: true,
      rating: 5.0
    }
  },
  {
    id: '6',
    title: 'Docs Platform Pro',
    description: 'Beautiful documentation site with full-text search. Keep your users unblocked.',
    price: 0,
    image: 'https://picsum.photos/800/600?random=6',
    category: 'SaaS',
    techStack: ['NextRA', 'MDX'],
    likes: 890,
    views: 45000,
    isLive: true,
    featured: true,
    creator: {
      id: 'c5',
      name: 'OpenSource',
      avatar: 'https://picsum.photos/100/100?random=14',
      verified: true,
      rating: 4.7
    }
  }
];

export const NAV_LINKS = [
  { label: 'MVP Kits', href: '#explore' },
  { label: 'Use Cases', href: '#categories' },
  { label: 'Pricing', href: '#pricing' },
];