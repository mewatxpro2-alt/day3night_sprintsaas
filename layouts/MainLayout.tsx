import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar/index';
import Button from '../components/Button';
import Logo from '../components/Logo';
import PlatformAbout from '../components/PlatformAbout';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-textMain font-sans selection:bg-accent selection:text-black">
            <Navbar />

            {/* Page Content */}
            <div className="min-h-[calc(100vh-400px)] pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>

            {/* Extended Footer Section */}
            <PlatformAbout />

            {/* Footer */}
            <footer className="bg-surface pt-0 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Main Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12 mb-20">
                        {/* Branding & What We Sell */}
                        <div className="col-span-2 md:col-span-3 lg:col-span-1">
                            <div className="mb-6">
                                <Logo variant="primary" size="lg" />
                            </div>
                            <p className="text-textMuted text-sm leading-relaxed mb-6 font-medium">
                                Production-ready B2B SaaS applications — dashboards, platforms, and monetized MVPs.
                            </p>
                            <div className="flex gap-4">
                                {/* Social placeholders */}
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-textMuted hover:text-textMain hover:border-accent-primary transition-all">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                </a>
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-textMuted hover:text-textMain hover:border-accent-primary transition-all">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                                </a>
                            </div>
                        </div>

                        {/* For Buyers */}
                        <div>
                            <h4 className="font-bold text-textMain mb-6 text-sm uppercase tracking-wide">For Buyers</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/mvp-kits?category=SaaS" className="text-textMuted hover:text-textMain transition-colors">B2B SaaS Blueprints</Link></li>
                                <li><Link to="/mvp-kits?category=Marketing" className="text-textMuted hover:text-textMain transition-colors">Landing Page SaaS</Link></li>
                                <li><Link to="/mvp-kits?category=Dashboard" className="text-textMuted hover:text-textMain transition-colors">Dashboards & Admin Panels</Link></li>
                                <li><Link to="/mvp-kits?category=AI" className="text-textMuted hover:text-textMain transition-colors">AI & Fintech Systems</Link></li>
                                <li><Link to="/how-it-works" className="text-textMuted hover:text-textMain transition-colors font-medium text-accent-primary">How Buying Works</Link></li>
                            </ul>
                        </div>

                        {/* For Sellers */}
                        <div>
                            <h4 className="font-bold text-textMain mb-6 text-sm uppercase tracking-wide">For Sellers</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/submit" className="text-textMuted hover:text-textMain transition-colors">Submit a Kit</Link></li>
                                <li><Link to="/seller-guidelines" className="text-textMuted hover:text-textMain transition-colors">Seller Guidelines</Link></li>
                                <li><Link to="/revenue-model" className="text-textMuted hover:text-textMain transition-colors">Revenue Model</Link></li>
                                <li><Link to="/license-types" className="text-textMuted hover:text-textMain transition-colors">License Types</Link></li>
                                <li><Link to="/seller" className="text-textMuted hover:text-textMain transition-colors">Seller Dashboard</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="font-bold text-textMain mb-6 text-sm uppercase tracking-wide">Resources</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/licensing" className="text-textMuted hover:text-textMain transition-colors">Licensing Explained</Link></li>
                                <li><Link to="/documentation" className="text-textMuted hover:text-textMain transition-colors">Documentation</Link></li>
                                <li><Link to="/faqs" className="text-textMuted hover:text-textMain transition-colors">FAQs</Link></li>
                                <li><Link to="/blog" className="text-textMuted hover:text-textMain transition-colors">Blog & Updates</Link></li>
                                <li><Link to="/contact" className="text-textMuted hover:text-textMain transition-colors">Support</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="font-bold text-textMain mb-6 text-sm uppercase tracking-wide">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/about" className="text-textMuted hover:text-textMain transition-colors">About SprintSaaS</Link></li>
                                <li><Link to="/audit-process" className="text-textMuted hover:text-textMain transition-colors">How We Audit</Link></li>
                                <li><Link to="/trust-security" className="text-textMuted hover:text-textMain transition-colors">Trust & Security</Link></li>
                                <li><Link to="/terms" className="text-textMuted hover:text-textMain transition-colors">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="text-textMuted hover:text-textMain transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-textMuted">
                        <div className="flex items-center gap-1">
                            <span>© {new Date().getFullYear()} SprintSaaS Inc. All rights reserved.</span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center gap-1.5 status-indicator">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                All systems operational
                            </span>
                        </div>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-textMain transition-colors">Privacy</Link>
                            <Link to="/terms" className="hover:text-textMain transition-colors">Terms</Link>
                            <Link to="/sitemap" className="hover:text-textMain transition-colors">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
