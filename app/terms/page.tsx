import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function TermsPage() {
  return (
    <StaticInfoPage
      title="Terms"
      subtitle="These terms outline how the platform may be used, key responsibilities, and limitations of AI-assisted health guidance."
      sections={[
        {
          title: 'Service Scope',
          body: 'Health Buddy provides AI-assisted informational insights, screening workflows, and care-support utilities. It is designed to support decisions, not replace licensed clinical judgment or emergency services.',
          bullets: [
            'Informational risk and prevention guidance',
            'Workflow support for users and care teams',
            'Not a substitute for emergency response'
          ]
        },
        {
          title: 'User Responsibilities',
          body: 'Users are responsible for providing accurate input, safeguarding account credentials, and using the platform in compliance with applicable law and institutional policy.',
          bullets: [
            'Provide truthful and current health-related input',
            'Maintain credential confidentiality',
            'Avoid misuse, abuse, or unauthorized automation'
          ]
        },
        {
          title: 'Availability and Changes',
          body: 'Features, workflows, and integrations may evolve over time. We may update functionality to improve quality, compliance, or security posture.',
          bullets: [
            'Continuous product improvements and fixes',
            'Possible updates to workflows and interfaces',
            'Maintenance windows when required'
          ]
        },
        {
          title: 'Medical Disclaimer',
          body: 'AI outputs are guidance-only and may not capture all clinical context. Diagnosis and treatment decisions should be made with licensed healthcare professionals.'
        }
      ]}
    />
  )
}
