import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function PrivacyPage() {
  return (
    <StaticInfoPage
      title="Privacy"
      subtitle="We handle personal and health-related information with clear purpose limits, access controls, and transparency principles."
      sections={[
        {
          title: 'Data Collection',
          body: 'We collect only the information required to provide account services, AI health workflows, and operational stability. Collection scope is minimized to support functionality without unnecessary exposure.',
          bullets: [
            'Account identity and profile information',
            'Health assessment inputs provided by users',
            'Operational logs for reliability and debugging'
          ]
        },
        {
          title: 'Data Usage',
          body: 'Collected information is used to deliver requested features, improve platform quality, and support secure operation. Data is not used for unrelated processing outside approved service scope.',
          bullets: [
            'Generating AI-driven checkup and guidance outputs',
            'Improving performance and user experience quality',
            'Maintaining service integrity and reliability'
          ]
        },
        {
          title: 'Access and Retention Controls',
          body: 'Access to sensitive information is restricted to authorized workflows and roles. Retention is guided by service requirements, legal obligations, and responsible data minimization practices.',
          bullets: [
            'Role-scoped data access controls',
            'Retention aligned with operational and legal needs',
            'Controlled handling of archived information'
          ]
        },
        {
          title: 'User Rights',
          body: 'Where applicable, users may request access, correction, export, or deletion of eligible account data under supported policies and regulations.'
        }
      ]}
    />
  )
}
