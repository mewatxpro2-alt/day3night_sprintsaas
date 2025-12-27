import React from 'react';
import { Search, Shield, Database, Cpu, FileJson, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const AuditProcess: React.FC = () => {
    const navigate = useNavigate();

    const auditSteps = [
        {
            icon: Shield,
            title: "1. Security Scan",
            desc: "We scan for hardcoded secrets, exposed API keys, and known vulnerabilities (CVEs) in all dependencies."
        },
        {
            icon: FileJson,
            title: "2. Structure & Linting",
            desc: "We verify the project structure follows industry best practices (e.g. Next.js App Router conventions) and use ESLint/Prettier."
        },
        {
            icon: Database,
            title: "3. Database Integrity",
            desc: "We check that full migration files are included and the schema is normalized and scalable."
        },
        {
            icon: Cpu,
            title: "4. Build Verification",
            desc: "We clone the repo and run a fresh build in an isolated environment. If it doesn't build, it doesn't list."
        },
        {
            icon: Search,
            title: "5. Manual Code Review",
            desc: "A senior engineer reviews complex logic to ensure it's not just 'working' but maintainable for you."
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6 text-center">
                    How We Audit
                </h1>
                <p className="text-xl text-textSecondary mb-16 text-center max-w-2xl mx-auto leading-relaxed">
                    We don't just host zip files. We verify engineering quality.
                    Every blueprint on SprintSaaS generally passes a rigorous 5-point inspection.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {auditSteps.map((step, index) => (
                        <div key={index} className="bg-surface border border-border p-6 rounded-xl hover:border-accent-primary/30 transition-all group hover:-translate-y-1 duration-300">
                            <div className="w-12 h-12 bg-surfaceHighlight rounded-lg flex items-center justify-center mb-4 text-textMain group-hover:text-accent-primary transition-colors">
                                <step.icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-textMain mb-3">{step.title}</h3>
                            <p className="text-textMuted text-sm leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-surfaceHighlight/50 border border-border rounded-xl p-8 mb-16">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-textMain mb-2">The Result: "Production-Ready"</h3>
                            <p className="text-textMuted leading-relaxed">
                                When you see the "Verified" badge, it means a human engineer has confirmed this codebase is safe, clean, and ready to ship. We reject ~40% of submissions to maintain this standard.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Button onClick={() => navigate('/mvp-kits')}>
                        Browse Verified Blueprints
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AuditProcess;
