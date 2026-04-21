import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function FeaturesPage() {
  return (
    <StaticInfoPage
      title="Features"
      subtitle="A complete preventive health platform combining AI risk assessment, multilingual guidance, and clinician-ready workflows."
      sections={[
        {
          title: 'AI Checkup and Risk Modeling',
          body: 'The AI Checkup flow captures core health signals across demographics, vitals, labs, and lifestyle. It then produces interpretable risk insights for Heart Disease, Hypertension, and Diabetes so users can understand both current risk and contributing factors.',
          bullets: [
            'Structured 4-step intake for consistent data capture',
            'Risk levels, confidence indicators, and summary guidance',
            'Precaution-focused recommendations for each condition'
          ]
        },
        {
          title: 'Language-Aware Experience',
          body: 'Health insights are easier to act on when users read them in their preferred language. The platform supports multiple Indian languages and keeps medical context understandable without forcing users into English-only workflows.',
          bullets: [
            'Language continuity from AI Checkup into awareness content',
            'Localized disease labels and preventive guidance',
            'User-controlled language switching for accessibility'
          ]
        },
        {
          title: 'Doctor and Patient Workflow',
          body: 'The product supports care continuity by connecting AI outputs to reporting, appointments, and follow-up communication between patient and doctor experiences.',
          bullets: [
            'Patient dashboard with reports, timeline, and reminders',
            'Doctor views for patient lists, trend review, and prioritization',
            'AI chat context aware of recent checkup outcomes'
          ]
        },
        {
          title: 'Explainability and Decision Support',
          body: 'Beyond a single score, Health Buddy highlights likely risk drivers and practical lifestyle actions. This gives users and care teams clearer starting points for follow-up conversations and behavior change.',
          bullets: [
            'Top contributing factors surfaced in plain language',
            'Condition-specific precaution suggestions',
            'Clear emergency guidance for severe symptoms'
          ]
        }
      ]}
    />
  )
}
