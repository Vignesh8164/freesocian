import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-xl">Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>

          <h2>Introduction</h2>
          <p>
            Welcome to Freesocian ("we," "our," or "us"). We are committed to protecting your personal 
            information and your right to privacy. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our Instagram creative flows service.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <ul>
            <li><strong>Account Information:</strong> Email address, username, and profile information you provide during registration</li>
            <li><strong>Instagram Data:</strong> Profile information and posting data through Instagram's official OAuth 2.0 API</li>
            <li><strong>Content Data:</strong> Posts, captions, images, and scheduling information you create or upload</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our service, including features used and preferences</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and operating system</li>
            <li><strong>Analytics Data:</strong> Usage patterns, feature adoption, and performance metrics</li>
            <li><strong>Security Data:</strong> Login attempts, access logs, and security-related events</li>
          </ul>

          <h2>How We Use Your Information</h2>
          
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our Instagram creative flows service</li>
            <li>Process and schedule your social media posts</li>
            <li>Authenticate and secure your account</li>
            <li>Communicate with you about your account and our service</li>
            <li>Improve our service functionality and user experience</li>
            <li>Comply with legal obligations and resolve disputes</li>
          </ul>

          <h2>Information Sharing and Disclosure</h2>
          
          <p><strong>We do not sell, trade, or rent your personal information to third parties.</strong></p>
          
          <p>We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>With Instagram:</strong> Only the content you explicitly choose to post through our service</li>
            <li><strong>With Unsplash:</strong> Search queries for images (no personal data)</li>
            <li><strong>Service Providers:</strong> Trusted partners like Appwrite for backend services, under strict confidentiality agreements</li>
            <li><strong>Legal Requirements:</strong> When required by law, regulation, or valid legal process</li>
            <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales (with notice to you)</li>
          </ul>

          <h2>Data Security</h2>
          
          <p>We implement industry-standard security measures to protect your information:</p>
          <ul>
            <li><strong>Encryption:</strong> All data transmissions are encrypted using TLS/SSL</li>
            <li><strong>Authentication:</strong> Secure OAuth 2.0 integration with Instagram</li>
            <li><strong>Access Controls:</strong> Strict access limitations and authentication requirements</li>
            <li><strong>Data Storage:</strong> Secure cloud infrastructure with regular security audits</li>
            <li><strong>Monitoring:</strong> Continuous monitoring for security threats and vulnerabilities</li>
          </ul>

          <h2>Data Retention</h2>
          
          <p>We retain your information for as long as necessary to:</p>
          <ul>
            <li>Provide our service to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>
          
          <p>You can delete your account at any time, which will remove your personal data from our systems within 30 days.</p>

          <h2>Your Privacy Rights</h2>
          
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
            <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
          </ul>

          <h2>Third-Party Services</h2>
          
          <h3>Instagram API</h3>
          <p>
            We use Instagram's official API to post content on your behalf. Your Instagram login credentials 
            are never stored by us - authentication is handled securely through Instagram's OAuth 2.0 system.
          </p>

          <h3>Unsplash API</h3>
          <p>
            We integrate with Unsplash to provide free stock images. No personal information is shared with 
            Unsplash except for your search queries to find relevant images.
          </p>

          <h3>Appwrite Backend</h3>
          <p>
            We use Appwrite for secure data storage and user management. Appwrite adheres to strict security 
            and privacy standards, and processes your data only as instructed by us.
          </p>

          <h2>International Data Transfers</h2>
          
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure 
            that such transfers comply with applicable data protection laws and provide appropriate safeguards.
          </p>

          <h2>Children's Privacy</h2>
          
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If we learn that we have collected such information, 
            we will delete it promptly.
          </p>

          <h2>Updates to This Policy</h2>
          
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes 
            by posting the new policy on this page and updating the "Last updated" date. Your continued use 
            of our service after such changes constitutes acceptance of the updated policy.
          </p>

          <h2>Contact Us</h2>
          
          <p>
            If you have questions about this Privacy Policy or our privacy practices, please contact us through 
            our support system. We are committed to resolving any privacy concerns promptly and transparently.
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3>Summary</h3>
            <p>
              <strong>Freesocian is committed to your privacy.</strong> We collect only necessary information 
              to provide our free Instagram creative flows service, never sell your data, and give you full 
              control over your information. Your trust is essential to our mission of making social media 
              efficiency solutions accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}