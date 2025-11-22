import React, { useState } from "react";
import { Batch, Homework } from "../../types";
import Card from "../../components/Card";

interface HomeworkTabProps {
  batches: Batch[];
  homeworkList: Homework[];
  onCreateHomework: (data: {
    title: string;
    description: string;
    dueDate: string;
    batch: string;
  }) => Promise<void>;
}

const HomeworkTab: React.FC<HomeworkTabProps> = ({
  batches,
  homeworkList,
  onCreateHomework,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    batch: "",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.batch ||
      !formData.dueDate
    ) {
      alert("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    await onCreateHomework(formData);
    setFormData({ title: "", description: "", batch: "", dueDate: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-3">
        <h3 className="text-xl font-bold mb-4">Assign Homework</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Draw a Tree"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Batch
              </label>
              <select
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- Select Batch --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="mt-1 block w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Instructions for the students..."
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Assigning..." : "Assign Homework"}
          </button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-bold">Assignments History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Batch</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {homeworkList
                .sort(
                  (a, b) =>
                    new Date(b.dueDate).getTime() -
                    new Date(a.dueDate).getTime()
                )
                .map((hw) => (
                  <tr key={hw.id} className="border-t dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                      {hw.title}
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold dark:bg-blue-900/50 dark:text-blue-300">
                        {hw.batch}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {hw.dueDate}
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {hw.description}
                    </td>
                  </tr>
                ))}
              {homeworkList.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No homework assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HomeworkTab;
