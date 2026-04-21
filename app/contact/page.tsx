import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function ContactPage() {
  return (
    <StaticInfoPage
      title="Contact"
      subtitle="Reach the right team quickly for support, product guidance, media queries, or institutional collaboration."
      sections={[
        {
          title: 'General Support',
          body: 'For account issues, navigation help, or workflow troubleshooting, contact support@healthbuddy.ai with your environment details and screenshots when possible.',
          bullets: [
            'Login and access troubleshooting',
            'Dashboard and report workflow support',
            'Issue reproduction guidance for faster resolution'
          ]
        },
        {
          title: 'Clinical and Product Questions',
          body: 'For feature requests, demo walkthroughs, implementation planning, and product roadmap discussions, contact product@healthbuddy.ai.',
          bullets: [
            'Feature feedback and enhancement requests',
            'Demo sessions for teams and stakeholders',
            'Implementation planning for program adoption'
          ]
        },
        {
          title: 'Partnerships',
          body: 'For institutional pilots, care-network rollouts, and strategic collaborations, contact partnerships@healthbuddy.ai with project scope and expected timeline.',
          bullets: [
            'Hospital, clinic, and community program pilots',
            'Joint solution design and deployment planning',
            'Program evaluation and growth collaboration'
          ]
        },
        {
          title: 'Response Expectations',
          body: 'Support requests are typically acknowledged within one business day. Critical production-impact issues can be escalated through the support thread for expedited handling.'
        }
      ]}
    />
  )
}
