'use client';

import { useParams } from 'next/navigation';
import JobDetails from '../../components/JobDetails';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id;

  return <JobDetails jobId={jobId} />;
}
