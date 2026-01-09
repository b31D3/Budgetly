import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 8, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Budgetly. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you about how we look after your personal data when you visit our
                website and use our services, and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect and process the following types of personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Account Information:</strong> Name, email address, profile picture (optional)</li>
                <li><strong>Financial Data:</strong> Budget calculations, expense tracking, income information, savings goals</li>
                <li><strong>Usage Data:</strong> How you interact with our service, features you use, time spent on pages</li>
                <li><strong>Device Information:</strong> Browser type, IP address, operating system</li>
                <li><strong>Preferences:</strong> Currency settings, academic system, language preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide and maintain our budgeting service</li>
                <li>To perform financial calculations and projections</li>
                <li>To save your budget scenarios and preferences</li>
                <li>To authenticate your account and ensure security</li>
                <li>To improve our service and develop new features</li>
                <li>To communicate with you about service updates</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We take the security of your data seriously:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Firebase Services:</strong> Your data is stored securely using Google Firebase, which employs industry-standard encryption</li>
                <li><strong>Authentication:</strong> We use Firebase Authentication with secure password hashing</li>
                <li><strong>Encryption:</strong> Data is encrypted both in transit (HTTPS) and at rest</li>
                <li><strong>Access Control:</strong> Only you can access your personal financial data</li>
                <li><strong>Local Storage:</strong> Some preferences are stored locally in your browser for convenience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Third Parties</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information to third parties. We may share your data with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Service Providers:</strong> Google Firebase for hosting and data storage</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                <li><strong>Anonymous Analytics:</strong> Aggregated, anonymized data may be used for analytics (no personal identification)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Data Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
                <li><strong>Export:</strong> Download your financial data in CSV format</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Restriction:</strong> Request restriction of processing your personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal data only for as long as necessary to provide you with our services and
                as described in this privacy policy. When you delete your account, we will delete all your personal
                data within 30 days, except where we are required to retain it by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use browser local storage to save your preferences and maintain your session. We do not use
                third-party tracking cookies for advertising purposes. Essential cookies are used only for
                authentication and core functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is designed for students and is generally suitable for users aged 13 and above.
                We do not knowingly collect personal information from children under 13. If you are a parent
                or guardian and believe your child has provided us with personal data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by
                posting the new privacy policy on this page and updating the "Last updated" date. You are
                advised to review this privacy policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-accent/30 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> privacy@budgetly.app<br />
                  <strong>Subject:</strong> Privacy Inquiry
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
