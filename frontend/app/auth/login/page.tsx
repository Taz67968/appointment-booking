import { Suspense } from 'react';
import LoginPage from './ LoginClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginPage />
    </Suspense>
  );
}
