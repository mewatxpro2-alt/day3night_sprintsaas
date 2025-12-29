import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, FileCode, Server, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const SellerGuidelines: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <PageHeader
                title="Seller Guidelines."
                description="We curate for quality. SprintSaaS is not a dumping ground for unfinished side projects. To sell here, your code must be production-ready."
                tag="Quality Standards"
                gradient="from-blue-500/20 to-transparent"
            />

            <div className="px-6 max-w-7xl mx-auto pb-24 animate-slide-up">
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                    {/* Code Quality Card */}
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-8 rounded-3xl hover:border-blue-500/20 dark:hover:bg-white/[0.04] transition-colors group shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400">
                                <FileCode size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Code Quality</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <CheckCircle2 className="text-blue-500 mt-0.5 shrink-0" size={18} />
                                <span className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">Clean, commented code with consistent formatting (Prettier/ESLint).</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="text-blue-500 mt-0.5 shrink-0" size={18} />
                                <span className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">No hardcoded secrets or sensitive API keys. Environment variables must be used.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="text-blue-500 mt-0.5 shrink-0" size={18} />
                                <span className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">Modern stack usage (e.g., React hooks over classes, Server Actions over legacy patterns).</span>
                            </li>
                        </ul>
                    </div>

                    {/* Functionality Card */}
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-8 rounded-3xl hover:border-purple-500/20 dark:hover:bg-white/[0.04] transition-colors group shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 dark:text-purple-400">
                                <Server size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Functionality</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <CheckCircle2 className="text-purple-500 mt-0.5 shrink-0" size={18} />
                                <span className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">Must include a comprehensive README with setup commands.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="text-purple-500 mt-0.5 shrink-0" size={18} />
                                <span className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">Database schema/migrations must be included and working.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 className="text-purple-500 mt-0.5 shrink-0" size={18} />
                                <span className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">Live demo link is mandatory and must match the codebase features.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Rejection Section */}
                <div className="max-w-3xl mx-auto mb-20">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8 text-center">Common Rejection Reasons</h2>
                    <div className="space-y-4">
                        <div className="flex gap-5 p-6 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl">
                            <ShieldAlert className="text-red-500 dark:text-red-400 shrink-0" size={24} />
                            <div>
                                <strong className="text-red-800 dark:text-red-200 block mb-1">Spaghetti Code</strong>
                                <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">Unorganized files, massive components, or mixed logic that makes the codebase impossible to maintain.</p>
                            </div>
                        </div>
                        <div className="flex gap-5 p-6 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl">
                            <ShieldAlert className="text-red-500 dark:text-red-400 shrink-0" size={24} />
                            <div>
                                <strong className="text-red-800 dark:text-red-200 block mb-1">Broken Demo</strong>
                                <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">If the live demo throws 500 errors or has broken flows, we assume the code will too.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Process Teaser */}
                <div className="max-w-4xl mx-auto bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-lg dark:shadow-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-50" />

                    <Cpu size={32} className="text-accent-primary mx-auto mb-6" />
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">Manual Engineering Review</h2>
                    <p className="text-gray-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
                        Every submission is inspected by our engineering team. We clone the repo, run the build, and audit the architecture before approval. Review takes 24-48 hours.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Button onClick={() => navigate('/submit')}>
                            Submit Your Kit <ArrowRight size={16} className="ml-2" />
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/revenue-model')}>
                            View Revenue Model
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerGuidelines;
