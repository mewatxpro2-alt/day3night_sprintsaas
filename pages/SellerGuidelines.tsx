import React from 'react';
import { CheckCircle2, AlertCircle, FileCode, Server, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const SellerGuidelines: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6">
                    Seller Guidelines
                </h1>
                <p className="text-xl text-textSecondary mb-12 leading-relaxed">
                    We curate for quality. SprintSaaS is not a dumping ground for unfinished side projects.
                    To sell here, your code must be production-ready.
                </p>

                {/* Requirements Grid */}
                <div className="grid gap-6 mb-16">
                    <div className="bg-surface border border-border p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <FileCode className="text-accent-primary" size={24} />
                            <h3 className="text-lg font-bold text-textMain">Code Quality</h3>
                        </div>
                        <ul className="space-y-3 text-textMuted">
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-1 text-green-500 shrink-0" /> <span>Clean, commented code with consistent formatting (Prettier/ESLint).</span></li>
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-1 text-green-500 shrink-0" /> <span>No hardcoded secrets or sensitive API keys.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-1 text-green-500 shrink-0" /> <span>Modern stack usage (e.g., React hooks, not class components; Server Actions, not legacy PHP patterns).</span></li>
                        </ul>
                    </div>

                    <div className="bg-surface border border-border p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Server className="text-accent-secondary" size={24} />
                            <h3 className="text-lg font-bold text-textMain">Functionality</h3>
                        </div>
                        <ul className="space-y-3 text-textMuted">
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-1 text-green-500 shrink-0" /> <span>Must include a working README with setup instructions.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-1 text-green-500 shrink-0" /> <span>Database schema/migrations must be included.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-1 text-green-500 shrink-0" /> <span>Live demo link is mandatory.</span></li>
                        </ul>
                    </div>
                </div>

                {/* Rejection Reasons */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-textMain mb-6">Common Rejection Reasons</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <AlertCircle className="text-red-400 shrink-0" size={20} />
                            <p className="text-textMuted"><strong>Spaghetti Code:</strong> Unorganized, massive files, or mixed logic that makes the codebase impossible to maintain.</p>
                        </div>
                        <div className="flex gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <AlertCircle className="text-red-400 shrink-0" size={20} />
                            <p className="text-textMuted"><strong>Broken Demo:</strong> If the live demo throws errors or doesn't work, we assume the code won't work either.</p>
                        </div>
                        <div className="flex gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <AlertCircle className="text-red-400 shrink-0" size={20} />
                            <p className="text-textMuted"><strong>Copyright Infringement:</strong> Using assets, themes, or code you do not have rights to sell.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-textMain mb-4">The Audit Process</h2>
                    <p className="text-textMuted leading-relaxed">
                        Every submission is manually reviewed by our engineering team. We check the repository structure, run the build command, and verify the features listed. This process takes 24-48 hours.
                    </p>
                </section>

                <div className="flex gap-4 border-t border-border pt-8">
                    <Button onClick={() => navigate('/submit')}>
                        Submit Your Kit <ArrowRight size={16} className="ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/revenue-model')}>
                        View Revenue Model
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SellerGuidelines;
