import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function EnterprisePage() {
  return (
    <StaticInfoPage
      title="Enterprise"
      subtitle="Built for care organizations that need reliable AI-assisted preventive screening and coordinated patient follow-up at scale."
      sections={[
        {
          title: 'Scalable Care Operations',
          body: 'Standardized intake and risk scoring help teams process larger patient volumes without compromising consistency. This supports better triage planning and improves allocation of clinical attention.',
          bullets: [
            'Consistent screening workflows across teams',
            'Faster high-risk identification before consultation',
            'Structured outputs for repeatable review'
          ]
        },
        {
          title: 'Clinical Collaboration',
          body: 'Doctors and care coordinators can review trends, assign follow-ups, and align intervention priorities using the same patient-centered data context.',
          bullets: [
            'Shared context between screening and consultation',
            'Better prioritization for follow-up outreach',
            'Improved continuity from insight to action'
          ]
        },
        {
          title: 'Deployment and Adoption Readiness',
          body: 'The platform is designed for practical rollout in real care environments, with multilingual communication, role-based workflows, and clear report structures.',
          bullets: [
            'Localized communication for diverse patient groups',
            'Role-specific interfaces for care teams',
            'Workflow-compatible output for clinical review'
          ]
        },
        {
          title: 'Enterprise Outcomes Focus',
          body: 'Health Buddy is optimized for measurable impact: early detection support, reduced avoidable delays, and stronger patient understanding of risk and prevention steps.',
          bullets: [
            'Higher preventive care engagement',
            'More focused consultation time',
            'Better adherence to follow-up plans'
          ]
        }
      ]}
    />
  )
}
