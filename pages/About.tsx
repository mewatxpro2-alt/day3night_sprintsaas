import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Users, Cpu, ShieldCheck, ArrowRight, Github, Linkedin, Mail, Code2, Rocket } from 'lucide-react';
import Button from '../components/Button';


const About: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-32 pb-20 animate-fade-in relative overflow-hidden bg-background">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-accent-primary/5 to-transparent -z-10" />
            <div className="absolute top-40 right-[-100px] w-96 h-96 bg-accent-secondary/5 rounded-full blur-[100px] -z-10" />

            {/* HERO SECTION */}
            <div className="max-w-7xl mx-auto px-6 mb-32">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-2 mb-6 text-accent-primary font-mono text-sm uppercase tracking-widest">
                        <Terminal size={14} />
                        <span>Built for Builders</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                        We don't sell <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                            "Hello World"
                        </span>
                    </h1>
                    <div className="w-32 mb-8">

                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-xl leading-relaxed max-w-2xl mb-10">
                        SprintSaaS is the marketplace for <strong>production-ready architecture</strong>. We curate high-performance blueprints so you can skip the setup and start sprinting to revenue.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button size="lg" onClick={() => navigate('/mvp-kits')} icon={<Rocket size={18} />}>
                            Explore Blueprints
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                            Contact Us
                        </Button>
                    </div>
                </div>
            </div>

            {/* MISSION GRID */}
            <div className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Cpu size={24} />,
                            title: "Engineering First",
                            desc: "We prioritize clean, scalable code over flashy UI demos. Every kit is audited for security and performance."
                        },
                        {
                            icon: <ShieldCheck size={24} />,
                            title: "Vetted Ownership",
                            desc: "No stolen code. Every seller verifies their identity and intellectual property rights before listing."
                        },
                        {
                            icon: <Rocket size={24} />,
                            title: "Speed to Market",
                            desc: "Founders don't have time for boilerplate. Our assets are designed to get you from localhost to launch in hours."
                        }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-accent-primary/30 transition-all group">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-gray-900 dark:text-white mb-6 group-hover:bg-accent-primary group-hover:text-black transition-colors">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FOUNDER STORY */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-gray-50 dark:bg-white/5 border border-border rounded-3xl p-8 md:p-16 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
                                From the Founder
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                <p>
                                    "I built SprintSaaS because I was tired of buying 'starter kits' that were just glorified HTML templates. As an engineer, I wanted substantial, backend-connected logic that actually solved hard problems."
                                </p>
                                <p>
                                    "My mission is simple: to create the ecosystem I wish I had when I started my first SaaS. Verified code, real utility, and a community of serious builders."
                                </p>
                            </div>

                            <div className="pt-6">
                                <h4 className="text-gray-900 dark:text-white font-bold text-lg">Aboobakar</h4>
                                <p className="text-accent-primary font-mono text-sm tracking-wide">FOUNDER & LEAD ENGINEER</p>

                                <div className="flex gap-4 mt-4">
                                    <a href="https://www.linkedin.com/in/aboobakarkhan/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-white/5 border border-border rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-accent-primary transition-all">
                                        <Linkedin size={20} />
                                    </a>
                                    <a href="mailto:khnnabubakar786@gmail.com" className="p-2 bg-white dark:bg-white/5 border border-border rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-accent-primary transition-all">
                                        <Mail size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Founder Visual / Tech Stack */}
                        <div className="relative">
                            <div className="bg-white dark:bg-[#1E1E20] border border-border rounded-2xl p-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/10 pb-4 mb-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 ml-2">founder_profile.tsx</span>
                                </div>
                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex gap-2 text-gray-500 dark:text-gray-400">
                                        <span className="text-blue-500 dark:text-blue-400">const</span>
                                        <span className="text-yellow-600 dark:text-yellow-400">profile</span>
                                        <span className="text-gray-500 dark:text-gray-400">=</span>
                                        <span className="text-gray-900 dark:text-white">{`{`}</span>
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-blue-400 dark:text-blue-300">name</span>: <span className="text-green-600 dark:text-green-400">"Aboobakar"</span>,
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-blue-400 dark:text-blue-300">role</span>: <span className="text-green-600 dark:text-green-400">"Full Stack Architect"</span>,
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-blue-400 dark:text-blue-300">passion</span>: <span className="text-green-600 dark:text-green-400">["AI/ML", "SaaS", "Design"]</span>,
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-blue-400 dark:text-blue-300">status</span>: <span className="text-green-600 dark:text-green-400">"Building in Public"</span>
                                    </div>
                                    <div className="text-gray-900 dark:text-white">{`}`}</div>

                                    <div className="pt-4 flex flex-wrap gap-2">
                                        {['React', 'Supabase', 'Node.js', 'Typescript'].map(tech => (
                                            <span key={tech} className="px-2 py-1 rounded bg-accent-primary/10 text-accent-primary text-xs">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
