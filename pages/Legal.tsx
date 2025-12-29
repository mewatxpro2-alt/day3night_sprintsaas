import React from 'react';
import PageHeader from '../components/PageHeader';
import ContentSection from '../components/ContentSection';

interface LegalProps {
  type: 'PRIVACY' | 'TERMS';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  const isPrivacy = type === 'PRIVACY';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const updated = 'October 24, 2024';
  const tag = isPrivacy ? 'Data Protection' : 'Legal Agreement';

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={title}
        description={`Last updated on ${updated}. Please read carefully to understand your rights and responsibilities.`}
        tag={tag}
        gradient={isPrivacy ? "from-emerald-500/10 to-transparent" : "from-blue-500/10 to-transparent"}
      />

      <ContentSection>
        {isPrivacy ? (
          <>
            <h3>1. Information We Collect</h3>
            <p>
              When you purchase a starter kit or sign up for SprintSaaS, we collect information necessary to provide our services, including your name, email address, and payment information (processed securely by Stripe). We do not store full credit card details on our servers.
            </p>
            <h3>2. How We Use Your Data</h3>
            <p>
              We use your data to:
            </p>
            <ul>
              <li>Process transactions and deliver digital downloads.</li>
              <li>Send critical updates regarding the kits you have purchased.</li>
              <li>Improve our marketplace curation logic.</li>
            </ul>

            <h3>3. Code Security</h3>
            <p>
              Any code you submit to the marketplace remains your intellectual property. We only scan submissions for security vulnerabilities and quality assurance before listing.
            </p>

            <h3>4. Cookies & Tracking</h3>
            <p>
              We use minimal cookies strictly for authentication and essential site functionality. We do not sell your data to third-party advertisers.
            </p>
          </>
        ) : (
          <>
            <h3>1. Usage License</h3>
            <p>
              By purchasing a kit from SprintSaaS, you are granted a non-exclusive, non-transferable license to use the code for unlimited personal and commercial projects. You may <strong>NOT</strong> redistribute, resell, or license the source code itself as a standalone product.
            </p>

            <h3>2. Refund Policy</h3>
            <p>
              Due to the digital nature of our products (immediate access to source code), we generally do not offer refunds once files have been downloaded. However, if a kit is broken or materially different from the description, please contact support within 7 days.
            </p>

            <h3>3. Platform Liability</h3>
            <p>
              SprintSaaS lists kits from third-party creators. While we curate for quality, we are not responsible for the long-term maintenance of the codebases sold on the platform.
            </p>

            <h3>4. Updates & Support</h3>
            <p>
              Sellers are expected to provide critical bug fixes for 6 months after purchase. Feature updates are at the seller's discretion.
            </p>
          </>
        )}
      </ContentSection>
    </div>
  );
};

export default Legal;
