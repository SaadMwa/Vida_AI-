'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Empty from './empty-State.png'

export function AssignmentsEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full min-h-0 py-12 px-4 text-center">
      <div className="w-48 h-48 mb-6 relative shrink-0">
     <div className="w-48 h-48 mb-6 relative mx-auto">
  <Image
    src={Empty}
    alt="No assignments illustration"
    fill
    className="object-contain"
  />
</div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h3>
      <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
        Create your first assignment to start collecting and grading student submissions. You
        can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <button
        type="button"
        onClick={() => router.push('/assignments/create')}
        className="mt-6 px-6 py-3 text-white font-medium hover:bg-gray-800 transition rounded-full"
        style={{ background: '#181818' }}
      >
        + Create Your First Assignment
      </button>
    </div>
  );
}
