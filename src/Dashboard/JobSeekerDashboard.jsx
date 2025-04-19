import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLoader } from "../pages/LoaderContext";
import Loader from "../pages/Loader";
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ExclamationCircleIcon,
  UserIcon,
  XMarkIcon,
  Bars3Icon,
  TrashIcon,
  PaperAirplaneIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import JobDetailsPC from "../JobsPageForComponents/JobDetailsPC";
import React from "react";
import debounce from "lodash/debounce";

const API_BASE_URL = "https://jobporatl.onrender.com/api";

const JobSeekerDashboard = () => {
  const { setIsLoading, setManualLoading } = useLoader();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const jobsPerPage = 5;

  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("matchScore");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("savedJobs");

  const isMobile = () => window.innerWidth < 1024;

  const fetchData = useCallback(async () => {
    if (!token || !userId) {
      setError("Please log in to access your dashboard.");
      setLoading(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setManualLoading(false);
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const [jobsResponse, savedJobsResponse, appliedJobsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/jobs`, { headers }),
        axios.get(`${API_BASE_URL}/users/${userId}/saved-jobs`, { headers }),
        axios.get(`${API_BASE_URL}/users/${userId}/applied-jobs`, { headers }),
      ]);

      const allJobs = jobsResponse.data.map((job) => ({
        ...job,
        title: job.title || "Untitled Job",
        company: job.company || "Unknown Company",
        location: job.location || "Remote",
        matchScore: job.match_score || Math.floor(Math.random() * 41) + 60,
      }));

      setJobs(allJobs);
      setSavedJobs(savedJobsResponse.data || []);
      setAppliedJobs(appliedJobsResponse.data || []);
    } catch (error) {
      const status = error.response?.status;
      const message =
        status === 404
          ? "Some data is unavailable."
          : status === 403
          ? "Session expired. Please log in again."
          : error.response?.data?.message || "Couldn’t load your dashboard.";
      setError(message);
      if (status === 403) {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [token, userId, navigate, setIsLoading, setManualLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveJob = useCallback(
    async (job) => {
      if (savedJobs.some((saved) => saved.id === job.id)) {
        handleRemoveSavedJob(job.id);
        return;
      }
      setActionLoading(true);
      try {
        setIsLoading(true);
        setManualLoading(false);
        await axios.post(`${API_BASE_URL}/jobs/${job.id}/save`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setToast({ type: "success", message: "Job saved successfully!" });
        fetchData();
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to save job." });
      } finally {
        setIsLoading(false);
        setActionLoading(false);
      }
    },
    [token, fetchData, savedJobs, setIsLoading, setManualLoading]
  );

  const handleRemoveSavedJob = useCallback(
    async (jobId) => {
      setActionLoading(true);
      try {
        setIsLoading(true);
        setManualLoading(false);
        await axios.delete(`${API_BASE_URL}/jobs/${jobId}/save`, { headers: { Authorization: `Bearer ${token}` } });
        setToast({ type: "success", message: "Job removed from saved list!" });
        fetchData();
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to remove job." });
      } finally {
        setIsLoading(false);
        setActionLoading(false);
      }
    },
    [token, fetchData, setIsLoading, setManualLoading]
  );

  const handleApplyJob = useCallback(
    async (job) => {
      setActionLoading(true);
      try {
        setIsLoading(true);
        setManualLoading(false);
        await axios.post(`${API_BASE_URL}/jobs/${job.id}/apply`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setToast({ type: "success", message: "Application submitted successfully!" });
        fetchData();
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to apply to job." });
      } finally {
        setIsLoading(false);
        setActionLoading(false);
      }
    },
    [token, fetchData, setIsLoading, setManualLoading]
  );

  const handleCancelApplication = useCallback(
    async (jobId) => {
      setActionLoading(true);
      try {
        setIsLoading(true);
        setManualLoading(false);
        await axios.delete(`${API_BASE_URL}/applications/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        setToast({ type: "success", message: "Application canceled successfully!" });
        fetchData();
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to cancel application." });
      } finally {
        setIsLoading(false);
        setActionLoading(false);
      }
    },
    [token, fetchData, setIsLoading, setManualLoading]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);
        setCurrentPage(1);
      }, 300),
    []
  );

  const filteredJobs = useMemo(
    () =>
      (activeTab === "savedJobs" ? savedJobs : appliedJobs).filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [savedJobs, appliedJobs, searchQuery, activeTab]
  );

  const sortedJobs = useMemo(
    () =>
      [...filteredJobs].sort((a, b) => {
        if (sortBy === "matchScore") return (b.matchScore || 0) - (a.matchScore || 0);
        if (sortBy === "date") return new Date(b.date_posted || b.created_at || b.applied_at || 0) - new Date(a.date_posted || a.created_at || a.applied_at || 0);
        return 0;
      }),
    [filteredJobs, sortBy]
  );

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    return sortedJobs.slice(start, end);
  }, [sortedJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const jobStats = useMemo(() => ({
    applied: appliedJobs.length,
    saved: savedJobs.length,
  }), [appliedJobs, savedJobs]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleJobClick = (job) => {
    if (isMobile()) {
      setManualLoading(true);
      navigate(`/job/${job.id}`);
      setTimeout(() => setManualLoading(false), 1000);
    } else {
      setSelectedJobId(job.id);
      setSelectedJob(job);
      setManualLoading(true);
      setTimeout(() => setManualLoading(false), 500);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedJobId(null);
    setSelectedJob(null);
    setManualLoading(true);
    setTimeout(() => setManualLoading(false), 500);
  };

  if (loading) return <Loader />;

  const tabs = [
    { id: "savedJobs", label: "Saved", count: jobStats.saved, icon: <BookmarkIcon className="h-5 w-5" /> },
    { id: "applications", label: "Applied", count: jobStats.applied, icon: <CheckCircleIcon className="h-5 w-5" /> },
  ];

  const jobDetailsProps = {
    job: selectedJob,
    isSaved: savedJobs.some((j) => j.id === selectedJobId),
    shareTooltip: false,
    isReported: false,
    hasApplied: appliedJobs.some((j) => j.id === selectedJobId),
    actionFeedback: null,
    showFullDescription: false,
    handleSave: () => handleSaveJob(selectedJob),
    handleShare: () => console.log("Share clicked"),
    handleShowReportModal: () => console.log("Report clicked"),
    handleApply: () => handleApplyJob(selectedJob),
    toggleDescription: () => console.log("Toggle description"),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <button
      onClick={() => navigate(-1)}
      className="flex items-center text-black hover:text-black"
    >
      <span className="mr-2">
        {/* Back Arrow Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </span>
      Back
    </button>

          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => console.log("Notifications clicked")}
              aria-label="Notifications"
            >
              <BellIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar (Hidden on mobile, visible on desktop) */}
          <aside className="hidden lg:block bg-white rounded-lg shadow-sm p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setManualLoading(true);
                    setTimeout(() => setManualLoading(false), 500);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
                    activeTab === tab.id ? "bg-teal-600 text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label} ({tab.count})
                </button>
              ))}
              <button
                onClick={() => {
                  navigate("/jobs");
                  setManualLoading(true);
                  setTimeout(() => setManualLoading(false), 500);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                Find Jobs
              </button>
              <button
                onClick={() => {
                  navigate("/profile");
                  setManualLoading(true);
                  setTimeout(() => setManualLoading(false), 500);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <UserIcon className="h-5 w-5" />
               Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                  setManualLoading(true);
                  setTimeout(() => setManualLoading(false), 500);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <UserIcon className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {selectedJobId ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={handleBackToDashboard}
                  className="mb-4 flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-teal-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Dashboard
                </button>
                <div className="hidden lg:block">
                  <JobDetailsPC {...jobDetailsProps} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs (Mobile Only) */}
                <nav className="lg:hidden flex gap-4 border-b border-gray-300 pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setManualLoading(true);
                        setTimeout(() => setManualLoading(false), 500);
                      }}
                      className={`flex items-center gap-2 pb-2 text-sm font-medium ${
                        activeTab === tab.id ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-600"
                      }`}
                    >
                      {tab.icon}
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </nav>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 p-4 rounded-lg shadow-md flex flex-col items-center gap-3">
                    <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
                    <span className="text-sm text-red-700 text-center">{error}</span>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-teal-700"
                    >
                      <UserIcon className="h-5 w-5" />
                      Log In
                    </Link>
                  </div>
                )}

                {/* Search and Sort */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => debouncedSearch(e.target.value)}
                        placeholder="Search your jobs..."
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-sm shadow-sm bg-white"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-sm shadow-sm w-full sm:w-40 bg-white"
                    >
                      <option value="matchScore">Sort by Match Score</option>
                      <option value="date">Sort by Date</option>
                    </select>
                  </div>

                  {/* Job Cards */}
                  {paginatedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {paginatedJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          isSavedJob={activeTab === "savedJobs"}
                          onRemove={handleRemoveSavedJob}
                          onApply={handleApplyJob}
                          onCancel={handleCancelApplication}
                          onClick={() => handleJobClick(job)}
                          disabled={actionLoading}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      message={activeTab === "savedJobs" ? "No jobs saved yet" : "No jobs applied yet"}
                      link="/"
                      linkText="Find Jobs"
                    />
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="w-3/4 max-w-xs bg-white h-full p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                    setManualLoading(true);
                    setTimeout(() => setManualLoading(false), 500);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg ${
                    activeTab === tab.id ? "bg-teal-600 text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label} ({tab.count})
                </button>
              ))}
              <button
                onClick={() => {
                  navigate("/");
                  setIsMobileMenuOpen(false);
                  setManualLoading(true);
                  setTimeout(() => setManualLoading(false), 500);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                Find Jobs
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                  setManualLoading(true);
                  setTimeout(() => setManualLoading(false), 500);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <UserIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg text-sm max-w-xs w-full flex items-center gap-2 ${
            toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"
          }`}
          onClick={() => setToast(null)}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

// Reusable Job Card Component
const JobCard = ({ job, isSavedJob, onRemove, onApply, onCancel, onClick, disabled }) => (
  <article
    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
    onClick={onClick}
  >
    <div className="flex flex-col gap-3">
      <div>
        <h4 className="text-base font-semibold text-gray-900 line-clamp-1">
          <span className="text-teal-600 hover:text-teal-700">{job.title}</span>
        </h4>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-600" />
          {job.company} • {job.location}
        </p>
        {job.salary_min && job.salary_max && (
          <p className="text-xs text-gray-500 mt-1">
            ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} {job.salary_type}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Posted {new Date(job.date_posted || job.created_at || 0).toLocaleDateString()}
        </p>
        {isSavedJob ? (
          <p className="text-xs text-gray-500 mt-1">Match Score: {job.matchScore}%</p>
        ) : (
          <span
            className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
              job.status === "Hired"
                ? "bg-teal-100 text-teal-800"
                : job.status === "Shortlisted"
                ? "bg-cyan-100 text-cyan-800"
                : job.status === "Rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {job.status || "Pending"}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {isSavedJob ? (
          <>
            <button
              onClick={() => onApply(job)}
              className="flex items-center gap-2 bg-teal-600 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50 shadow-sm hover:bg-teal-700"
              disabled={disabled}
              aria-label={`Apply to ${job.title}`}
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              Apply
            </button>
            <button
              onClick={() => onRemove(job.id)}
              className="flex items-center gap-2 bg-gray-100 text-teal-600 px-3 py-1 rounded-lg text-sm disabled:opacity-50 shadow-sm hover:bg-gray-200"
              disabled={disabled}
              aria-label={`Remove ${job.title} from saved jobs`}
            >
              <TrashIcon className="h-4 w-4" />
              Remove
            </button>
          </>
        ) : (job.status === "Pending" || job.status === "Applied") && (
          <button
            onClick={() => onCancel(job.id)}
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50 shadow-sm hover:bg-red-700"
            disabled={disabled}
            aria-label={`Cancel application for ${job.title}`}
          >
            <TrashIcon className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  </article>
);

const EmptyState = ({ message, link, linkText }) => (
  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
    <svg
      className="w-16 h-16 mx-auto mb-4 text-teal-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
    <p className="text-sm text-gray-600 mt-1">Jobs you save or apply to will appear here.</p>
    <Link
      to={link}
      className="mt-6 inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-teal-700"
    >
      <MagnifyingGlassIcon className="h-4 w-4" />
      {linkText}
    </Link>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-teal-600 rounded-lg text-sm font-medium disabled:opacity-50 shadow-sm hover:bg-gray-200 w-full sm:w-auto"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <div className="flex gap-2">
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              currentPage === page
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-teal-600 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-teal-600 rounded-lg text-sm font-medium disabled:opacity-50 shadow-sm hover:bg-gray-200 w-full sm:w-auto"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default JobSeekerDashboard;
