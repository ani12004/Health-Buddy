import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function PressPage() {
  return (
    <StaticInfoPage
      title="Press"
      subtitle="Official updates, media resources, and communication channels for Health Buddy announcements and coverage."
      sections={[
        {
          title: 'Recent Announcements',
          body: 'Recent releases focused on multilingual disease awareness, improved risk explanation pathways, and clearer patient guidance experiences across the platform.',
          bullets: [
            'Expanded language-aware awareness experiences',
            'Enhanced explainability in checkup outputs',
            'Stronger continuity between reports and follow-up'
          ]
        },
        {
          title: 'Media and Interview Requests',
          body: 'For interviews, product coverage, research commentary, or expert quotes, contact press@healthbuddy.ai with your publication and timeline.',
          bullets: [
            'Interview scheduling and spokesperson availability',
            'Product briefing and background context',
            'Press response support for deadlines'
          ]
        },
        {
          title: 'Brand Resources',
          body: 'Approved logos, product screenshots, and platform descriptions are available on request through the communications team to ensure consistent representation.',
          bullets: [
            'Logo and visual identity assets',
            'Product and platform overview kits',
            'Usage guidance for editorial publications'
          ]
        },
        {
          title: 'Partnership Announcements',
          body: 'Institutional collaborations and implementation milestones can be coordinated jointly with our communications and partnership teams.'
        }
      ]}
    />
  )
}
