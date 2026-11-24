import { OpportunitiesPanel } from '../../components/career/OpportunitiesPanel';
import { PageShell } from '../../components/career/ui';

export default function Opportunities() {
  return (
    <PageShell
      title="Opportunities for you"
      subtitle="Internships, jobs, hackathons and more — ranked by how well they fit your skills and career goal."
    >
      <OpportunitiesPanel />
    </PageShell>
  );
}
