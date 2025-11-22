import React, { useState } from 'react';

interface AdmissionFormProps {
    onSubmit: (data: { childName: string; parentName: string; parentEmail: string; notes: string; }) => Promise<void>;
}

const AdmissionForm: React.FC<AdmissionFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        childName: '',
        parentName: '',
        parentEmail: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
        // Reset form on successful submission is handled by view change
        // but we'll stop the loading spinner here.
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Child's Full Name</label>
                <input
                    type="text"
                    id="childName"
                    name="childName"
                    value={formData.childName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent's Full Name</label>
                <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent's Email Address</label>
                <input
                    type="email"
                    id="parentEmail"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                />
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Any questions or additional information?"
                ></textarea>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 text-lg font-bold text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-sky-400 to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
        </form>
    );
};

export default AdmissionForm;
