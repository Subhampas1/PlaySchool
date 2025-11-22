import React, { useState, useMemo, useEffect } from "react";
import { Student, Batch, User } from "../../types";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import {
  UserCircleIcon,
  TrashIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
} from "../../components/icons";
import { api } from "../../services/api";

interface StudentsTabProps {
  students: Student[];
  batches: Batch[];
  onStudentUpdated: () => void;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  batches,
  onStudentUpdated,
}) => {
  const [filterBatch, setFilterBatch] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [parentDetails, setParentDetails] = useState<User | undefined>(
    undefined
  );

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    batch: "",
    enrollmentDate: "",
    fatherName: "",
    motherName: "",
    contactNumber: "",
    address: "",
    profilePicture: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Parent Creds Edit State
  const [isEditingParentCreds, setIsEditingParentCreds] = useState(false);
  const [parentCredFormData, setParentCredFormData] = useState({
    email: "",
    password: "",
  });
  const [isSavingParentCreds, setIsSavingParentCreds] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesBatch =
        filterBatch === "All" || student.batch === filterBatch;
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesBatch && matchesSearch;
    });
  }, [students, filterBatch, searchQuery]);

  // Fetch parent details when student is selected
  useEffect(() => {
    const fetchParent = async () => {
      if (selectedStudent) {
        const parent = await api.getUserById(selectedStudent.parentId);
        setParentDetails(parent);
        if (parent) {
          setParentCredFormData({
            email: parent.email,
            password: parent.password || "",
          });
        }

        // Reset modes
        setIsEditing(false);
        setShowDeleteConfirm(false);
        setIsEditingParentCreds(false);

        setEditFormData({
          name: selectedStudent.name,
          batch: selectedStudent.batch,
          enrollmentDate: selectedStudent.enrollmentDate,
          fatherName: selectedStudent.fatherName || "",
          motherName: selectedStudent.motherName || "",
          contactNumber: selectedStudent.contactNumber || "",
          address: selectedStudent.address || "",
          profilePicture: selectedStudent.profilePicture || "",
        });
      } else {
        setParentDetails(undefined);
      }
    };
    fetchParent();
  }, [selectedStudent]);

  const handleSave = async () => {
    if (!selectedStudent) return;
    setIsSaving(true);
    try {
      await api.updateStudent(selectedStudent.id, {
        name: editFormData.name,
        batch: editFormData.batch,
        enrollmentDate: editFormData.enrollmentDate,
        fatherName: editFormData.fatherName,
        motherName: editFormData.motherName,
        contactNumber: editFormData.contactNumber,
        address: editFormData.address,
        profilePicture: editFormData.profilePicture,
      });

      // Update the selected student locally so the modal reflects changes immediately
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              name: editFormData.name,
              batch: editFormData.batch,
              enrollmentDate: editFormData.enrollmentDate,
              fatherName: editFormData.fatherName,
              motherName: editFormData.motherName,
              contactNumber: editFormData.contactNumber,
              address: editFormData.address,
              profilePicture: editFormData.profilePicture,
            }
          : null
      );

      onStudentUpdated();
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update student details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveParentCreds = async () => {
    if (!parentDetails) return;
    if (!parentCredFormData.email || !parentCredFormData.password) {
      alert("Email and Password are required.");
      return;
    }
    setIsSavingParentCreds(true);
    try {
      const updatedParent = await api.updateUserCredentials(
        parentDetails.id,
        parentCredFormData.email,
        parentCredFormData.password
      );
      setParentDetails(updatedParent);
      setIsEditingParentCreds(false);
      alert("Parent login credentials updated successfully.");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update credentials."
      );
    } finally {
      setIsSavingParentCreds(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(selectedStudent.id);
      handleCloseModal();
      onStudentUpdated();
    } catch (error) {
      alert("Failed to delete student.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const getModalTitle = () => {
    if (showDeleteConfirm) return "Confirm Deletion";
    if (isEditing) return "Edit Student Details";
    return "Student Details";
  };

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-xl font-bold">Student Roster</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full sm:w-64 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="batch-filter" className="sr-only">
                Filter by batch
              </label>
              <select
                id="batch-filter"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="All">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Batch</th>
                <th className="p-4 font-semibold">Enrollment Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="border-t dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm font-mono">
                    {student.id}
                  </td>
                  <td className="p-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {student.profilePicture ? (
                      <img
                        src={student.profilePicture}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center text-xs text-gray-700">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    {student.name}
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                      {student.batch}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {student.enrollmentDate}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={!!selectedStudent}
        onClose={handleCloseModal}
        title={getModalTitle()}
      >
        {selectedStudent && (
          <div className="space-y-6">
            {showDeleteConfirm ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <TrashIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Delete Student?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Are you sure you want to delete{" "}
                    <strong>{selectedStudent.name}</strong>? This action cannot
                    be undone.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isDeleting ? "Deleting..." : "Delete Student"}
                  </button>
                </div>
              </div>
            ) : isEditing ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center text-4xl text-gray-600 shadow-inner overflow-hidden">
                      {editFormData.profilePicture ? (
                        <img
                          src={editFormData.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-20 h-20 text-white/50" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full cursor-pointer shadow-lg transition-all hover:scale-110 z-10"
                      title="Upload Photo"
                    >
                      <CameraIcon className="w-4 h-4" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Batch
                  </label>
                  <select
                    value={editFormData.batch}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        batch: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enrollment Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.enrollmentDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        enrollmentDate: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.fatherName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          fatherName: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.motherName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          motherName: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.contactNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        contactNumber: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <textarea
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center pb-6 border-b border-gray-200 dark:border-gray-700 relative">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center text-4xl text-gray-600 mb-4 shadow-inner overflow-hidden">
                      {selectedStudent.profilePicture ? (
                        <img
                          src={selectedStudent.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-20 h-20 text-white/50" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Student ID: {selectedStudent.id}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Batch
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        {selectedStudent.batch}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Enrolled On
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        {selectedStudent.enrollmentDate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700 pb-1">
                      Contact Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Father's Name</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {selectedStudent.fatherName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Mother's Name</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {selectedStudent.motherName || "N/A"}
                        </p>
                      </div>
                    </div>
                    {(selectedStudent.contactNumber ||
                      selectedStudent.address) && (
                      <div className="space-y-2 pt-1">
                        {selectedStudent.contactNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-800 dark:text-gray-200">
                              {selectedStudent.contactNumber}
                            </span>
                          </div>
                        )}
                        {selectedStudent.address && (
                          <div className="flex items-start space-x-2 text-sm">
                            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-800 dark:text-gray-200">
                              {selectedStudent.address}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Parent Information Section */}
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Parent Account
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-3">
                      {parentDetails ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Name:
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {parentDetails.name}
                            </span>
                          </div>

                          {isEditingParentCreds ? (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 mt-2 space-y-2">
                              <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                Edit Credentials
                              </h5>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={parentCredFormData.email}
                                  onChange={(e) =>
                                    setParentCredFormData({
                                      ...parentCredFormData,
                                      email: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Password
                                </label>
                                <input
                                  type="text"
                                  value={parentCredFormData.password}
                                  onChange={(e) =>
                                    setParentCredFormData({
                                      ...parentCredFormData,
                                      password: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                                />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => setIsEditingParentCreds(false)}
                                  className="flex-1 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveParentCreds}
                                  disabled={isSavingParentCreds}
                                  className="flex-1 py-1 bg-sky-500 text-white rounded text-xs hover:bg-sky-600 disabled:opacity-50"
                                >
                                  {isSavingParentCreds ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Email:
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {parentDetails.email}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Password:
                                </span>
                                <code className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono text-rose-600 dark:text-rose-400 font-bold text-sm">
                                  {parentDetails.password || "******"}
                                </code>
                              </div>
                              <div className="mt-2 text-right">
                                <button
                                  onClick={() => setIsEditingParentCreds(true)}
                                  className="text-xs text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 underline"
                                >
                                  Edit Login Details
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Loading parent details...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete Student"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default StudentsTab;
