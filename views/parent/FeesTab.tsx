import React, { useState, useMemo } from "react";
import { FeeInvoice, FeePlan, Student, Batch } from "../../types";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  XCircleIcon,
} from "../../components/icons";
import { api } from "../../services/api";

interface FeesTabProps {
  invoices: FeeInvoice[];
  onPaymentSuccess: () => void;
  student: Student | null;
  batchConfig: Batch | null;
}

// A helper type for invoice display (can be real or virtual)
type DisplayInvoice = Partial<FeeInvoice> & {
  virtualId?: string; // Used for identifying virtual invoices
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  isVirtual?: boolean;
  type?: FeePlan | "OTHER";
  blockedReason?: string; // New field to handle conflicts
};

const FeesTab: React.FC<FeesTabProps> = ({
  invoices,
  onPaymentSuccess,
  student,
  batchConfig,
}) => {
  const [activeTab, setActiveTab] = useState<FeePlan>("MONTHLY");
  const [selectedInvoice, setSelectedInvoice] = useState<DisplayInvoice | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Calculate Dynamic Session
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();
  // If current month is Jan, Feb, Mar (0,1,2), then session started in prev year.
  const SESSION_START_YEAR = currentMonth < 3 ? currentYear - 1 : currentYear;
  const SESSION_END_YEAR = SESSION_START_YEAR + 1;

  // --- Payment History Analysis ---
  // Analyze what has already been paid/processing to determine conflicts
  const paymentAnalysis = useMemo(() => {
    const activeInvoices = invoices.filter(
      (inv) => inv.status === "PAID" || inv.status === "PROCESSING"
    );

    // Check Annual
    const isAnnualPaid = activeInvoices.some((inv) => inv.type === "ANNUAL");

    // Check Quarters
    // We map title strings like "Tuition Fee - Q1" to "Q1"
    const paidQuarters = new Set<string>();
    activeInvoices
      .filter((inv) => inv.type === "QUARTERLY")
      .forEach((inv) => {
        if (inv.title.includes("Q1")) paidQuarters.add("Q1");
        if (inv.title.includes("Q2")) paidQuarters.add("Q2");
        if (inv.title.includes("Q3")) paidQuarters.add("Q3");
        if (inv.title.includes("Q4")) paidQuarters.add("Q4");
      });

    // Check Months
    // We map titles like "Tuition Fee - Apr 2025" to "Apr"
    const paidMonths = new Set<string>();
    const months = [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];
    activeInvoices
      .filter((inv) => inv.type === "MONTHLY")
      .forEach((inv) => {
        months.forEach((m) => {
          if (inv.title.includes(` ${m} `)) paidMonths.add(m);
        });
      });

    // Any payment made at all in this session?
    const hasAnyPayment =
      isAnnualPaid || paidQuarters.size > 0 || paidMonths.size > 0;

    return { isAnnualPaid, paidQuarters, paidMonths, hasAnyPayment };
  }, [invoices]);

  // Filter real invoices by type AND ensure they belong to the current session
  const getRealInvoicesByType = (type: FeePlan) => {
    return invoices.filter((inv) => {
      if (inv.type !== type) return false;
      const dueDate = new Date(inv.dueDate);
      const sessionStart = new Date(`${SESSION_START_YEAR}-04-01`);
      const sessionEnd = new Date(`${SESSION_END_YEAR}-03-31`);
      return dueDate >= sessionStart && dueDate <= sessionEnd;
    });
  };

  // Generate invoices list based on active tab
  const displayedInvoices = useMemo(() => {
    if (!batchConfig || !student) return [];

    const annualFee = batchConfig.feeAmount;
    const realInvoices = getRealInvoicesByType(activeTab);

    // Helper to check if a specific period is already covered by a real invoice (of the SAME type)
    const isCovered = (titlePart: string) =>
      realInvoices.some((inv) => inv.title.includes(titlePart));

    let list: DisplayInvoice[] = [...realInvoices];
    const { isAnnualPaid, paidQuarters, paidMonths, hasAnyPayment } =
      paymentAnalysis;

    // Definitions of Quarters -> Months mapping
    const qMap: Record<string, string[]> = {
      Q1: ["Apr", "May", "Jun"],
      Q2: ["Jul", "Aug", "Sep"],
      Q3: ["Oct", "Nov", "Dec"],
      Q4: ["Jan", "Feb", "Mar"],
    };

    // Generate Virtual Invoices if not covered
    if (activeTab === "ANNUAL") {
      if (!isCovered("Annual Fee")) {
        let blockedReason = undefined;
        // Rule: If Annual is paid, show as Paid (handled by isCovered/realInvoices).
        // Rule: If ANY Monthly or Quarterly payment is made, Annual is disabled for the rest of session.
        if (paidQuarters.size > 0 || paidMonths.size > 0) {
          blockedReason =
            "Partial payment already made via Monthly/Quarterly plan.";
        }

        list.push({
          virtualId: `virt-annual-${SESSION_START_YEAR}`,
          title: `Annual Fee ${SESSION_START_YEAR}-${SESSION_END_YEAR}`,
          amount: annualFee,
          dueDate: `${SESSION_START_YEAR}-04-10`,
          status: "PENDING",
          isVirtual: true,
          type: "ANNUAL",
          blockedReason,
        });
      }
    } else if (activeTab === "QUARTERLY") {
      const amount = annualFee / 4;
      const quarters = [
        { id: "Q1", title: "Q1 (Apr-Jun)", due: `${SESSION_START_YEAR}-04-10` },
        { id: "Q2", title: "Q2 (Jul-Sep)", due: `${SESSION_START_YEAR}-07-10` },
        { id: "Q3", title: "Q3 (Oct-Dec)", due: `${SESSION_START_YEAR}-10-10` },
        { id: "Q4", title: "Q4 (Jan-Mar)", due: `${SESSION_END_YEAR}-01-10` },
      ];
      quarters.forEach((q) => {
        if (!isCovered(q.title)) {
          let blockedReason = undefined;
          // Rule: If Annual is paid, disable Quarterly.
          if (isAnnualPaid)
            blockedReason = "Full session paid via Annual Plan.";
          // Rule: If ANY month in this quarter is paid, disable this Quarter.
          else {
            const monthsInQ = qMap[q.id];
            const conflictMonth = monthsInQ.find((m) => paidMonths.has(m));
            if (conflictMonth)
              blockedReason = `Conflict: ${conflictMonth} is already paid via Monthly Plan.`;
          }

          list.push({
            virtualId: `virt-${q.id}`,
            title: `Tuition Fee - ${q.title}`,
            amount: amount,
            dueDate: q.due,
            status: "PENDING",
            isVirtual: true,
            type: "QUARTERLY",
            blockedReason,
          });
        }
      });
    } else if (activeTab === "MONTHLY") {
      const amount = Math.round(annualFee / 12);
      const months = [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ];

      months.forEach((m, idx) => {
        const year = idx > 8 ? SESSION_END_YEAR : SESSION_START_YEAR;
        const title = `Tuition Fee - ${m} ${year}`;
        if (!isCovered(title)) {
          let blockedReason = undefined;

          // Rule: If Annual is paid, disable Monthly.
          if (isAnnualPaid)
            blockedReason = "Full session paid via Annual Plan.";
          // Rule: If the Quarter containing this month is paid, disable Month.
          else {
            const parentQ = Object.keys(qMap).find((key) =>
              qMap[key].includes(m)
            );
            if (parentQ && paidQuarters.has(parentQ)) {
              blockedReason = `Conflict: ${parentQ} is already paid via Quarterly Plan.`;
            }
          }

          const monthNum = idx > 8 ? idx - 8 : idx + 4;
          list.push({
            virtualId: `virt-${m}-${year}`,
            title: title,
            amount: amount,
            dueDate: `${year}-${monthNum.toString().padStart(2, "0")}-10`,
            status: "PENDING",
            isVirtual: true,
            type: "MONTHLY",
            blockedReason,
          });
        }
      });
    }

    // Filtering logic: "shows only current months or quarter to pay"
    if (activeTab === "MONTHLY" || activeTab === "QUARTERLY") {
      const endOfCurrentMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      list = list.filter((inv) => {
        // Always show paid/processing/overdue OR blocked items (to show why they can't pay)
        if (inv.status !== "PENDING" || inv.blockedReason) return true;

        if (!inv.dueDate) return true;
        const d = new Date(inv.dueDate);
        return d <= endOfCurrentMonth;
      });
    }

    // Sort: Paid/Processing first, then by due date
    return list.sort((a, b) => {
      if (a.status === b.status) {
        return (
          new Date(a.dueDate || "").getTime() -
          new Date(b.dueDate || "").getTime()
        );
      }
      if (a.status === "PAID" || a.status === "PROCESSING") return -1;
      return 1;
    });
  }, [
    activeTab,
    batchConfig,
    student,
    invoices,
    SESSION_START_YEAR,
    SESSION_END_YEAR,
    paymentAnalysis,
  ]);

  // Calculate Total Outstanding (Excluding blocked items)
  const totalOutstanding = useMemo(() => {
    return displayedInvoices
      .filter(
        (inv) =>
          (inv.status === "PENDING" || inv.status === "OVERDUE") &&
          !inv.blockedReason
      )
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [displayedInvoices]);

  const lastPayment = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "PAID" || inv.status === "PROCESSING")
      .sort(
        (a, b) =>
          new Date(b.paymentDate || b.dueDate).getTime() -
          new Date(a.paymentDate || a.dueDate).getTime()
      )[0];
  }, [invoices]);

  const paidHistory = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "PAID")
      .sort(
        (a, b) =>
          new Date(b.paymentDate || "").getTime() -
          new Date(a.paymentDate || "").getTime()
      );
  }, [invoices]);

  const handlePayClick = (invoice: DisplayInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentSuccess(false);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !student) return;

    setIsProcessing(true);
    try {
      let invoiceId = selectedInvoice.id;

      // If virtual, create it first
      if (selectedInvoice.isVirtual) {
        const newInv = await api.createFeeInvoice({
          studentId: student.id,
          title: selectedInvoice.title || "Fee",
          amount: selectedInvoice.amount || 0,
          dueDate: selectedInvoice.dueDate || "",
          type: selectedInvoice.type,
        });
        invoiceId = newInv.id;
      }

      if (invoiceId) {
        await api.payFee(invoiceId);
        setPaymentSuccess(true);
        onPaymentSuccess(); // Refresh Data
        setTimeout(() => {
          setSelectedInvoice(null);
          setPaymentSuccess(false);
        }, 2000);
      }
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          School Fees
        </h2>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
          Academic Session: {SESSION_START_YEAR}-{SESSION_END_YEAR}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-3 flex items-center space-x-4 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border border-rose-100 dark:border-rose-800/50">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-rose-500">
            <BanknotesIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
              Outstanding ({activeTab.toLowerCase()})
            </p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              ₹{totalOutstanding.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card className="p-3 flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full shadow-sm text-green-600">
            <CheckCircleIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
              Last Payment
            </p>
            {lastPayment ? (
              <div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  ₹{lastPayment.amount.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">
                    {lastPayment.paymentDate}
                  </p>
                  {lastPayment.status === "PROCESSING" && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded">
                      Processing
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">No history</p>
            )}
          </div>
        </Card>
      </div>

      {/* Plan Selection Dropdown */}
      <div className="flex items-center justify-end gap-4">
        <label
          htmlFor="plan-select"
          className="text-sm font-bold text-gray-700 dark:text-gray-300"
        >
          Select Payment Plan:
        </label>
        <div className="relative">
          <select
            id="plan-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as FeePlan)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5 pr-8 font-bold shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <option value="MONTHLY">Monthly Plan</option>
            <option value="QUARTERLY">Quarterly Plan</option>
            <option value="ANNUAL">Annual Plan</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4 animate-in fade-in duration-300">
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
          {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Invoices
        </h3>

        {displayedInvoices.length > 0 ? (
          displayedInvoices.map((inv, idx) => (
            <Card
              key={inv.id || inv.virtualId || idx}
              className={`p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-l-4 ${
                inv.blockedReason
                  ? "border-gray-300 bg-gray-50 opacity-80 dark:border-gray-600 dark:bg-gray-800/50"
                  : inv.status === "PAID"
                  ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                  : inv.status === "PROCESSING"
                  ? "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
                  : "border-rose-500"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    {inv.title}
                  </h4>
                  {inv.status === "OVERDUE" && !inv.blockedReason && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full dark:bg-red-900/50 dark:text-red-300">
                      Overdue
                    </span>
                  )}
                  {inv.status === "PAID" && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full dark:bg-green-900/50 dark:text-green-300">
                      Paid
                    </span>
                  )}
                  {inv.status === "PROCESSING" && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full dark:bg-yellow-900/50 dark:text-yellow-300">
                      Processing
                    </span>
                  )}
                  {inv.blockedReason && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-full dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <XCircleIcon className="w-3 h-3" /> Unavailable
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" /> Due Date: {inv.dueDate}
                </p>
                {inv.blockedReason && (
                  <p className="text-xs text-red-500 mt-1 font-medium italic">
                    * {inv.blockedReason}
                  </p>
                )}
              </div>
              <div className="text-right flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <span
                  className={`text-xl font-bold ${
                    inv.status === "PAID"
                      ? "text-green-600 dark:text-green-400"
                      : inv.blockedReason
                      ? "text-gray-400"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  ₹{inv.amount?.toLocaleString()}
                </span>
                {inv.blockedReason ? (
                  <button
                    disabled
                    className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-400 font-bold rounded-lg cursor-not-allowed dark:bg-gray-700 dark:text-gray-600"
                  >
                    Unavailable
                  </button>
                ) : inv.status === "PENDING" || inv.status === "OVERDUE" ? (
                  <button
                    onClick={() => handlePayClick(inv as DisplayInvoice)}
                    className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 shadow-md transition-transform active:scale-95"
                  >
                    Pay Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-400 font-bold rounded-lg cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  >
                    {inv.status === "PROCESSING" ? "Waiting Approval" : "Paid"}
                  </button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center bg-white/50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No invoices currently due for this plan.
            </p>
          </div>
        )}
      </div>

      {/* Payment History Table */}
      {paidHistory.length > 0 && (
        <Card className="p-3 mt-8">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
            Payment History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">
                    Payment Date
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">
                    Invoice
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase">
                    Transaction ID
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase text-right">
                    Amount
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-500 uppercase text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paidHistory.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                      {inv.paymentDate}
                    </td>
                    <td className="p-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {inv.title}
                    </td>
                    <td className="p-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {inv.transactionId || "-"}
                    </td>
                    <td className="p-3 text-sm font-bold text-gray-800 dark:text-gray-200 text-right">
                      ₹{inv.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full dark:bg-green-900/50 dark:text-green-300">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Secure Payment"
        align="center"
      >
        {selectedInvoice && (
          <div>
            {paymentSuccess ? (
              <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Payment Submitted!
                </h3>
                <p className="text-gray-500">
                  Thank you. Your payment for{" "}
                  <strong>{selectedInvoice.title}</strong> is now under review
                  and will be approved shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-4 flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">
                    Amount to Pay:
                  </span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    ₹{selectedInvoice.amount?.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${selectedInvoice.amount?.toLocaleString()}`
                    )}
                  </button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  This is a secure mock payment simulation.
                </p>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeesTab;
