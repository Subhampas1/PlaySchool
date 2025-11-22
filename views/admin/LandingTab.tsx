import React, { useState, useEffect } from "react";
import { LandingPageConfig } from "../../types";
import Card from "../../components/Card";
import { api } from "../../services/api";

const LandingTab: React.FC = () => {
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getLandingConfig();
        setConfig(data);
      } catch (error) {
        console.error("Failed to fetch landing config", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!config) return;
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    try {
      await api.updateLandingConfig(config);
      alert("Landing page updated successfully!");
    } catch (error) {
      alert("Failed to update landing page.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading configuration...
      </div>
    );
  if (!config)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load configuration.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Edit Landing Page</h2>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Info */}
          <Card className="p-3 space-y-4">
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
              General Info
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                School Name
              </label>
              <input
                type="text"
                name="schoolName"
                value={config.schoolName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hero Title
              </label>
              <textarea
                name="heroTitle"
                value={config.heroTitle}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hero Subtitle
              </label>
              <textarea
                name="heroSubtitle"
                value={config.heroSubtitle}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
              Contact Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <textarea
                name="address"
                value={config.address}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={config.contactPhone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="text"
                name="contactEmail"
                value={config.contactEmail}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </Card>

          {/* About Section */}
          <Card className="p-3 space-y-4 md:col-span-2">
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
              About Section
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                About Title
              </label>
              <input
                type="text"
                name="aboutTitle"
                value={config.aboutTitle}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                About Text
              </label>
              <textarea
                name="aboutText"
                value={config.aboutText}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LandingTab;
