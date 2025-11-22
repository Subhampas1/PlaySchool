import React, { useState } from "react";
import AdmissionForm from "../components/AdmissionForm";
import FullAdmissionForm from "../components/FullAdmissionForm";
import Card from "../components/Card";
import { AdmissionApplication } from "../types";
import { api } from "../services/api";

interface AdmissionViewProps {
  onFormSubmit: (data: {
    childName: string;
    parentName: string;
    parentEmail: string;
    notes: string;
  }) => Promise<void>;
  onBackToHome: () => void;
}

const AdmissionView: React.FC<AdmissionViewProps> = ({
  onFormSubmit,
  onBackToHome,
}) => {
  const [mode, setMode] = useState<"enquiry" | "admission">("enquiry");

  const handleFullAdmissionSubmit = async (
    data: Omit<AdmissionApplication, "id" | "status" | "submittedDate">
  ) => {
    try {
      await api.createApplication(data);
      // Simulate notification
      console.log(
        `🚀 Full Admission Application for ${data.childName} submitted!`
      );
      alert("Your FULL ADMISSION application has been submitted successfully!");
      onBackToHome();
    } catch (e) {
      alert("Error submitting application");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 my-8">
      <div className="w-full max-w-2xl">
        <Card className="p-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
            Admission Portal
          </h1>

          {/* Toggle Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setMode("enquiry")}
              className={`px-4 py-2 rounded-full transition-colors ${
                mode === "enquiry"
                  ? "bg-sky-500 text-white"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Quick Enquiry
            </button>
            <button
              onClick={() => setMode("admission")}
              className={`px-4 py-2 rounded-full transition-colors ${
                mode === "admission"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Take Admission
            </button>
          </div>

          {mode === "enquiry" ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                Have a question? Send us a quick enquiry.
              </p>
              <AdmissionForm onSubmit={onFormSubmit} />
            </>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                Ready to join? Fill out the full details below.
              </p>
              <FullAdmissionForm onSubmit={handleFullAdmissionSubmit} />
            </>
          )}

          <button
            onClick={onBackToHome}
            className="mt-6 text-sm text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 transition-colors w-full text-center"
          >
            &larr; Back to Home
          </button>
        </Card>
      </div>
    </div>
  );
};

export default AdmissionView;
