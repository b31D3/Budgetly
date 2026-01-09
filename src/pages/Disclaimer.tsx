import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertTriangle } from "lucide-react";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold">Disclaimer</h1>
          </div>
          <p className="text-muted-foreground mb-8">Last updated: January 8, 2026</p>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-2">IMPORTANT NOTICE</p>
            <p className="text-sm text-red-800">
              The information provided by Budgetly is for educational and informational purposes only.
              It should not be considered professional financial, legal, or tax advice. Always consult
              with qualified professionals before making financial decisions.
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. No Financial Advice</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly is a budgeting and financial planning tool designed to help students organize their
                finances and make informed decisions. However, we are <strong>not licensed financial advisors,
                accountants, or financial planners</strong>. The calculations, projections, scenarios, and
                recommendations provided by our Service are based solely on the information you input and
                general assumptions.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Nothing on this platform should be construed as professional financial advice, investment
                advice, tax advice, or legal advice. Before making any significant financial decisions,
                you should consult with a qualified financial advisor, accountant, or other appropriate
                professional who can assess your specific situation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Accuracy of Calculations</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we make every effort to ensure our calculations are accurate and reliable, Budgetly
                makes no warranties or representations about the accuracy, completeness, or reliability of
                any financial calculations, projections, or estimates provided through the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Financial calculations are based on:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Information you provide (which may be incomplete or inaccurate)</li>
                <li>General assumptions that may not apply to your specific situation</li>
                <li>Simplified models that cannot account for all real-world variables</li>
                <li>Current conditions that may change over time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You should always verify calculations independently and not rely solely on Budgetly for
                critical financial decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. No Guarantees or Predictions</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any projections, forecasts, or scenarios shown by Budgetly are estimates based on current
                information and assumptions. They are <strong>not guarantees</strong> of future results.
                Actual outcomes may differ significantly from projections due to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Changes in income or employment status</li>
                <li>Unexpected expenses or emergencies</li>
                <li>Changes in tuition, fees, or living costs</li>
                <li>Economic conditions and inflation</li>
                <li>Personal circumstances and life events</li>
                <li>Interest rates and market conditions</li>
                <li>Government policy changes affecting student finances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Educational Purpose Only</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly is designed as an educational tool to help students learn about budgeting,
                financial planning, and money management. The Service aims to increase financial literacy
                and help users think critically about their finances. However, it should be used as a
                starting point for financial planning, not as a comprehensive financial solution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Responsibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Verifying the accuracy of information you input into the Service</li>
                <li>Evaluating whether the Service is appropriate for your needs</li>
                <li>Understanding the limitations and assumptions of our calculations</li>
                <li>Making your own financial decisions based on your unique circumstances</li>
                <li>Seeking professional advice when needed</li>
                <li>Regularly reviewing and updating your financial information</li>
                <li>Any financial outcomes resulting from decisions made using the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. No Liability for Financial Losses</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly, its owners, employees, and affiliates shall not be liable for any financial
                losses, damages, or adverse outcomes resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Use or misuse of the Service</li>
                <li>Reliance on calculations, projections, or recommendations</li>
                <li>Errors, inaccuracies, or omissions in the Service</li>
                <li>Technical failures or service interruptions</li>
                <li>Decisions made based on information from the Service</li>
                <li>Unauthorized access to your data</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You use the Service at your own risk and accept full responsibility for any consequences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Third-Party Content and Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service may contain links to third-party websites or reference external resources.
                These are provided for convenience only. Budgetly does not endorse, control, or assume
                responsibility for the content, accuracy, or practices of any third-party sites. You
                access third-party content at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes and Updates</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly may update, modify, or discontinue features, calculations, or the entire Service
                at any time without notice. We are not obligated to maintain backward compatibility with
                previous versions. Your saved calculations and scenarios may be affected by updates to
                our algorithms or methodologies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we implement industry-standard security measures to protect your data, no system
                is completely secure. We cannot guarantee that unauthorized access, hacking, data loss,
                or other breaches will never occur. You acknowledge and accept the inherent security
                risks of using internet-based services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Regional Variations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly's calculations and assumptions may be based on general principles that apply
                in certain regions or countries. Financial regulations, tax laws, educational systems,
                and costs vary significantly by location. The Service may not accurately reflect the
                specific circumstances in your country, state, or province. Always verify that our
                assumptions align with your local context.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Student Loans and Debt</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you use Budgetly to plan for student loans or debt, understand that loan terms,
                interest rates, repayment options, and regulations are complex and vary by lender
                and program. Our simplified calculations cannot capture all nuances of student loan
                agreements. Always read and understand your loan agreements and consult with your
                financial aid office or a qualified advisor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Tax Implications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Budgetly does not provide tax advice or account for tax implications in its calculations.
                Tax laws are complex and vary by jurisdiction. Income, scholarships, grants, and other
                financial factors may have tax consequences. Consult with a qualified tax professional
                to understand your tax obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. No Warranty</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind,
                either express or implied, including but not limited to warranties of merchantability,
                fitness for a particular purpose, or non-infringement. We do not warrant that the
                Service will be error-free, uninterrupted, secure, or free from viruses or other
                harmful components.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Age and Legal Capacity</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are under 18 years of age or the age of majority in your jurisdiction, you
                should use Budgetly under the supervision of a parent or guardian. Financial decisions
                made by minors may require parental consent and may have legal implications. Parents
                and guardians should review and approve any financial plans or decisions made using
                the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Emergency Situations</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are experiencing financial hardship, debt crisis, or other financial emergencies,
                Budgetly is not a substitute for professional help. Please contact your school's
                financial aid office, a credit counseling service, or a financial advisor who can
                provide personalized assistance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">16. Acknowledgment</h2>
              <p className="text-muted-foreground leading-relaxed">
                By using Budgetly, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>You have read and understood this disclaimer</li>
                <li>You understand the limitations of the Service</li>
                <li>You accept full responsibility for your financial decisions</li>
                <li>You will not rely solely on Budgetly for important financial decisions</li>
                <li>You will seek professional advice when appropriate</li>
                <li>You use the Service at your own risk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">17. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this disclaimer or need clarification about the Service's
                capabilities and limitations, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-accent/30 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> support@budgetly.app<br />
                  <strong>Subject:</strong> Disclaimer Inquiry
                </p>
              </div>
            </section>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-8 rounded-lg">
              <p className="text-sm font-semibold text-yellow-900 mb-2">FINAL REMINDER</p>
              <p className="text-sm text-yellow-800">
                Your financial well-being is important. While Budgetly is a useful tool for organizing
                your finances, it should complement—not replace—professional financial guidance,
                thorough research, and careful personal judgment. When in doubt, seek expert advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Disclaimer;
