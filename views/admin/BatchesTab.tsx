import React, { useState } from "react";
import { Batch } from "../../types";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { PencilIcon } from "../../components/icons";

interface BatchesTabProps {
  batches: Batch[];
  onCreateBatch: (
    name: string,
    capacity: number,
    feeAmount: number,
    description: string,
    ageGroup: string
  ) => Promise<void>;
  onUpdateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
}

const BatchesTab: React.FC<BatchesTabProps> = ({
  batches,
  onCreateBatch,
  onUpdateBatch,
}) => {
  // Create Form State
  const [form, setForm] = useState({
    name: "",
    capacity: "",
    feeAmount: "",
    description: "",
    ageGroup: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    capacity: "",
    feeAmount: "",
    description: "",
    ageGroup: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const capacityNum = parseInt(form.capacity, 10);
    const feeNum = parseInt(form.feeAmount, 10);

    if (!form.name || isNaN(capacityNum) || capacityNum <= 0 || isNaN(feeNum)) {
      alert(
        "Please check your inputs. Capacity and Fee must be valid numbers."
      );
      return;
    }
    setIsSubmitting(true);
    await onCreateBatch(
      form.name,
      capacityNum,
      feeNum,
      form.description,
      form.ageGroup
    );
    setForm({
      name: "",
      capacity: "",
      feeAmount: "",
      description: "",
      ageGroup: "",
    });
    setIsSubmitting(false);
  };

  const handleEditClick = (batch: Batch) => {
    setEditingBatch(batch);
    setEditForm({
      name: batch.name,
      capacity: batch.capacity.toString(),
      feeAmount: batch.feeAmount.toString(),
      description: batch.description || "",
      ageGroup: batch.ageGroup || "",
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    const capacityNum = parseInt(editForm.capacity, 10);
    const feeNum = parseInt(editForm.feeAmount, 10);

    if (
      !editForm.name ||
      isNaN(capacityNum) ||
      capacityNum <= 0 ||
      isNaN(feeNum)
    ) {
      alert("Please check your inputs.");
      return;
    }

    setIsUpdating(true);
    await onUpdateBatch(editingBatch.id, {
      name: editForm.name,
      capacity: capacityNum,
      feeAmount: feeNum,
      description: editForm.description,
      ageGroup: editForm.ageGroup,
    });
    setIsUpdating(false);
    setEditingBatch(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-bold">Program / Batch List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">Batch Name</th>
                <th className="p-4 font-semibold">Age Group</th>
                <th className="p-4 font-semibold">Annual Fee</th>
                <th className="p-4 font-semibold">Capacity</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-t dark:border-gray-700">
                  <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                    <div>
                      {batch.name}
                      <p className="text-xs text-gray-400 font-normal truncate max-w-[200px]">
                        {batch.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    {batch.ageGroup || "N/A"}
                  </td>
                  <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                    ₹{batch.feeAmount?.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    {batch.capacity} Students
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEditClick(batch)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30"
                      title="Edit Batch"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-3">
        <h3 className="text-xl font-bold mb-4">Create New Program/Batch</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="batch-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Program Name
              </label>
              <input
                type="text"
                id="batch-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Nursery"
                required
              />
            </div>
            <div>
              <label
                htmlFor="age-group"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Age Group
              </label>
              <input
                type="text"
                id="age-group"
                value={form.ageGroup}
                onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 3-4 years"
              />
            </div>
            <div>
              <label
                htmlFor="fee-amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Annual Fee (₹)
              </label>
              <input
                type="number"
                id="fee-amount"
                value={form.feeAmount}
                onChange={(e) =>
                  setForm({ ...form, feeAmount: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 15000"
                required
              />
            </div>
            <div>
              <label
                htmlFor="batch-capacity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Student Capacity
              </label>
              <input
                type="number"
                id="batch-capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 20"
                required
                min="1"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description / Highlights
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Brief description of the program..."
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Program"}
          </button>
        </form>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingBatch}
        onClose={() => setEditingBatch(null)}
        title="Edit Program Details"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Program Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Age Group
              </label>
              <input
                type="text"
                value={editForm.ageGroup}
                onChange={(e) =>
                  setEditForm({ ...editForm, ageGroup: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Capacity
              </label>
              <input
                type="number"
                value={editForm.capacity}
                onChange={(e) =>
                  setEditForm({ ...editForm, capacity: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Annual Fee (₹)
            </label>
            <input
              type="number"
              value={editForm.feeAmount}
              onChange={(e) =>
                setEditForm({ ...editForm, feeAmount: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BatchesTab;
