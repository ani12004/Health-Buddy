import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function HipaaPage() {
  return (
    <StaticInfoPage
      title="HIPAA"
      subtitle="Health Buddy is designed to support HIPAA-aligned operations with safeguards across access, processing, and administrative workflows."
      sections={[
        {
          title: 'Administrative Safeguards',
          body: 'Administrative controls define who may access protected information, how responsibilities are assigned, and what operational procedures guide secure usage.',
          bullets: [
            'Role-oriented access responsibilities',
            'Defined operational ownership for sensitive workflows',
            'Process-level controls for secure handling'
          ]
        },
        {
          title: 'Technical Safeguards',
          body: 'Technical safeguards reduce unauthorized exposure through authenticated sessions, protected backend boundaries, and controlled data flow paths.',
          bullets: [
            'Authenticated and session-aware access patterns',
            'Protected server-side operations for sensitive actions',
            'Controlled interfaces for health data processing'
          ]
        },
        {
          title: 'Auditability and Monitoring',
          body: 'Operational monitoring and event traceability help teams investigate incidents, validate controls, and improve response quality over time.',
          bullets: [
            'Traceable workflow events for investigations',
            'Operational checks for abnormal behavior',
            'Continuous improvement of control effectiveness'
          ]
        },
        {
          title: 'Shared Compliance Responsibility',
          body: 'Covered entities, implementation partners, and administrators are responsible for configuring and using the system in line with their own legal, contractual, and policy obligations.'
        }
      ]}
    />
  )
}
