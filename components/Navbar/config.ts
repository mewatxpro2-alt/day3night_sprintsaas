
import {
    ShoppingBag,
    Lightbulb,
    BookOpen,
    HelpCircle,
    Building,
    Rocket,
    ShieldCheck,
    FileText,
    CreditCard,
    MessageSquare
} from 'lucide-react';

export interface NavItem {
    label: string;
    path: string;
    description?: string;
    icon?: any;
}

export interface NavSection {
    label: string;
    items: NavItem[];
}

export interface NavGroup {
    id: string;
    label: string;
    sections?: NavSection[]; // For multi-column or grouped dropdowns
    items?: NavItem[];       // For simple lists
}

export const MAIN_NAV: NavGroup[] = [
    {
        id: 'products',
        label: 'Products',
        sections: [
            {
                label: 'Marketplace',
                items: [
                    {
                        label: 'Browse Blueprints',
                        path: '/mvp-kits',
                        description: 'Production-ready SaaS codebases',
                        icon: ShoppingBag
                    },
                    {
                        label: 'New Arrivals',
                        path: '/mvp-kits?sort=new',
                        description: 'Latest additions to the catalogue',
                        icon: Rocket
                    },
                ]
            },
            {
                label: 'Use Cases',
                items: [
                    {
                        label: 'Profit Models',
                        path: '/use-cases',
                        description: 'Explore business models',
                        icon: Lightbulb
                    },
                    {
                        label: 'AI Wrappers',
                        path: '/mvp-kits?category=ai',
                        description: 'Launch AI apps fast',
                        icon: Rocket
                    }
                ]
            }
        ]
    },
    {
        id: 'how-it-works',
        label: 'How It Works',
        items: [
            {
                label: 'Buying Guide',
                path: '/how-it-works',
                description: 'How to buy and launch',
                icon: BookOpen
            },
            {
                label: 'Licensing Models',
                path: '/licensing',
                description: 'Understand rights & usage',
                icon: FileText
            },
            {
                label: 'Trust & Quality',
                path: '/audit-process',
                description: 'Our verification standards',
                icon: ShieldCheck
            },
            {
                label: 'For Sellers',
                path: '/seller-guidelines',
                description: 'How to sell your code',
                icon: CreditCard
            }
        ]
    },
    {
        id: 'resources',
        label: 'Resources',
        items: [
            {
                label: 'Blog',
                path: '/blog',
                description: 'Guides & Case Studies',
                icon: BookOpen
            },
            {
                label: 'Documentation',
                path: '/documentation',
                description: 'Technical implementation guides',
                icon: FileText
            },
            {
                label: 'Help Center',
                path: '/faqs',
                description: 'Frequently asked questions',
                icon: HelpCircle
            }
        ]
    },
    {
        id: 'company',
        label: 'Company',
        items: [
            {
                label: 'About Us',
                path: '/about',
                description: 'Our mission and story',
                icon: Building
            },
            {
                label: 'Contact',
                path: '/contact',
                description: 'Get in touch with support',
                icon: MessageSquare
            },
            {
                label: 'Trust & Security',
                path: '/trust-security',
                description: 'How we protect you',
                icon: ShieldCheck
            }
        ]
    }
];
