import React, { useState, useEffect } from "react";
import { User } from "../../types";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import {
  UserCircleIcon,
  CheckCircleIcon,
  PhoneIcon,
  MapPinIcon,
} from "../../components/icons";
import { api } from "../../services/api";

interface TeachersTabProps {
  teachers: User[];
  onCreateTeacher: (
    name: string,
    email: string,
    phone?: string,
    address?: string
  ) => Promise<User>;
  onUpdateStatus: (teacherId: string, isActive: boolean) => Promise<void>;
}

const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  onCreateTeacher,
  onUpdateStatus,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [newTeacherCredentials, setNewTeacherCredentials] =
    useState<User | null>(null);

  // Credentials editing state
  const [isEditingCreds, setIsEditingCreds] = useState(false);
  const [credFormData, setCredFormData] = useState({ email: "", password: "" });
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Reset editing state when modal opens/closes or selection changes
  useEffect(() => {
    if (selectedTeacher) {
      setCredFormData({
        email: selectedTeacher.email,
        password: selectedTeacher.password || "",
      });
      setIsEditingCreds(false);
    }
  }, [selectedTeacher]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please fill out name and email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newTeacher = await onCreateTeacher(
        formData.name,
        formData.email,
        formData.phone,
        formData.address
      );
      setNewTeacherCredentials(newTeacher);
      setFormData({ name: "", email: "", phone: "", address: "" });
    } catch (e) {
      // Error alert handled in parent or here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!selectedTeacher) return;
    if (!credFormData.email || !credFormData.password) {
      alert("Email and Password are required.");
      return;
    }

    setIsSavingCreds(true);
    try {
      const updatedUser = await api.updateUserCredentials(
        selectedTeacher.id,
        credFormData.email,
        credFormData.password
      );
      // Update local state
      setSelectedTeacher(updatedUser);
      setIsEditingCreds(false);
      alert("Login credentials updated successfully.");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update credentials."
      );
    } finally {
      setIsSavingCreds(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-bold">Teacher List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teach) => (
                <tr
                  key={teach.id}
                  onClick={() => setSelectedTeacher(teach)}
                  className="border-t dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-200 to-teal-200 rounded-full flex items-center justify-center text-xs text-gray-700">
                      {teach.name.charAt(0)}
                    </div>
                    {teach.name}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {teach.email}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        teach.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                      }`}
                    >
                      {teach.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <label
                      htmlFor={`teacher-status-${teach.id}`}
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`teacher-status-${teach.id}`}
                          className="sr-only"
                          checked={teach.isActive}
                          onChange={(e) =>
                            onUpdateStatus(teach.id, e.target.checked)
                          }
                        />
                        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"></div>
                      </div>
                    </label>
                    <style>{`
                                            input:checked ~ .dot {
                                                transform: translateX(100%);
                                                background-color: #48bb78;
                                            }
                                            input:checked ~ .block {
                                                background-color: #a7f3d0;
                                            }
                                        `}</style>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-3">
        <h3 className="text-xl font-bold mb-4">Add New Teacher</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., Ms. Jane Doe"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="e.g., jane.d@toddlers.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Optional"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Optional"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Teacher"}
          </button>
        </form>
      </Card>

      {/* Teacher Details Modal */}
      <Modal
        isOpen={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        title="Teacher Details"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            <div className="flex flex-col items-center pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 bg-gradient-to-br from-green-200 to-teal-200 rounded-full flex items-center justify-center text-4xl text-gray-600 mb-4 shadow-inner">
                <UserCircleIcon className="w-20 h-20 text-white/50" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {selectedTeacher.name}
              </h3>
              <span
                className={`px-3 py-1 mt-2 text-sm font-semibold rounded-full ${
                  selectedTeacher.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                }`}
              >
                {selectedTeacher.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Email Address
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                  {selectedTeacher.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    System ID
                  </p>
                  <p
                    className="font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate"
                    title={selectedTeacher.id}
                  >
                    {selectedTeacher.id}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Role
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                    {selectedTeacher.role}
                  </p>
                </div>
              </div>

              {(selectedTeacher.phone || selectedTeacher.address) && (
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {selectedTeacher.phone && (
                    <div className="flex items-start space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Phone
                        </p>
                        <p className="text-gray-800 dark:text-gray-200">
                          {selectedTeacher.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTeacher.address && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Address
                        </p>
                        <p className="text-gray-800 dark:text-gray-200">
                          {selectedTeacher.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                    Login Credentials
                  </p>
                  <button
                    onClick={() => setIsEditingCreds(!isEditingCreds)}
                    className="text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 underline"
                  >
                    {isEditingCreds ? "Cancel" : "Edit"}
                  </button>
                </div>

                {isEditingCreds ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={credFormData.email}
                        onChange={(e) =>
                          setCredFormData({
                            ...credFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Password
                      </label>
                      <input
                        type="text"
                        value={credFormData.password}
                        onChange={(e) =>
                          setCredFormData({
                            ...credFormData,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveCredentials}
                      disabled={isSavingCreds}
                      className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isSavingCreds ? "Saving..." : "Save Credentials"}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Password:
                    </span>
                    <code className="bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {selectedTeacher.password || "******"}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Modal for New Teacher */}
      <Modal
        isOpen={!!newTeacherCredentials}
        onClose={() => setNewTeacherCredentials(null)}
        title="Teacher Added Successfully"
      >
        {newTeacherCredentials && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>{newTeacherCredentials.name}</strong> has been added to
              the system. Please share the following login credentials with
              them.
            </p>

            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 text-left space-y-2">
              <div>
                <span className="text-xs uppercase font-bold text-gray-500">
                  Email
                </span>
                <p className="font-mono text-lg text-gray-800 dark:text-gray-200 select-all">
                  {newTeacherCredentials.email}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <span className="text-xs uppercase font-bold text-gray-500">
                  Password
                </span>
                <p className="font-mono text-lg text-rose-600 dark:text-rose-400 font-bold select-all">
                  {newTeacherCredentials.password}
                </p>
              </div>
            </div>

            <button
              onClick={() => setNewTeacherCredentials(null)}
              className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeachersTab;
