'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, Assignment } from '../../lib/api';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { SkeletonCard } from '../ui/SkeletonCard';
import { Tooltip } from '../ui/Tooltip';
import { AssignmentsEmptyState } from './AssignmentsEmptyState';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  generating: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

interface DeleteModalState {
  isOpen: boolean;
  id: string;
  title: string;
}

interface PendingDelete {
  id: string;
  assignment: Assignment;
  timeoutId: ReturnType<typeof setTimeout>;
}

export function AssignmentsList() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    id: '',
    title: '',
  });

  const pendingDeleteRef = useRef<PendingDelete | null>(null);

  const loadAssignments = async () => {
    try {
      const res = await api.getAssignments();
      setAssignments(res.data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    return () => {
      if (pendingDeleteRef.current) {
        clearTimeout(pendingDeleteRef.current.timeoutId);
      }
    };
  }, []);

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: '', title: '' });
  };

  const showUndoToast = (assignment: Assignment) => {
    toast.custom(
      (t) => (
        <div
          className={`bg-white rounded-xl shadow-lg p-4 flex items-center gap-4 border border-gray-200 max-w-md ${
            t.visible ? 'opacity-100' : 'opacity-0'
          } transition-opacity`}
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">Assignment deleted</p>
            <p className="text-sm text-gray-500 truncate">
              &quot;{assignment.title}&quot; has been removed
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (pendingDeleteRef.current?.id === assignment._id) {
                clearTimeout(pendingDeleteRef.current.timeoutId);
                pendingDeleteRef.current = null;
              }
              setAssignments((prev) => {
                if (prev.some((a) => a._id === assignment._id)) return prev;
                return [assignment, ...prev];
              });
              toast.dismiss(t.id);
              toast.success('Assignment restored');
            }}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000, id: `delete-${assignment._id}` }
    );
  };

  const scheduleServerDelete = (assignment: Assignment) => {
    if (pendingDeleteRef.current) {
      clearTimeout(pendingDeleteRef.current.timeoutId);
    }

    const timeoutId = setTimeout(async () => {
      if (pendingDeleteRef.current?.id !== assignment._id) return;

      try {
        await api.deleteAssignment(assignment._id);
        pendingDeleteRef.current = null;
      } catch (err) {
        console.error(err);
        setAssignments((prev) => {
          if (prev.some((a) => a._id === assignment._id)) return prev;
          return [assignment, ...prev];
        });
        toast.error('Failed to delete assignment permanently');
        pendingDeleteRef.current = null;
      }
    }, 5000);

    pendingDeleteRef.current = { id: assignment._id, assignment, timeoutId };
  };

  const handleConfirmDelete = async () => {
    const assignment = assignments.find((a) => a._id === deleteModal.id);
    if (!assignment) {
      closeDeleteModal();
      return;
    }

    setDeletingId(assignment._id);
    setAssignments((prev) => prev.filter((a) => a._id !== assignment._id));
    closeDeleteModal();
    setDeletingId(null);

    showUndoToast(assignment);
    scheduleServerDelete(assignment);
  };

  const openDeleteModal = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id, title });
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return <AssignmentsEmptyState />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button
          type="button"
          onClick={() => router.push('/assignments/create')}
          className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800"
        >
          + New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((a) => (
          <div
            key={a._id}
            onClick={() => router.push(`/assignments/${a._id}/output`)}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{a.title}</h3>
              <p className="text-sm text-gray-500">
                {a.subject} · Grade {a.gradeLevel} · {a.totalMarks} marks
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {a.llmUsed && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <Sparkles size={12} />
                  {a.llmUsed === 'gemini' ? 'Gemini AI' : 'AI'}
                </span>
              )}
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  statusColors[a.status] || statusColors.draft
                }`}
              >
                {a.status}
              </span>
              <Tooltip content="Delete assignment">
                <button
                  type="button"
                  onClick={(e) => openDeleteModal(a._id, a.title, e)}
                  disabled={deletingId === a._id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  aria-label="Delete assignment"
                >
                  {deletingId === a._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        assignmentTitle={deleteModal.title}
        isDeleting={deletingId === deleteModal.id}
      />
    </div>
  );
}
