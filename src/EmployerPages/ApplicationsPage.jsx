import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeIcon,
} from "../assets/Icons"; // Assuming these icons are added

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [applications, setApplications] = useState([
    {
      id: 1,
      applicantName: "John Doe",
      jobTitle: "Software Engineer",
      status: "Pending",
      dateApplied: "2025-04-01",
      resume: "https://example.com/resume1.pdf",
    },
    {
      id: 2,
      applicantName: "Jane Smith",
      jobTitle: "Product Manager",
      status: "Reviewed",
      dateApplied: "2025-03-28",
      resume: "https://example.com/resume2.pdf",
    },
    {
      id: 3,
      applicantName: "Alice Johnson",
      jobTitle: "UI/UX Designer",
      status: "Accepted",
      dateApplied: "2025-03-25",
      resume: "https://example.com/resume3.pdf",
    },
    {
      id: 4,
      applicantName: "Bob Brown",
      jobTitle: "Data Analyst",
      status: "Rejected",
      dateApplied: "2025-03-20",
      resume: "https://example.com/resume4.pdf",
    },
  ]);

  // Analytics calculation
  const analytics = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "Pending").length,
    reviewed: applications.filter((app) => app.status === "Reviewed").length,
    accepted: applications.filter((app) => app.status === "Accepted").length,
    rejected: applications.filter((app) => app.status === "Rejected").length,
  };

  // Filter and search logic
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Update application status
  const updateStatus = (id, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <div className="bg-white shadow-md p-3 sm:p-4 md:p-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Applications Dashboard
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Analytics */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Application Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">{analytics.total}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">{analytics.pending}</p>
              <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">{analytics.reviewed}</p>
              <p className="text-xs sm:text-sm text-gray-500">Reviewed</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">{analytics.accepted}</p>
              <p className="text-xs sm:text-sm text-gray-500">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">{analytics.rejected}</p>
              <p className="text-xs sm:text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm sm:text-base"
              placeholder="Search by name or job title"
            />
            <button className="p-2 bg-[#008080] text-white rounded-md hover:bg-[#006666] transition-colors">
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none p-2 pr-8 border rounded-md text-sm sm:text-base bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Job Applications
          </h2>
          {filteredApplications.length === 0 ? (
            <p className="text-sm text-gray-500">No applications found.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-md"
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-sm sm:text-base md:text-lg">{app.applicantName}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      <BriefcaseIcon className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {app.jobTitle}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">Applied: {app.dateApplied}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <span
                      className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
                        app.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : app.status === "Reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : app.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.status}
                    </span>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="p-1 border rounded-md text-xs sm:text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => navigate(`/application/${app.id}`)}
                      className="p-1 sm:p-2 text-[#008080] hover:text-[#006666]"
                    >
                      <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 sm:p-2 text-[#008080] hover:text-[#006666]"
                    >
                      <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





export default ApplicationsPage;