import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function CareersPage() {
  return (
    <StaticInfoPage
      title="Careers"
      subtitle="Build meaningful health technology with a team focused on practical impact, quality engineering, and responsible AI."
      sections={[
        {
          title: 'Why Join Health Buddy',
          body: 'We solve real healthcare workflow challenges with product discipline and clinical empathy. Every role contributes to making risk insights more understandable and actionable for people and care teams.',
          bullets: [
            'Mission-centered product development',
            'High ownership with collaborative execution',
            'Strong focus on reliability and usability'
          ]
        },
        {
          title: 'Current Hiring Focus',
          body: 'We are actively looking for professionals who can bridge technical excellence with user outcomes in health workflows.',
          bullets: [
            'Frontend and full-stack engineers for patient and clinician UX',
            'Applied AI and analytics engineers for model-driven experiences',
            'Product and design specialists with healthcare context'
          ]
        },
        {
          title: 'How We Work',
          body: 'We value clarity, measurable progress, and respectful collaboration. Teams work in short cycles with clear deliverables and high-quality standards for release readiness.',
          bullets: [
            'Outcome-driven planning and execution',
            'Design, engineering, and domain collaboration',
            'Continuous quality checks before rollout'
          ]
        },
        {
          title: 'How To Apply',
          body: 'Send your profile, role interest, and relevant work to careers@healthbuddy.ai. Include a short note on why preventive healthcare and responsible AI matter to you.'
        }
      ]}
    />
  )
}
