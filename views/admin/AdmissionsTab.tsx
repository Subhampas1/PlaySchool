import React, { useState } from "react";
import {
  Admission,
  AdmissionApplication,
  AdmissionStatus,
  User,
} from "../../types";
import Card from "../../components/Card";
import FullAdmissionForm from "../../components/FullAdmissionForm";
import Modal from "../../components/Modal";
import { api } from "../../services/api";
import { CheckCircleIcon } from "../../components/icons";
import Toast from "../../components/Toast";

interface AdmissionsTabProps {
  admissions: Admission[];
  onUpdateStatus: (id: string, status: AdmissionStatus) => void;
  onEnroll: (id: string) => void; // Kept for compatibility
}

const statusConfig: Record<
  AdmissionStatus,
  { text: string; bg: string; color: string }
> = {
  new: {
    text: "New",
    bg: "bg-blue-100 dark:bg-blue-900/50",
    color: "text-blue-800 dark:text-blue-300",
  },
  contacted: {
    text: "Contacted",
    bg: "bg-yellow-100 dark:bg-yellow-900/50",
    color: "text-yellow-800 dark:text-yellow-300",
  },
  scheduled_visit: {
    text: "Visit Scheduled",
    bg: "bg-purple-100 dark:bg-purple-900/50",
    color: "text-purple-800 dark:text-purple-300",
  },
  accepted: {
    text: "Accepted",
    bg: "bg-green-100 dark:bg-green-900/50",
    color: "text-green-800 dark:text-green-300",
  },
  enrolled: {
    text: "Enrolled",
    bg: "bg-gray-200 dark:bg-gray-700",
    color: "text-gray-600 dark:text-gray-300",
  },
  rejected: {
    text: "Rejected",
    bg: "bg-red-100 dark:bg-red-900/50",
    color: "text-red-800 dark:text-red-300",
  },
};

const AdmissionsTab: React.FC<AdmissionsTabProps> = ({
  admissions,
  onUpdateStatus,
  onEnroll,
}) => {
  // Modal state for converting enquiry to admission
  const [selectedEnquiry, setSelectedEnquiry] = useState<Admission | null>(
    null
  );
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showNewAdmissionModal, setShowNewAdmissionModal] = useState(false);

  // State for showing success credentials
  const [newParentCredentials, setNewParentCredentials] = useState<User | null>(
    null
  );
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleProceedToAdmission = (enquiry: Admission) => {
    setSelectedEnquiry(enquiry);
    setShowAdmissionModal(true);
  };

  const handleAdmissionFormSubmit = async (
    data: Omit<AdmissionApplication, "id" | "status" | "submittedDate">
  ) => {
    if (!selectedEnquiry) return;

    try {
      // 1. Create the Full Application
      const newApp = await api.createApplication(data);

      // 2. Enroll the student immediately (create Student & Parent users)
      // We assume "Admitted" means they are in the system now.
      const result = await api.enrollStudent(newApp.id, "application");

      // 3. Mark the original enquiry as enrolled so it gets archived/greyed out
      await onUpdateStatus(selectedEnquiry.id, "enrolled");

      // 4. Show credentials to admin
      setNewParentCredentials(result.parent);

      setShowAdmissionModal(false);
      setSelectedEnquiry(null);
      // show toast for success with student and parent info
      setToastMessage(
        `Enrolled: ${result.student.name} — Parent: ${result.parent.email}`
      );
      setToastOpen(true);
    } catch (error) {
      console.error("Admission failed", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to admit student. Please try again."
      );
    }
  };

  const handleNewAdmissionFormSubmit = async (
    data: Omit<AdmissionApplication, "id" | "status" | "submittedDate">
  ) => {
    try {
      // 1. Create the Full Application
      const newApp = await api.createApplication(data);

      // 2. Enroll the student immediately (create Student & Parent users)
      const result = await api.enrollStudent(newApp.id, "application");

      // 3. Show credentials to admin
      setNewParentCredentials(result.parent);

      setShowNewAdmissionModal(false);
      // show toast for success with student and parent info
      setToastMessage(
        `Enrolled: ${result.student.name} — Parent: ${result.parent.email}`
      );
      setToastOpen(true);
    } catch (error) {
      console.error("New admission failed", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to admit student. Please try again."
      );
    }
  };

  return (
    <div className="space-y-4 relative">
      <Card className="p-0 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Enquiries & Admissions</h2>
          <div>
            <button
              onClick={() => setShowNewAdmissionModal(true)}
              className="px-3 py-1 text-sm bg-rose-500 text-white rounded-md hover:bg-rose-600 shadow-md"
            >
              New Admission
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">Child Name</th>
                <th className="p-4 font-semibold">Parent Name</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((adm) => (
                <tr key={adm.id} className="border-t dark:border-gray-700">
                  <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                    {adm.childName}
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    <div className="flex flex-col">
                      <span>{adm.parentName}</span>
                      <span className="text-xs text-gray-500">
                        {adm.parentEmail}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        statusConfig[adm.status].bg
                      } ${statusConfig[adm.status].color}`}
                    >
                      {statusConfig[adm.status].text}
                    </span>
                  </td>
                  <td className="p-4 space-x-2 flex items-center">
                    <select
                      value={adm.status}
                      onChange={(e) =>
                        onUpdateStatus(
                          adm.id,
                          e.target.value as AdmissionStatus
                        )
                      }
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 focus:ring-opacity-50 dark:bg-gray-600 dark:border-gray-500"
                      disabled={adm.status === "enrolled"}
                    >
                      {Object.keys(statusConfig).map((s) => (
                        <option key={s} value={s}>
                          {statusConfig[s as AdmissionStatus].text}
                        </option>
                      ))}
                    </select>

                    {/* Changed from simple Enroll to Proceed to Admission flow */}
                    {(adm.status === "accepted" ||
                      adm.status === "scheduled_visit") && (
                      <button
                        onClick={() => handleProceedToAdmission(adm)}
                        className="px-3 py-1 text-sm bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-md hover:from-sky-600 hover:to-blue-600 shadow-md"
                      >
                        Proceed to Admission
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {admissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No enquires found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admission Modal */}
      {showAdmissionModal && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowAdmissionModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Complete Admission
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Please complete the details for{" "}
              <strong>{selectedEnquiry.childName}</strong> to finalize
              admission.
            </p>
            <FullAdmissionForm
              onSubmit={handleAdmissionFormSubmit}
              initialData={{
                childName: selectedEnquiry.childName,
                email: selectedEnquiry.parentEmail,
                fatherName: selectedEnquiry.parentName, // Defaulting parent name to father name as a starter
              }}
              isAdmin={true}
            />
          </div>
        </div>
      )}

      {/* New Admission Modal */}
      {showNewAdmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowNewAdmissionModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              New Admission
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Create a new full admission application and enroll the student
              immediately.
            </p>
            <FullAdmissionForm
              onSubmit={handleNewAdmissionFormSubmit}
              isAdmin={true}
            />
          </div>
        </div>
      )}

      {/* Success Credentials Modal */}
      <Modal
        isOpen={!!newParentCredentials}
        onClose={() => setNewParentCredentials(null)}
        title="Admission Successful"
      >
        {newParentCredentials && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              The student has been enrolled and a Parent account has been
              created for <strong>{newParentCredentials.name}</strong>.
              <br />
              Please provide them with these login details:
            </p>

            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 text-left space-y-2">
              <div>
                <span className="text-xs uppercase font-bold text-gray-500">
                  Email
                </span>
                <p className="font-mono text-lg text-gray-800 dark:text-gray-200 select-all">
                  {newParentCredentials.email}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <span className="text-xs uppercase font-bold text-gray-500">
                  Password
                </span>
                <p className="font-mono text-lg text-rose-600 dark:text-rose-400 font-bold select-all">
                  {newParentCredentials.password}
                </p>
              </div>
            </div>

            <button
              onClick={() => setNewParentCredentials(null)}
              className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <Toast
        message={toastMessage}
        type="success"
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={3500}
      />
    </div>
  );
};

export default AdmissionsTab;
