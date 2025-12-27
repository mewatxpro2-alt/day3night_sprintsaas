import React from 'react';
import { Shield, FileText } from 'lucide-react';

interface LegalProps {
  type: 'PRIVACY' | 'TERMS';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  const isPrivacy = type === 'PRIVACY';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const updated = 'October 24, 2024';

  return (
    <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto animate-fade-in min-h-screen">
      <div className="mb-12 border-b border-border pb-8">
        <div className="w-12 h-12 bg-surfaceHighlight rounded-xl flex items-center justify-center mb-6 text-accent-primary">
          {isPrivacy ? <Shield size={24} /> : <FileText size={24} />}
        </div>
        <h1 className="text-4xl font-display font-bold text-textMain mb-4">{title}</h1>
        <p className="text-textMuted">Last updated: {updated}</p>
      </div>

      <div className="prose prose-invert dark:prose-invert max-w-none">
        <style jsx>{`
          .prose {
            color: rgb(var(--text-primary));
          }
          .prose h3 {
            color: rgb(var(--text-primary));
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .prose p {
            color: rgb(var(--text-secondary));
            line-height: 1.75;
          }
          .prose ul {
            color: rgb(var(--text-secondary));
          }
          .prose li {
            margin: 0.5rem 0;
          }
        `}</style>
        {isPrivacy ? (
          <>
            <h3>1. Information We Collect</h3>
            <p>
              When you purchase a starter kit or sign up for SprintSaaS, we collect information necessary to provide our services, including your name, email address, and payment information (processed securely by Stripe). We do not store full credit card details on our servers.
            </p>
            <h3>2. How We Use Your Data</h3>
            <p>
              We use your data to:
              <ul>
                <li>Process transactions and deliver digital downloads.</li>
                <li>Send critical updates regarding the kits you have purchased.</li>
                <li>Improve our marketplace curation logic.</li>
              </ul>
            </p>
            <h3>3. Code Security</h3>
            <p>
              Any code you submit to the marketplace remains your intellectual property. We only scan submissions for security vulnerabilities and quality assurance before listing.
            </p>
          </>
        ) : (
          <>
            <h3>1. Usage License</h3>
            <p>
              By purchasing a kit from SprintSaaS, you are granted a non-exclusive, non-transferable license to use the code for unlimited personal and commercial projects. You may NOT redistribute, resell, or license the source code itself as a standalone product.
            </p>
            <h3>2. Refund Policy</h3>
            <p>
              Due to the digital nature of our products (immediate access to source code), we generally do not offer refunds once files have been downloaded. However, if a kit is broken or materially different from the description, please contact support within 7 days.
            </p>
            <h3>3. Platform Liability</h3>
            <p>
              SprintSaaS lists kits from third-party creators. While we curate for quality, we are not responsible for the long-term maintenance of the codebases sold on the platform.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Legal;
