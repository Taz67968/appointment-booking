import { Suspense } from 'react';
import DashboardPage from './Dashboard';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DashboardPage />
    </Suspense>
  );
}
