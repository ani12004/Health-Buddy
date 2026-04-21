import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function HowItWorksPage() {
  return (
    <StaticInfoPage
      title="How It Works"
      subtitle="A guided flow that turns health inputs into understandable risk insights and actionable next steps."
      sections={[
        {
          title: 'Step 1: Guided Health Intake',
          body: 'Users complete a structured checkup across demographics, vitals, lab indicators, and lifestyle. This keeps assessments consistent and ensures the risk model receives the core signals it needs.',
          bullets: [
            'Simple 4-step form design',
            'Clinical-style metric capture',
            'Input validation for cleaner analysis'
          ]
        },
        {
          title: 'Step 2: AI Risk Assessment',
          body: 'The platform analyzes captured inputs and generates condition-specific risk summaries for Heart Disease, Hypertension, and Diabetes with context about likely contributors.',
          bullets: [
            'Condition-level risk scoring',
            'High-level confidence and risk classification',
            'Contextual summary for each disease area'
          ]
        },
        {
          title: 'Step 3: Explainability and Awareness',
          body: 'Users receive plain-language disease awareness guidance and practical prevention ideas, shown in the selected language where available.',
          bullets: [
            'Localized educational content',
            'Prevention-oriented recommendations',
            'Emergency warning reminders when needed'
          ]
        },
        {
          title: 'Step 4: Follow-up Workflow',
          body: 'Results feed into patient and doctor workflows, helping teams prioritize follow-up and helping users stay aligned with ongoing care plans.',
          bullets: [
            'Report and timeline continuity',
            'Improved consultation readiness',
            'Better adherence to next-step actions'
          ]
        }
      ]}
    />
  )
}
