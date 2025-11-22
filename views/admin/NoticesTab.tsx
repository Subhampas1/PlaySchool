import React, { useState } from "react";
import {
  Notice,
  NoticePriority,
  NoticeVisibility,
  NoticeCategory,
} from "../../types";
import Card from "../../components/Card";

interface NoticesTabProps {
  notices: Notice[];
  onCreateNotice: (noticeData: {
    title: string;
    content: string;
    visibility: NoticeVisibility;
    priority: NoticePriority;
    category: NoticeCategory;
  }) => Promise<void>;
}

const priorityConfig: Record<
  NoticePriority,
  { text: string; bg: string; color: string }
> = {
  normal: {
    text: "Normal",
    bg: "bg-gray-100 dark:bg-gray-700",
    color: "text-gray-800 dark:text-gray-300",
  },
  high: {
    text: "High",
    bg: "bg-yellow-100 dark:bg-yellow-900/50",
    color: "text-yellow-800 dark:text-yellow-300",
  },
  urgent: {
    text: "Urgent",
    bg: "bg-red-100 dark:bg-red-900/50",
    color: "text-red-800 dark:text-red-300",
  },
};

const visibilityConfig: Record<
  NoticeVisibility,
  { text: string; bg: string; color: string }
> = {
  public: {
    text: "Public",
    bg: "bg-blue-100 dark:bg-blue-900/50",
    color: "text-blue-800 dark:text-blue-300",
  },
  parents: {
    text: "Parents",
    bg: "bg-green-100 dark:bg-green-900/50",
    color: "text-green-800 dark:text-green-300",
  },
  teachers: {
    text: "Teachers",
    bg: "bg-purple-100 dark:bg-purple-900/50",
    color: "text-purple-800 dark:text-purple-300",
  },
};

const categoryConfig: Record<NoticeCategory, { bg: string; color: string }> = {
  General: {
    bg: "bg-gray-100 dark:bg-gray-700",
    color: "text-gray-700 dark:text-gray-300",
  },
  Academic: {
    bg: "bg-indigo-100 dark:bg-indigo-900/50",
    color: "text-indigo-700 dark:text-indigo-300",
  },
  Holiday: {
    bg: "bg-pink-100 dark:bg-pink-900/50",
    color: "text-pink-700 dark:text-pink-300",
  },
  Event: {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    color: "text-amber-700 dark:text-amber-300",
  },
  Emergency: {
    bg: "bg-red-100 dark:bg-red-900/50",
    color: "text-red-700 dark:text-red-300",
  },
  "Fee Reminder": {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    color: "text-emerald-700 dark:text-emerald-300",
  },
};

const NoticesTab: React.FC<NoticesTabProps> = ({ notices, onCreateNotice }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    visibility: "public" as NoticeVisibility,
    priority: "normal" as NoticePriority,
    category: "General" as NoticeCategory,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Please fill out the title and content.");
      return;
    }
    setIsSubmitting(true);
    await onCreateNotice(formData);
    setFormData({
      title: "",
      content: "",
      visibility: "public",
      priority: "normal",
      category: "General",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-3">
        <h3 className="text-xl font-bold mb-4">Create New Notice</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="notice-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <input
                type="text"
                id="notice-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="notice-category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category
              </label>
              <select
                id="notice-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {Object.keys(categoryConfig).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="notice-content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Content
            </label>
            <textarea
              id="notice-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="notice-visibility"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Visibility
              </label>
              <select
                id="notice-visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="public">Public</option>
                <option value="parents">Parents Only</option>
                <option value="teachers">Teachers Only</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="notice-priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Priority
              </label>
              <select
                id="notice-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Publishing..." : "Publish Notice"}
          </button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-bold">Published Notices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">Title / Category</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Visibility</th>
                <th className="p-4 font-semibold">Priority</th>
              </tr>
            </thead>
            <tbody>
              {notices
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((notice) => (
                  <tr key={notice.id} className="border-t dark:border-gray-700">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {notice.title}
                      </div>
                      {notice.category && (
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            categoryConfig[notice.category]?.bg
                          } ${categoryConfig[notice.category]?.color}`}
                        >
                          {notice.category}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {notice.date}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          visibilityConfig[notice.visibility].bg
                        } ${visibilityConfig[notice.visibility].color}`}
                      >
                        {visibilityConfig[notice.visibility].text}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          priorityConfig[notice.priority].bg
                        } ${priorityConfig[notice.priority].color}`}
                      >
                        {priorityConfig[notice.priority].text}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default NoticesTab;
