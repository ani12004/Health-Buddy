import { StaticInfoPage } from '@/components/landing/StaticInfoPage'

export default function SecurityPage() {
  return (
    <StaticInfoPage
      title="Security"
      subtitle="Security is designed into authentication, data flow, and operational controls across the entire platform lifecycle."
      sections={[
        {
          title: 'Access Control',
          body: 'Role-aware authentication separates patient and doctor workflows and minimizes cross-access risk. Sensitive actions are executed through protected server-side boundaries instead of exposed client-side logic.',
          bullets: [
            'Role-based routing and dashboard separation',
            'Protected backend actions for sensitive operations',
            'Session-aware middleware enforcement'
          ]
        },
        {
          title: 'Data Protection and Privacy by Design',
          body: 'Health data is processed using secure backend services and constrained interfaces. Data handling follows least-privilege principles so only required information is accessed in each workflow.',
          bullets: [
            'Controlled service boundaries for health records',
            'Reduced over-exposure through scoped data access',
            'Privacy-aware defaults for user-facing features'
          ]
        },
        {
          title: 'Secure Engineering Practices',
          body: 'Security is maintained through coding standards, dependency hygiene, and regular validation checks in development workflows.',
          bullets: [
            'Input validation in clinical and profile flows',
            'Dependency and package governance processes',
            'Linting and quality gates for safer releases'
          ]
        },
        {
          title: 'Incident Readiness',
          body: 'Operational teams maintain structured response playbooks for handling abnormal behavior, service disruption, and urgent support situations.',
          bullets: [
            'Escalation paths for production-critical issues',
            'Traceable event context for root-cause analysis',
            'Fast rollback strategy for unstable deployments'
          ]
        }
      ]}
    />
  )
}
