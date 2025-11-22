import React, { useState, useEffect } from "react";
import { AdmissionApplication } from "../types";
import { api } from "../services/api";
import { CheckCircleIcon, XCircleIcon } from "./icons";

interface FullAdmissionFormProps {
  onSubmit: (
    data: Omit<AdmissionApplication, "id" | "status" | "submittedDate">
  ) => Promise<void>;
  initialData?: Partial<AdmissionApplication>;
  isAdmin?: boolean;
}

const FullAdmissionForm: React.FC<FullAdmissionFormProps> = ({
  onSubmit,
  initialData,
  isAdmin = false,
}) => {
  const [formData, setFormData] = useState<
    Omit<AdmissionApplication, "id" | "status" | "submittedDate">
  >({
    childName: "",
    dob: "",
    gender: "Male",
    fatherName: "",
    motherName: "",
    fatherPhone: "",
    motherPhone: "",
    email: "",
    address: "",
    assignedStudentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idStatus, setIdStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        // Ensure we don't overwrite with undefined if keys exist in initialData but are undefined
        childName: initialData.childName || prev.childName,
        email: initialData.email || prev.email,
        fatherName: initialData.fatherName || prev.fatherName,
        assignedStudentId:
          initialData.assignedStudentId || prev.assignedStudentId,
      }));
    }
  }, [initialData]);

  // Real-time ID Validation
  useEffect(() => {
    if (!isAdmin) return;

    const id = formData.assignedStudentId?.trim();

    // Reset if empty
    if (!id) {
      setIdStatus("idle");
      return;
    }

    // Start checking
    setIdStatus("checking");

    const timeoutId = setTimeout(async () => {
      try {
        const exists = await api.checkStudentIdExists(id);
        setIdStatus(exists ? "invalid" : "valid");
      } catch (error) {
        console.error("Error checking student ID:", error);
        setIdStatus("idle"); // Fail gracefully
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.assignedStudentId, isAdmin]);

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
    if (isAdmin && idStatus === "invalid") {
      alert("Please provide a unique Student ID.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const renderIdStatusIcon = () => {
    if (idStatus === "checking")
      return (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500"></div>
      );
    if (idStatus === "valid")
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (idStatus === "invalid")
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Admin Only: Manual Student ID */}
      {isAdmin && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <label
            htmlFor="assignedStudentId"
            className="block text-sm font-bold text-amber-800 dark:text-amber-300"
          >
            Assign Student ID (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              name="assignedStudentId"
              value={formData.assignedStudentId || ""}
              onChange={handleChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:text-white ${
                idStatus === "invalid"
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : idStatus === "valid"
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-amber-300 dark:border-gray-600"
              }`}
              placeholder="Leave blank to auto-generate"
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none pt-1">
              {renderIdStatusIcon()}
            </div>
          </div>
          {idStatus === "invalid" && (
            <p className="text-xs text-red-600 mt-1 font-semibold">
              This Student ID is already assigned to another student.
            </p>
          )}
          {idStatus === "valid" && (
            <p className="text-xs text-green-600 mt-1 font-semibold">
              Student ID is available.
            </p>
          )}
          {idStatus === "idle" && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              If provided, this ID will be used for the student record. It must
              be unique.
            </p>
          )}
        </div>
      )}

      {/* Child Details */}
      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-200">
          Child's Details
        </h3>
        <div>
          <label
            htmlFor="childName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Full Name
          </label>
          <input
            type="text"
            name="childName"
            value={formData.childName}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parent Details */}
      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-200">
          Parents' Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="fatherName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Father's Name
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="fatherPhone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Father's Phone
            </label>
            <input
              type="tel"
              name="fatherPhone"
              value={formData.fatherPhone}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="motherName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mother's Name
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="motherPhone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mother's Phone
            </label>
            <input
              type="tel"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Primary Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-200">Address</h3>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Full Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          ></textarea>
        </div>
      </div>

      <button
        type="submit"
        disabled={
          isSubmitting || idStatus === "invalid" || idStatus === "checking"
        }
        className="w-full py-3 px-6 text-lg font-bold text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-green-400 to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting Application..." : "Submit & Admit Student"}
      </button>
    </form>
  );
};

export default FullAdmissionForm;
