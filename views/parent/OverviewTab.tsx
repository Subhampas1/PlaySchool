import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
  BanknotesIcon,
  XCircleIcon,
} from "../../components/icons";
import { api } from "../../services/api";
import { LandingPageConfig, FeeInvoice } from "../../types";

interface OverviewTabProps {
  fees?: FeeInvoice[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ fees = [] }) => {
  const [config, setConfig] = useState<LandingPageConfig>({
    schoolName: "Tiny Toddlers Playschool",
    heroTitle: "",
    heroSubtitle: "",
    aboutTitle: "About Our School",
    aboutText:
      "Tiny Toddlers Playschool is dedicated to fostering a love for learning in a safe, nurturing, and fun environment. We believe every child is unique and deserves the best start in life.",
    contactEmail: "admin@tinytoddlers.com",
    contactPhone: "+91 98765 43210",
    address:
      "Ashram Rd, near Sri R K Mahila College, New Barganda, Giridih, Jharkhand 815302",
  });

  const [showPaymentHistory, setShowPaymentHistory] = useState(true);

  const paidFees = fees
    .filter((f) => f.status === "PAID")
    .sort(
      (a, b) =>
        new Date(b.paymentDate || "").getTime() -
        new Date(a.paymentDate || "").getTime()
    );

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getLandingConfig();
        setConfig(data);
      } catch (e) {
        console.error("Failed to load school info", e);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-rose-400 to-orange-300 rounded-2xl p-6 text-white shadow-lg overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome to {config.schoolName}!
          </h2>
          <p className="opacity-90">
            We are delighted to have you as part of our family. Here is what
            makes our school special.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
          <span className="text-9xl">🏫</span>
        </div>
      </div>

      {/* Recent Payment History */}
      {showPaymentHistory && paidFees.length > 0 && (
        <Card className="p-3">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                <BanknotesIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Recent Payment History
              </h3>
            </div>
            <button
              onClick={() => setShowPaymentHistory(false)}
              className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Remove from homepage"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">
                    Invoice
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">
                    Payment Date
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paidFees.slice(0, 5).map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="p-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {fee.title}
                    </td>
                    <td className="p-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                      ₹{fee.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                      {fee.paymentDate}
                    </td>
                    <td className="p-3 text-xs font-mono text-gray-500">
                      {fee.transactionId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paidFees.length > 5 && (
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 italic">
                  Showing last 5 payments. See "Fees" tab for full history.
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* About Us */}
        <Card className="p-3">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-100 dark:border-gray-700">
            {config.aboutTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {config.aboutText}
          </p>
          <div className="flex items-center space-x-2 text-amber-500">
            <StarIcon className="w-5 h-5" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Ranked #1 Playschool in Giridih
            </span>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-3">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-100 dark:border-gray-700">
            School Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-500">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Address
                </p>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                  {config.address}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg text-sky-500">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Contact
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {config.contactPhone}
                </p>
                <p className="text-xs text-gray-500">{config.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-500">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  School Hours
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  Mon - Fri: 09:00 AM - 01:00 PM
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
