// app/compliance/page.tsx
import { ShieldCheck, AlertTriangle, Info } from "lucide-react";

const SECTIONS = [
  {
    title: "Human Review Required",
    icon: "👤",
    items: [
      "Every AI-generated post must be reviewed and approved by a human team member before publication.",
      "The approval workflow in this hub must be completed before any content can be exported.",
      "Never publish AI output without reading it carefully first.",
    ],
  },
  {
    title: "Digital Imprint",
    icon: "📋",
    items: [
      "UK election law (Political Parties, Elections and Referendums Act 2000) requires a legal imprint on all campaign material, including digital content.",
      "The imprint must state who the material is promoted by, and who printed/published it (with an address).",
      "This hub does not add your imprint automatically. You must add it before publishing.",
      "Confirm the exact wording of your imprint with your party's legal team or the Electoral Commission guidance.",
    ],
  },
  {
    title: "Fact-Checking",
    icon: "🔍",
    items: [
      "All factual claims must be verified before publication.",
      "The hub flags factual claims for review — do not ignore these flags.",
      "Never publish statistics, quotes, or claims you cannot verify from a reliable source.",
      "Keep a record of sources for any claim you publish.",
    ],
  },
  {
    title: "No Fake Endorsements",
    icon: "🚫",
    items: [
      "Do not imply endorsement by any individual, organisation, or group unless you have explicit written permission.",
      "Do not use images of individuals in campaign material without their consent.",
      "Do not fabricate testimonials or quotes.",
    ],
  },
  {
    title: "No Misleading Media",
    icon: "🎞️",
    items: [
      "Do not publish edited images or videos that misrepresent events or individuals.",
      "Clearly label any AI-generated images as such if used in campaign materials.",
      "Do not use deepfakes or synthetic media of real people.",
    ],
  },
  {
    title: "No Spam or Automated Mass Messaging",
    icon: "📵",
    items: [
      "This hub does not support automated mass direct messaging — this is prohibited.",
      "Do not use bots or automation to artificially inflate engagement metrics.",
      "Do not scrape personal data from social media platforms.",
      "Comply with GDPR and the Data Protection Act 2018 for any voter data you hold.",
    ],
  },
  {
    title: "Platform API Usage",
    icon: "🔌",
    items: [
      "Platform API integrations in this hub are disabled by default.",
      "Enabling them requires proper developer credentials and platform approval.",
      "Automated posting via API may require additional compliance with platform terms of service.",
      "Never configure API posting without legal and compliance sign-off.",
    ],
  },
  {
    title: "Paid Advertising",
    icon: "💰",
    items: [
      "Paid political advertising on Facebook, Instagram, and Google requires special authorisation.",
      "You must register as a political advertiser with the platform before running paid ads.",
      "Paid ads may require additional imprint information and must be declared in campaign spending returns.",
      "Consult the Electoral Commission guidance on campaign spending limits.",
    ],
  },
  {
    title: "Record Keeping",
    icon: "📂",
    items: [
      "Keep records of all exported and scheduled content.",
      "Export logs are stored in this hub's database.",
      "Retain records of any paid advertising spend.",
      "You may be required to declare campaign expenditure to the Electoral Commission.",
    ],
  },
];

export default function CompliancePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-campaign-gold">Compliance Guidance</h1>
        <p className="text-campaign-muted mt-1">
          Essential legal and ethical requirements for UK local election digital campaigning.
        </p>
      </div>

      <div className="compliance-banner flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-red-300">Important Disclaimer</p>
          <p>This page provides general guidance only. It is not legal advice. Consult a qualified solicitor or the Electoral Commission for specific legal guidance applicable to your campaign.</p>
        </div>
      </div>

      <div className="bg-blue-950/40 border border-blue-700 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          <p className="font-bold mb-1">Electoral Commission Resources</p>
          <ul className="space-y-1">
            <li><a href="https://www.electoralcommission.org.uk/i-am-a/candidate-or-agent/local-elections-england" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Candidate guidance — Local elections England</a></li>
            <li><a href="https://www.electoralcommission.org.uk/guidance-political-parties/digital-campaigning" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Digital campaigning guidance</a></li>
            <li><a href="https://www.electoralcommission.org.uk/guidance-political-parties/campaign-spending/candidates" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Campaign spending limits</a></li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map(section => (
          <div key={section.title} className="card">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-white font-bold">{section.title}</h2>
              <ShieldCheck className="w-4 h-4 text-campaign-gold ml-auto flex-shrink-0" />
            </div>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-campaign-muted">
                  <span className="text-campaign-gold mt-1 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card border-campaign-gold/30 bg-campaign-gold/5">
        <h2 className="text-campaign-gold mb-3">Pre-Publish Checklist</h2>
        <div className="space-y-2">
          {[
            "Content has been read and approved by a human reviewer",
            "All factual claims have been verified",
            "Digital imprint has been added",
            "No personal attacks or misleading claims",
            "No fake testimonials or endorsements",
            "Images are properly credited and consented",
            "Complies with platform terms of service",
            "Campaign spending implications considered",
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" className="accent-campaign-gold w-4 h-4" />
              <span className="text-sm text-white">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
