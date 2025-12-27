import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Map, Layout, BookOpen, Users, DollarSign, HelpCircle, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Sitemap: React.FC = () => {
    const sitemapGroups = [
        {
            title: "Marketplace",
            icon: Layout,
            links: [
                { label: "Home", path: "/" },
                { label: "Explore Blueprints", path: "/mvp-kits" },
                { label: "SaaS Kits", path: "/mvp-kits?category=SaaS" },
                { label: "AI & Tools", path: "/mvp-kits?category=AI" },
                { label: "Dashboards", path: "/mvp-kits?category=Dashboard" },
                { label: "Pricing", path: "/pricing" },
            ]
        },
        {
            title: "Company",
            icon: Users,
            links: [
                { label: "About Us", path: "/about" },
                { label: "How It Works", path: "/how-it-works" },
                { label: "Audit Process", path: "/audit-process" },
                { label: "Trust & Security", path: "/trust-security" },
                { label: "Contact Support", path: "/contact" },
            ]
        },
        {
            title: "Resources",
            icon: BookOpen,
            links: [
                { label: "Blog & Insights", path: "/blog" },
                { label: "Documentation", path: "/documentation" },
                { label: "FAQs", path: "/faqs" },
                { label: "Licensing Explained", path: "/licensing" },
                { label: "Revenue Model", path: "/revenue-model" },
            ]
        },
        {
            title: "Legal & Guidelines",
            icon: Shield,
            links: [
                { label: "Terms of Service", path: "/terms" },
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Seller Guidelines", path: "/seller-guidelines" },
                { label: "License Types", path: "/license-types" },
            ]
        },
        {
            title: "Account",
            icon: Users,
            links: [
                { label: "Sign In", path: "/signin" },
                { label: "Create Account", path: "/signup" },
                { label: "Seller Dashboard", path: "/seller" },
                { label: "User Dashboard", path: "/dashboard" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6">
            <Helmet>
                <title>Sitemap | SprintSaaS</title>
                <meta name="description" content="View the complete structure of SprintSaaS. Find blueprints, legal documents, resources, and more." />
            </Helmet>

            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-4">Sitemap</h1>
                    <p className="text-textSecondary text-lg max-w-2xl mx-auto">
                        An overview of all pages available on SprintSaaS.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {sitemapGroups.map((group, index) => (
                        <div key={index} className="bg-surface border border-border rounded-xl p-8 hover:border-accent-primary/20 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-surfaceHighlight flex items-center justify-center text-accent-primary">
                                    <group.icon size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-textMain">{group.title}</h2>
                            </div>
                            <ul className="space-y-3">
                                {group.links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link
                                            to={link.path}
                                            className="text-textMuted hover:text-textMain hover:translate-x-1 transition-all inline-flex items-center"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-border mr-3"></span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-10 border-t border-border text-center">
                    <p className="text-textMuted">
                        Looking for something specific? <Link to="/contact" className="text-accent-primary hover:underline">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sitemap;
