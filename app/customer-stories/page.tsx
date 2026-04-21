import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function CustomerStoriesPage() {
  return (
    <StaticInfoPage
      title="Customer Stories"
      subtitle="Real-world usage patterns showing how preventive AI workflows can improve care readiness and patient engagement."
      sections={[
        {
          title: 'Community Clinic Pilot',
          body: 'A primary care clinic introduced AI Checkup before consultation. Staff used pre-visit risk summaries to identify likely high-risk patients earlier and prioritize same-week follow-up for those needing deeper review.',
          bullets: [
            'Earlier identification of elevated-risk patients',
            'Improved triage planning before doctor consults',
            'Better use of limited appointment capacity'
          ]
        },
        {
          title: 'Multilingual Patient Engagement',
          body: 'Health programs observed stronger patient understanding when risk explanations and disease awareness content were shown in the patient preferred language.',
          bullets: [
            'Improved comprehension of prevention steps',
            'Higher confidence in self-management actions',
            'Reduced confusion around medical terminology'
          ]
        },
        {
          title: 'Doctor Efficiency Gains',
          body: 'Clinicians reported that structured summaries reduced repetitive history-taking and allowed more consultation time for treatment discussion and lifestyle planning.',
          bullets: [
            'Less time spent re-collecting baseline data',
            'More focus on decision-making and counseling',
            'Improved consistency in chronic risk discussion'
          ]
        },
        {
          title: 'Program-Level Insights',
          body: 'Aggregated trend visibility helped care coordinators identify outreach priorities and improve preventive campaign planning.',
          bullets: [
            'Trend-aware follow-up planning',
            'Targeted outreach for at-risk groups',
            'Clearer performance conversations across teams'
          ]
        }
      ]}
    />
  )
}
