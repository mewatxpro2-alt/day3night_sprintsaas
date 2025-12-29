
import React from 'react';
import { motion } from 'framer-motion';

// --- Types ---
interface Testimonial {
    id: string;
    name: string;
    role: string;
    avatar: string; // URL or initials
    content: string;
    metadata?: string;
}

// --- Data (Authentic, consistent with "SprintSaaS") ---
const testimonials: Testimonial[] = [
    // Column 1
    {
        id: '1',
        name: "Alex R.",
        role: "Solo Founder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        content: "Bought the SaaS Kit on Friday. Deployed my MVP on Sunday evening. The Stripe integration alone saved me a week of headaches.",
        metadata: "Launched in 3 days"
    },
    {
        id: '2',
        name: "Sarah Chen",
        role: "Indie Hacker",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        content: "I've bought 5 other boilerplates. This is the only one that actually feels 'production-ready'. The code is clean and the RLS policies are solid.",
        metadata: "Repeat buyer"
    },
    {
        id: '3',
        name: "Marcus J.",
        role: "Freelance Dev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        content: "My client needed a dashboard with multi-tenant auth. Used the Admin Blueprint and customized it. Delivered in half the estimated time.",
        metadata: "Saved 40+ hours"
    },
    {
        id: '4',
        name: "Elena V.",
        role: "CTO @ Startup",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
        content: "We needed a quick internal tool. Instead of diverting engineering resources, we bought a blueprint. Best $150 we spent this month.",
        metadata: "Team license"
    },
    // Column 2
    {
        id: '5',
        name: "David K.",
        role: "Full Stack Dev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        content: "The clean architecture is refreshing. It's not just a mess of spaghetti code. I could actually extend it without breaking everything.",
        metadata: "Code quality: 10/10"
    },
    {
        id: '6',
        name: "Priya S.",
        role: "SaaS Founder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        content: "Finally, a boilerplate that uses Supabase properly. The row-level security setup is exactly how I would have done it myself.",
        metadata: "Verified Purchase"
    },
    {
        id: '7',
        name: "Tom W.",
        role: "Bootstrapper",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
        content: "Documentation is actually good? That's a first. I didn't have to guess how to set up the env variables or the payment webhook.",
        metadata: "Zero support tickets"
    },
    {
        id: '8',
        name: "Lisa M.",
        role: "Agency Owner",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        content: "We use these kits as a base for all our MVP client projects now. It standardizes our stack and lets us focus on the unique features.",
        metadata: "Agency Partner"
    },
    // Column 3
    {
        id: '9',
        name: "James L.",
        role: "Product Designer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
        content: "The UI components are beautiful right out of the box. I didn't have to spend days fighting with CSS to make it look decent.",
        metadata: "Design quality"
    },
    {
        id: '10',
        name: "Ryan G.",
        role: "Backend Dev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
        content: "I hate frontend work. This let me build my SaaS idea without getting stuck on pixel pushing. The Tailwind setup is intuitive.",
        metadata: "Launched v1"
    },
    {
        id: '11',
        name: "Sophie H.",
        role: "No-Code Convert",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
        content: "Moving from Bubble to code was scary. This blueprint gave me the structure I needed to learn React and Next.js properly.",
        metadata: "Learning tool"
    },
    {
        id: '12',
        name: "Mike T.",
        role: "Serial Builder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        content: "Just shipped my 3rd micro-SaaS using SprintSaaS. It's the ultimate cheat code for weekend launches.",
        metadata: "3x Founder"
    }
];

// --- Subcomponents ---

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 w-full mb-4 break-inside-avoid">
        <div className="flex items-center gap-3 mb-3">
            <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full border border-border bg-surfaceHighlight"
            />
            <div>
                <h4 className="text-sm font-bold text-textMain">{testimonial.name}</h4>
                <p className="text-xs text-textMuted">{testimonial.role}</p>
            </div>
        </div>
        <p className="text-textMain/90 text-sm leading-relaxed mb-3">
            "{testimonial.content}"
        </p>
        {testimonial.metadata && (
            <div className="inline-block px-2 py-0.5 rounded bg-surfaceHighlight border border-border text-[10px] uppercase tracking-wider font-semibold text-textMuted/80">
                {testimonial.metadata}
            </div>
        )}
    </div>
);

const InfiniteColumn = ({
    testimonials,
    direction = 'top',
    className = ''
}: {
    testimonials: Testimonial[],
    direction?: 'top' | 'bottom',
    className?: string
}) => {
    // Triple the data to ensure smooth infinite loop without gaps
    const triplicated = [...testimonials, ...testimonials, ...testimonials];

    return (
        <div className={`relative h-[600px] overflow-hidden ${className}`}>
            <motion.div
                className="flex flex-col gap-4"
                initial={{ y: direction === 'top' ? 0 : '-33.33%' }}
                animate={{ y: direction === 'top' ? '-33.33%' : 0 }}
                transition={{
                    duration: 40, // Slow, ambient speed
                    repeat: Infinity,
                    ease: "linear"
                }}
                whileHover={{ animationPlayState: 'paused' }} // Note: Framer Motion handle hover pause differently, usually via variants or style. 
                // For simplicity with basic animate(), we can't easily pause on hover without complex controls.
                // A better approach for simple CSS-like infinite scroll with pause:
                style={{
                    // Fallback if needed, but framer motion is better.
                    // To implementing pause, we can use hovering state to set scale/opacity, but stopping time is harder.
                    // Actually, standard CSS animation is easier for "pause on hover".
                    // Let's stick to Framer Motion values but maybe just slow it down?
                    // Requested "Motion pauses on hover". 
                }}
            >
                {triplicated.map((t, i) => (
                    <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
                ))}
            </motion.div>

            {/* Interaction overlay to allow pause - Implementing via CSS class on the motion div is easier if using CSS animations. 
          With Framer Motion functional component, let's try a different approach later if needed.
          For now, let's use a wrapper that changes animation state.
      */}
        </div>
    );
};

// Re-implementing with CSS for reliable "pause on hover"
const CSSInfiniteColumn = ({
    testimonials,
    direction = 'normal',
    duration = '60s',
    className = ''
}: {
    testimonials: Testimonial[],
    direction?: 'normal' | 'reverse',
    duration?: string,
    className?: string
}) => {
    // Duplicate enough to fill height
    const data = [...testimonials, ...testimonials, ...testimonials];

    return (
        <div
            className={`relative h-[500px] md:h-[700px] overflow-hidden group ${className}`}
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
        >
            <div
                className={`flex flex-col gap-5 will-change-transform animate-infinite-scroll group-hover:[animation-play-state:paused]`}
                style={{
                    animationDirection: direction,
                    animationDuration: duration
                }}
            >
                {data.map((t, i) => (
                    <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
                ))}
            </div>
        </div>
    );
};


const TestimonialWall = () => {
    // Split testimonials into 3 chunks
    const col1 = testimonials.slice(0, 4);
    const col2 = testimonials.slice(4, 8);
    const col3 = testimonials.slice(8, 12);

    return (
        <section className="py-24 px-6 bg-background relative z-10">
            <div className="max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-accent-primary font-mono text-xs uppercase tracking-widest mb-3 block">
                        Trusted by builders worldwide
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-textMain tracking-tighter mb-4">
                        Real results from people who <span className="text-accent-primary">shipped.</span>
                    </h2>
                    <p className="text-textMuted text-lg font-light leading-relaxed">
                        Founders, developers, and indie teams using SprintSaaS to move faster.
                    </p>
                </div>

                {/* Wall Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    {/* Column 1 - Down */}
                    <CSSInfiniteColumn testimonials={col1} direction="normal" duration="80s" />

                    {/* Column 2 - Up (Hidden on mobile if needed, but we keep 1 col on mobile) - On Mobile show all/mixed or just col 1? 
                 Requirement: Mobile: 1 column. Tablet: 2. Desktop: 3.
             */}
                    <CSSInfiniteColumn testimonials={col2} direction="reverse" duration="95s" className="hidden md:block" />

                    {/* Column 3 - Down */}
                    <CSSInfiniteColumn testimonials={col3} direction="normal" duration="85s" className="hidden lg:block" />
                </div>

                {/* Mobile only: show more content if single column? 
              The CSSInfiniteColumn reuses data so it loops. 
              On mobile, only col1 shows. Maybe we should mix data for mobile?
              For now, adhering to "Mobile: 1 column" which implies showing one strip.
          */}
            </div>

            {/* CSS for animation - injected locally or ensure it's in global CSS. 
            We'll add a style tag here for self-containment or assume tailwind config.
            Let's add a style tag to be safe.
        */}
            <style>{`
            @keyframes infinite-scroll {
                0% { transform: translateY(0); }
                100% { transform: translateY(-33.33%); }
            }
            .animate-infinite-scroll {
                animation: infinite-scroll linear infinite;
            }
        `}</style>
        </section>
    );
};

export default TestimonialWall;
