import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Terms of Use</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 13, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Budgetly ("the Service"), you accept and agree to be bound by the terms
                and provisions of this agreement. If you do not agree to these terms, please do not use the Service.
                Your continued use of the Service following the posting of changes to these terms will be deemed
                your acceptance of those changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly provides a student-focused financial planning and budgeting platform that helps users
                calculate expenses, track finances, create budget scenarios, and project their financial future.
                The Service includes calculators, dashboards, scenario planning tools, and data visualization features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of the Service, you must create an account:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One person or entity may not maintain more than one account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When using the Service, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate financial information for calculations</li>
                <li>Use the Service only for lawful purposes</li>
                <li>Not attempt to gain unauthorized access to any portion of the Service</li>
                <li>Not upload or transmit viruses or other malicious code</li>
                <li>Not interfere with or disrupt the Service or servers</li>
                <li>Not impersonate any person or entity</li>
                <li>Not collect or harvest any information from the Service</li>
                <li>Not use the Service for any commercial purpose without our consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by Budgetly and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual
                property laws.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You retain ownership of your financial data and information</li>
                <li>Budgetly retains ownership of all software, algorithms, and calculations</li>
                <li>You may not copy, modify, distribute, or reverse engineer any part of the Service</li>
                <li>The Budgetly name and logo are trademarks and may not be used without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Financial Information Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly is a budgeting and financial planning tool, not a financial advisor. All calculations,
                projections, and recommendations are based on the information you provide and general assumptions.
                They should not be considered professional financial advice. Please consult with a qualified
                financial advisor for personalized financial planning.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate calculations and projections, Budgetly makes no guarantees
                about the accuracy, completeness, or reliability of any financial calculations or projections.
                You are responsible for verifying all calculations and should not rely solely on our Service
                for financial decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the maximum extent permitted by law, Budgetly shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Any loss of profits, revenue, data, or use</li>
                <li>Any financial losses resulting from use of the Service</li>
                <li>Any errors or inaccuracies in calculations or projections</li>
                <li>Any interruption or cessation of the Service</li>
                <li>Any unauthorized access to or alteration of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain the Service's availability but do not guarantee uninterrupted access.
                The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time
                without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. By using the Service, you
                consent to the collection, use, and sharing of your information as described in the Privacy Policy.
                Please review our Privacy Policy to understand our data practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. User Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to the financial data and information you input into the Service.
                By using the Service, you grant Budgetly a license to use your data solely to provide the
                Service to you. We may use aggregated, anonymized data for analytics and service improvement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to terminate or suspend your account and access to the Service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>For violation of these Terms of Use</li>
                <li>For fraudulent or illegal activity</li>
                <li>For extended periods of inactivity</li>
                <li>At our sole discretion, with or without notice</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You may terminate your account at any time from your settings page. Upon termination,
                all your data will be deleted within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless Budgetly and its officers, directors,
                employees, and agents from any claims, liabilities, damages, losses, and expenses arising
                from your use of the Service, violation of these terms, or violation of any rights of another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                in which Budgetly operates, without regard to its conflict of law provisions. Any disputes
                arising from these terms or use of the Service shall be resolved in the courts of that jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Use at any time. We will notify users of
                material changes by posting the updated terms on this page and updating the "Last updated"
                date. Your continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">16. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision
                shall be limited or eliminated to the minimum extent necessary so that the remaining terms
                remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">17. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Use, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-accent/30 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> support@budgetly.finance<br />
                  <strong>Subject:</strong> Terms of Use Inquiry
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

export default TermsOfUse;
