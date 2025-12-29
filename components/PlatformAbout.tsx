import React from 'react';

const PlatformAbout = () => {
    return (
        <section className="relative mt-[-60px] z-20">
            {/* Curved Top Container */}
            <div className="bg-surface rounded-t-[60px] md:rounded-t-[100px] pt-8 md:pt-12 pb-24 px-6 relative overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">

                {/* Subtle Circular Pattern Background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full border border-textMain/20"></div>
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[140%] aspect-square rounded-full border border-textMain/20"></div>
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-textMain/20"></div>
                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[100%] aspect-square rounded-full border border-textMain/20"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Massive Brand Header */}
                    <div className="text-center mb-16 md:mb-24 pt-12">
                        <h1 className="text-[12vw] md:text-[140px] leading-[0.8] font-display font-black text-textMain tracking-tighter uppercase opacity-90 select-none">
                            SprintSaaS
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                        {/* Left Column: Context */}
                        <div className="flex flex-col justify-start">
                            <p className="text-lg md:text-xl font-medium text-textMain mb-6 leading-relaxed">
                                SprintSaaS is the world's largest marketplace for
                                <span className="text-accent-primary"> Production-Ready Architectures</span>.
                            </p>
                            <div className="space-y-4 text-base leading-relaxed text-textMuted max-w-md font-light">
                                <p>
                                    It is a one-stop-shop for technical founders to acquire complete,
                                    validated SaaS products that are already monetized.
                                </p>
                                <p>
                                    Skip the "Hello World" phase. Discover your ideal codebase,
                                    deploy the full stack in minutes, and accelerate your path to revenue.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Use Cases */}
                        <div>
                            <h3 className="font-bold text-textMain mb-8 text-sm uppercase tracking-wide">
                                Founders use SprintSaaS to:
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "Launch a monetized MVP in under 48 hours, eliminating months of dev time.",
                                    "Scale agency services by reselling white-labeled, high-quality tools.",
                                    "Replace fragile no-code stacks with scalable, strictly-typed React code.",
                                    "Learn specialized commercial architectures (AI, Crypto, Marketplaces) by example."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-sm md:text-base text-textMain/80 hover:text-textMain transition-colors">
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-textMain text-surface font-bold text-xs flex items-center justify-center mt-0.5">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlatformAbout;
