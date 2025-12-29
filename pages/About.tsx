import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Users, Cpu, ShieldCheck, ArrowRight, Github, Linkedin, Mail, Code2, Rocket, Globe } from 'lucide-react';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 opacity-50" />

            <PageHeader
                title="We don't sell 'Hello World'."
                description="SprintSaaS is the marketplace for production-ready architecture. We curate high-performance blueprints so you can skip the setup and start sprinting to revenue."
                tag="Built for Builders"
                gradient="from-indigo-500/20 to-transparent"
            />

            <div className="px-6 max-w-7xl mx-auto pb-32 animate-slide-up relative z-10">

                {/* Mission Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-32">
                    {[
                        {
                            icon: <Cpu size={24} />,
                            title: "Engineering First",
                            desc: "We prioritize clean, scalable code over flashy UI demos. Every kit is audited for security and performance.",
                            color: "text-blue-500 dark:text-blue-400",
                            bg: "bg-blue-50 dark:bg-blue-500/10",
                            border: "border-blue-100 dark:border-blue-500/20"
                        },
                        {
                            icon: <ShieldCheck size={24} />,
                            title: "Vetted Ownership",
                            desc: "No stolen code. Every seller verifies their identity and intellectual property rights before listing.",
                            color: "text-emerald-500 dark:text-emerald-400",
                            bg: "bg-emerald-50 dark:bg-emerald-500/10",
                            border: "border-emerald-100 dark:border-emerald-500/20"
                        },
                        {
                            icon: <Rocket size={24} />,
                            title: "Speed to Market",
                            desc: "Founders don't have time for boilerplate. Our assets are designed to get you from localhost to launch in hours.",
                            color: "text-purple-500 dark:text-purple-400",
                            bg: "bg-purple-50 dark:bg-purple-500/10",
                            border: "border-purple-100 dark:border-purple-500/20"
                        }
                    ].map((item, i) => (
                        <div key={i} className={`p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all group relative overflow-hidden shadow-sm dark:shadow-none`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg.split(' ')[1]} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <div className={`w-12 h-12 ${item.bg} ${item.border} border rounded-2xl flex items-center justify-center ${item.color} mb-6`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Founder Story - Premium Content Block */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-[80px] -z-10" />

                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[32px] p-8 md:p-16 backdrop-blur-sm grid lg:grid-cols-2 gap-16 items-center shadow-lg dark:shadow-none">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
                                    From the Founder
                                </h2>
                                <div className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-zinc-400">
                                    <p>
                                        "I built SprintSaaS because I was tired of buying 'starter kits' that were just glorified HTML templates. As an engineer, I wanted substantial, backend-connected logic that actually solved hard problems."
                                    </p>
                                    <p>
                                        "My mission is simple: to create the ecosystem I wish I had when I started my first SaaS. Verified code, real utility, and a community of serious builders."
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex items-center justify-between">
                                <div>
                                    <h4 className="text-gray-900 dark:text-white font-bold text-lg">Aboobakar</h4>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-mono text-xs tracking-wide uppercase mt-1">Founder & Lead Engineer</p>
                                </div>

                                <div className="flex gap-3">
                                    <a href="https://www.linkedin.com/in/aboobakarkhan/" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 rounded-xl text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-all">
                                        <Linkedin size={20} />
                                    </a>
                                    <a href="mailto:khnnabubakar786@gmail.com" className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 rounded-xl text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-all">
                                        <Mail size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Code Card Visual - Kept dark intentionally for 'IDE' look */}
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[#09090b] border border-white/10 rounded-2xl p-6 shadow-2xl transform transition-transform duration-500 group-hover:rotate-1">
                                <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <span className="text-xs font-mono text-zinc-500 ml-2">founder_profile.ts</span>
                                </div>

                                <div className="space-y-4 font-mono text-sm leading-relaxed">
                                    <div className="flex gap-2">
                                        <span className="text-purple-400">const</span>
                                        <span className="text-yellow-200">architect</span>
                                        <span className="text-zinc-500">=</span>
                                        <span className="text-zinc-300">{`{`}</span>
                                    </div>
                                    <div className="pl-6 space-y-2">
                                        <div>
                                            <span className="text-indigo-300">name</span>: <span className="text-emerald-400">"Aboobakar"</span>,
                                        </div>
                                        <div>
                                            <span className="text-indigo-300">role</span>: <span className="text-emerald-400">"Full Stack Architect"</span>,
                                        </div>
                                        <div>
                                            <span className="text-indigo-300">passion</span>: <span className="text-emerald-400">["AI/ML", "SaaS", "Design"]</span>,
                                        </div>
                                        <div>
                                            <span className="text-indigo-300">status</span>: <span className="text-emerald-400">"Building in Public"</span>
                                        </div>
                                    </div>
                                    <div className="text-zinc-300">{`}`}</div>

                                    <div className="pt-4 flex flex-wrap gap-2">
                                        {['React', 'Supabase', 'Node.js', 'Typescript'].map(tech => (
                                            <span key={tech} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-zinc-400 text-xs hover:text-white transition-colors cursor-default">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-32 text-center">
                    <p className="text-gray-600 dark:text-zinc-500 mb-8 max-w-2xl mx-auto">Ready to stop coding from scratch and start shipping?</p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/mvp-kits')} icon={<Rocket size={18} />}>
                            Explore Blueprints
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                            Contact Team
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
