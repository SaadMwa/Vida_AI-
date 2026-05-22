'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assignmentTitle: string;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  assignmentTitle,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden scale-100 transition-transform">
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="delete-modal-title" className="text-xl font-semibold text-gray-900">
                  Delete Assignment?
                </h2>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="px-6 pb-4">
            <p className="text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">&quot;{assignmentTitle}&quot;</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All questions and associated data will be permanently removed.
            </p>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Assignment'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
