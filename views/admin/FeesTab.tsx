import React, { useState, useMemo } from "react";
import { FeeInvoice, Student, FeeStatus } from "../../types";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import {
  BanknotesIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ClipboardListIcon,
} from "../../components/icons";
import { api } from "../../services/api";

interface FeesTabProps {
  fees: FeeInvoice[];
  students: Student[];
  onCreateInvoice: (data: {
    studentId: string;
    title: string;
    amount: number;
    dueDate: string;
  }) => Promise<void>;
  onMarkPaid: (invoiceId: string) => Promise<void>;
  onUpdateStatus: (invoiceId: string, status: FeeStatus) => Promise<void>;
}

const FeesTab: React.FC<FeesTabProps> = ({
  fees,
  students,
  onCreateInvoice,
  onMarkPaid,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    studentId: "",
    title: "",
    amount: "",
    dueDate: "",
  });

  // Edit Status Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<FeeStatus>("PENDING");
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const filteredFees = useMemo(() => {
    return fees.filter((inv) => {
      const student = students.find((s) => s.id === inv.studentId);
      const studentName = student ? student.name.toLowerCase() : "";
      const matchesSearch =
        studentName.includes(searchQuery.toLowerCase()) ||
        inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [fees, students, searchQuery, filterStatus]);

  const getStudentInfo = (id: string) => {
    const s = students.find((st) => st.id === id);
    return s
      ? { name: s.name, plan: s.feePlan }
      : { name: "Unknown", plan: undefined };
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !createForm.studentId ||
      !createForm.title ||
      !createForm.amount ||
      !createForm.dueDate
    ) {
      alert("All fields are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreateInvoice({
        ...createForm,
        amount: Number(createForm.amount),
      });
      setIsCreateModalOpen(false);
      setCreateForm({ studentId: "", title: "", amount: "", dueDate: "" });
      alert("Invoice created successfully");
    } catch (e) {
      alert("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveClick = async (id: string) => {
    if (!confirm("Approve this payment?")) return;
    setIsMarkingPaid(true);
    try {
      await onUpdateStatus(id, "PAID");
    } catch (e) {
      alert("Failed to approve");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const openEditStatus = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    setIsEditStatusOpen(true);
  };

  const handleStatusUpdateSubmit = async () => {
    if (!selectedInvoice) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(selectedInvoice.id, newStatus);
      setIsEditStatusOpen(false);
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold">Fee Management</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search student, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="All">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-md hover:bg-rose-600 shadow-sm whitespace-nowrap"
            >
              + Create Invoice
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                  Invoice ID
                </th>
                <th className="p-4 font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                  Student
                </th>
                <th className="p-4 font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                  Title
                </th>
                <th className="p-4 font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                  Amount
                </th>
                <th className="p-4 font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                  Due Date
                </th>
                <th className="p-4 font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="p-4 font-semibold text-xs uppercase text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredFees.map((inv) => {
                const studentInfo = getStudentInfo(inv.studentId);
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-4 text-sm font-mono text-gray-500">
                      {inv.id}
                    </td>
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                          <UserCircleIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {studentInfo.name}
                          </div>
                          {studentInfo.plan && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 uppercase">
                              {studentInfo.plan} Plan
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {inv.title}
                      {inv.type && inv.type !== "OTHER" && (
                        <span className="ml-2 text-[10px] text-gray-400">
                          ({inv.type})
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-gray-800 dark:text-gray-100">
                      ₹{inv.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {inv.dueDate}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          inv.status === "PAID"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                            : inv.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                            : inv.status === "OVERDUE"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {inv.status === "PROCESSING" && (
                        <button
                          onClick={() => handleApproveClick(inv.id)}
                          disabled={isMarkingPaid}
                          className="p-1 text-green-600 hover:bg-green-100 rounded dark:hover:bg-green-900/30 transition-colors"
                          title="Approve Payment"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditStatus(inv)}
                        className="p-1 text-blue-500 hover:bg-blue-100 rounded dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit Status"
                      >
                        <ClipboardListIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Fee Invoice"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Student
            </label>
            <select
              value={createForm.studentId}
              onChange={(e) =>
                setCreateForm({ ...createForm, studentId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.batch})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invoice Title
            </label>
            <input
              type="text"
              placeholder="e.g. Annual Fee 2024"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm({ ...createForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={createForm.amount}
                onChange={(e) =>
                  setCreateForm({ ...createForm, amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={createForm.dueDate}
                onChange={(e) =>
                  setCreateForm({ ...createForm, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        isOpen={isEditStatusOpen}
        onClose={() => setIsEditStatusOpen(false)}
        title="Update Invoice Status"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Manually update status for <strong>{selectedInvoice?.title}</strong>
            .
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as FeeStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">
                Processing (Paid, Waiting Approval)
              </option>
              <option value="PAID">Paid (Approved)</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
          <button
            onClick={handleStatusUpdateSubmit}
            disabled={isUpdatingStatus}
            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isUpdatingStatus ? "Updating..." : "Update Status"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FeesTab;
