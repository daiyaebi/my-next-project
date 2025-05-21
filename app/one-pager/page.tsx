import { Suspense } from 'react';
import OnePagerClient from './OnePagerClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnePagerClient />
    </Suspense>
  );
}
