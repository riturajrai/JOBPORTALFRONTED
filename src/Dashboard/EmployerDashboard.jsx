import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import React from "react";
import {
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BriefcaseIcon, UserIcon as LucideUserIcon } from "lucide-react";

const API_BASE_URL = "https://jobportalapi.up.railway.app";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-red-600 text-lg font-semibold">Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [candidates, setCandidates] = useState([]);
  const [candidateFilter, setCandidateFilter] = useState("all");
  const [sortCandidateBy, setSortCandidateBy] = useState("name");
  const [activeTab, setActiveTab] = useState("jobs");
  const [selectedJobApplications, setSelectedJobApplications] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("employertoken");

    if (!userId || !token) {
      setError("Please log in to access the dashboard");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      // Fetch jobs
      const jobsResponse = await axios.get(`${API_BASE_URL}/api/jobs/user/${userId}`, { headers });
      const employerJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
      console.log("Fetched Jobs:", employerJobs);
      setJobs(employerJobs);

      // Fetch applications for each job
      const jobIds = employerJobs.map((job) => job.id);
      console.log("Job IDs:", jobIds);
      let allApplications = [];
      if (jobIds.length > 0) {
        const applicationsPromises = jobIds.map((jobId) =>
          axios
            .get(`${API_BASE_URL}/api/applications/job/${jobId}`, { headers })
            .catch((err) => {
              console.error(`Error fetching applications for job ${jobId}:`, err.response?.data || err.message);
              return { data: { applications: [] } };
            })
        );
        const applicationsResponses = await Promise.all(applicationsPromises);
        allApplications = applicationsResponses
          .flatMap((response) => {
            const apps = response.data.applications || [];
            console.log(`Applications for job ${response.config.url.split('/').pop()}:`, apps);
            return apps;
          })
          .filter((app) => app && jobIds.includes(app.job_id));
      } else {
        console.log("No job IDs found, skipping applications fetch.");
      }
      console.log("All Applications:", allApplications);
      setCandidates(allApplications);

      if (employerJobs.length === 0 && allApplications.length === 0) {
        setError("No jobs or candidates found yet.");
      } else {
        setError("");
      }
    } catch (error) {
      console.error("Fetch Data Error:", error.response?.data || error.message);
      setError(
        error.response?.status === 404 || error.response?.data?.message?.includes("No jobs found")
          ? "No jobs or candidates found yet."
          : error.response?.data?.error || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, location.state?.refresh]);

  const handleJobAction = useCallback(
    async (jobId, action) => {
      const token = localStorage.getItem("employertoken");
      if (!token) {
        setToast({ type: "error", message: "Please log in to perform this action" });
        return;
      }

      if (action === "delete" && window.confirm("Are you sure you want to delete this job?")) {
        try {
          setActionLoading(true);
          await axios.delete(`${API_BASE_URL}/api/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
          setJobs((prev) => prev.filter((job) => job.id !== jobId));
          setCandidates((prev) => prev.filter((candidate) => candidate.job_id !== jobId));
          setToast({ type: "success", message: "Job deleted successfully!" });
        } catch (error) {
          setToast({ type: "error", message: error.response?.data?.message || "Failed to delete job" });
        } finally {
          setActionLoading(false);
        }
      } else if (action === "viewApplications") {
        const jobCandidates = candidates.filter((candidate) => candidate.job_id === jobId);
        console.log(`Viewing applications for job ${jobId}:`, jobCandidates);
        setSelectedJobApplications({ jobId, candidates: jobCandidates });
      }
    },
    [candidates]
  );

  const handleCandidateAction = useCallback(
    async (candidateId, action) => {
      const token = localStorage.getItem("employertoken");
      try {
        setActionLoading(true);
        const status = action.charAt(0).toUpperCase() + action.slice(1); // Capitalize first letter
        const response = await axios.put(
          `${API_BASE_URL}/api/applications/status/${candidateId}`, // Updated to new endpoint
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate.id === candidateId ? { ...candidate, status: response.data.application.status } : candidate
          )
        );
        if (selectedJobApplications) {
          setSelectedJobApplications((prev) => ({
            ...prev,
            candidates: prev.candidates.map((candidate) =>
              candidate.id === candidateId ? { ...candidate, status: response.data.application.status } : candidate
            ),
          }));
        }
        setToast({ type: "success", message: `Candidate status updated to ${status}!` });
      } catch (error) {
        console.error("Error updating candidate status:", error.response?.data || error.message);
        setToast({ type: "error", message: error.response?.data?.message || "Failed to update candidate status" });
      } finally {
        setActionLoading(false);
      }
    },
    [selectedJobApplications]
  );

  const fetchCandidateProfile = useCallback(async (candidateId) => {
    setActionLoading(true);
    const token = localStorage.getItem("employertoken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/userr/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Candidate Profile:", response.data);
      setSelectedCandidateProfile(response.data);
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch candidate profile." });
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageContent.trim()) {
      setToast({ type: "error", message: "Message cannot be empty." });
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("employertoken");
      await axios.post(
        `${API_BASE_URL}/api/messages`,
        { candidateId: selectedCandidate, message: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageContent("");
      setSelectedCandidate(null);
      setToast({ type: "success", message: "Message sent successfully!" });
    } catch (error) {
      setToast({ type: "error", message: "Failed to send message." });
    } finally {
      setActionLoading(false);
    }
  }, [selectedCandidate, messageContent]);

  const handlePostJobClick = () => navigate("/job-form");
  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("employertoken");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg font-medium flex items-center gap-2">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Loading Dashboard...
        </div>
      </div>
    );
  }

  const filteredJobs = jobs
    .filter((job) => {
      if (!job.title || !job.company) return false;
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || (job.status || "active").toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) =>
      sortBy === "applications"
        ? (b.applications || 0) - (a.applications || 0)
        : new Date(b.created_at || b.date_posted || 0) - new Date(a.created_at || a.date_posted || 0)
    );

  const filteredCandidates = candidates
    .filter(
      (candidate) => candidateFilter === "all" || (candidate.status || "pending").toLowerCase() === candidateFilter
    )
    .sort((a, b) => {
      if (sortCandidateBy === "name") {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      }
      return new Date(b.applied_at || 0) - new Date(a.applied_at || 0);
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalJobPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const totalCandidatePages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const tabs = [
    { id: "jobs", label: "Job Postings", icon: <BriefcaseIcon className="h-5 w-5" /> },
    { id: "candidates", label: "Candidates", icon: <LucideUserIcon className="h-5 w-5" /> },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-4 px-2 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4 bg-white p-4 rounded-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Employer Dashboard</h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">Manage your job postings and candidates</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePostJobClick}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors border border-indigo-600 disabled:opacity-50 w-full sm:w-auto"
                  disabled={actionLoading}
                >
                  Post a Job
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors border border-red-600 w-full sm:w-autoreferrals"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-2 right-2 p-3 rounded-md border ${
                  toast.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                } text-xs sm:text-sm font-medium z-50`}
                onClick={() => setToast(null)}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
              <XMarkIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-md border border-gray-200">
            {/* Tabs */}
            <nav className="flex flex-wrap gap-1 p-2 sm:p-4 border-b border-gray-200 bg-gray-50 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md border ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200"
                  } transition-colors whitespace-nowrap`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <button
                onClick={fetchData}
                className="ml-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-200"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </nav>

            {/* Tab Content */}
            <div className="p-2 sm:p-6 space-y-4">
              {activeTab === "jobs" && (
                <div>
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search jobs by title or company"
                        className="w-full pl-8 sm:pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm w-full sm:w-36"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="paused">Paused</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm w-full sm:w-36"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="applications">Sort by Applications</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {currentJobs.length > 0 ? (
                      currentJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onAction={handleJobAction}
                          disabled={actionLoading}
                        />
                      ))
                    ) : (
                      <EmptyState message="No job postings available." link="/job-form" linkText="Post a Job" />
                    )}
                  </div>
                  {totalJobPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalJobPages}
                      onPageChange={paginate}
                    />
                  )}
                </div>
              )}

              {activeTab === "candidates" && (
                <div>
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={candidateFilter}
                        onChange={(e) => setCandidateFilter(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm w-full sm:w-36"
                      >
                        <option value="all">All Candidates</option>
                        <option value="pending">Pending</option>
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                        <option value="reviewed">Reviewed</option>
                      </select>
                      <select
                        value={sortCandidateBy}
                        onChange={(e) => setSortCandidateBy(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm w-full sm:w-36"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="date">Sort by Date</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {currentCandidates.length > 0 ? (
                      currentCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          jobs={jobs}
                          onAction={handleCandidateAction}
                          onMessage={() => setSelectedCandidate(candidate.id)}
                          onViewProfile={() => fetchCandidateProfile(candidate.user_id)}
                          disabled={actionLoading}
                        />
                      ))
                    ) : (
                      <EmptyState message="No candidates have applied yet." />
                    )}
                  </div>
                  {totalCandidatePages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalCandidatePages}
                      onPageChange={paginate}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {selectedJobApplications && (
              <ApplicationsModal
                job={jobs.find((j) => j.id === selectedJobApplications.jobId)}
                candidates={selectedJobApplications.candidates}
                onClose={() => setSelectedJobApplications(null)}
                onAction={handleCandidateAction}
                onViewProfile={fetchCandidateProfile}
                disabled={actionLoading}
              />
            )}
            {selectedCandidate && (
              <MessageModal
                candidate={candidates.find((c) => c.id === selectedCandidate)}
                messageContent={messageContent}
                setMessageContent={setMessageContent}
                onSend={handleSendMessage}
                onClose={() => setSelectedCandidate(null)}
                disabled={actionLoading}
              />
            )}
            {selectedCandidateProfile && (
              <CandidateProfileModal
                candidate={selectedCandidateProfile}
                onClose={() => setSelectedCandidateProfile(null)}
                disabled={actionLoading}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// JobCard Component
const JobCard = ({ job, onAction, disabled }) => (
  <div className="p-3 bg-white border border-gray-200 rounded-md">
    <div className="flex flex-col gap-2">
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{job.title}</h4>
        <p className="text-xs sm:text-sm text-gray-600">{job.company}</p>
        <p className="text-xs text-gray-500 capitalize">Status: {job.status || "Active"}</p>
        <p className="text-xs text-gray-500">
          Posted: {new Date(job.created_at || job.date_posted).toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onAction(job.id, "viewApplications")}
          className="text-indigo-600 text-xs sm:text-sm font-medium flex items-center gap-1 disabled:opacity-50 w-full sm:w-auto"
          disabled={disabled}
        >
          <EyeIcon className="h-4 w-4" /> View Applications
        </button>
        <button
          onClick={() => onAction(job.id, "delete")}
          className="text-red-600 text-xs sm:text-sm font-medium flex items-center gap-1 disabled:opacity-50 w-full sm:w-auto"
          disabled={disabled}
        >
          <TrashIcon className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
  </div>
);

// CandidateCard Component
const CandidateCard = ({ candidate, jobs, onAction, onMessage, onViewProfile, disabled }) => (
  <div className="p-3 bg-white border border-gray-200 rounded-md">
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
          {candidate.name || "Unnamed Candidate"}
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          Job: {jobs.find((job) => job.id === candidate.job_id)?.title || "N/A"}
        </p>
        <p className="text-xs text-gray-500">Email: {candidate.email || "N/A"}</p>
        <p className="text-xs text-gray-500">Phone: {candidate.phone || "N/A"}</p>
        <p className="text-xs text-gray-500">
          Applied: {candidate.applied_at ? new Date(candidate.applied_at).toLocaleDateString() : "N/A"}
        </p>
        {candidate.resume_link && (
          <a
            href={`${API_BASE_URL}${candidate.resume_link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 text-xs sm:text-sm font-medium"
          >
            View Resume
          </a>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onViewProfile}
          className="text-indigo-600 text-xs sm:text-sm font-medium flex items-center gap-1 disabled:opacity-50 w-full sm:w-auto"
          disabled={disabled}
        >
          <UserIcon className="h-4 w-4" /> Profile
        </button>
        <select
          value={candidate.status?.toLowerCase() || "pending"}
          onChange={(e) => onAction(candidate.id, e.target.value)}
          className="p-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm w-full sm:w-32"
          disabled={disabled}
        >
          <option value="pending">Pending</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
          <option value="reviewed">Reviewed</option>
        </select>
        <button
          onClick={onMessage}
          className="text-indigo-600 text-xs sm:text-sm font-medium flex items-center gap-1 disabled:opacity-50 w-full sm:w-auto"
          disabled={disabled}
        >
          <ChatBubbleLeftIcon className="h-4 w-4" /> Message
        </button>
      </div>
    </div>
  </div>
);

// ApplicationsModal Component
const ApplicationsModal = ({ job, candidates, onClose, onAction, onViewProfile, disabled }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
  >
    <div className="bg-white rounded-md p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          Applications for {job?.title || "Job"}
        </h3>
        <button onClick={onClose} disabled={disabled}>
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
      </div>
      {candidates.length ? (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {candidate.name || "Unnamed Candidate"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    Status: {candidate.status || "Pending"}
                  </p>
                  <p className="text-xs text-gray-500">Email: {candidate.email || "N/A"}</p>
                  <p className="text-xs text-gray-500">
                    Applied: {candidate.applied_at ? new Date(candidate.applied_at).toLocaleDateString() : "N/A"}
                  </p>
                  {candidate.resume_link && (
                    <a
                      href={`${API_BASE_URL}${candidate.resume_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-xs sm:text-sm font-medium"
                    >
                      View Resume
                    </a>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onViewProfile(candidate.user_id)}
                    className="text-indigo-600 text-xs sm:text-sm font-medium flex items-center gap-1 disabled:opacity-50 w-full sm:w-auto"
                    disabled={disabled}
                  >
                    <UserIcon className="h-4 w-4" /> Profile
                  </button>
                  <select
                    value={candidate.status?.toLowerCase() || "pending"}
                    onChange={(e) => onAction(candidate.id, e.target.value)}
                    className="p-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm w-full sm:w-32"
                    disabled={disabled}
                  >
                    <option value="pending">Pending</option>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No applications yet for this job." />
      )}
    </div>
  </motion.div>
);

// MessageModal Component
const MessageModal = ({ candidate, messageContent, setMessageContent, onSend, onClose, disabled }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
  >
    <div className="bg-white rounded-md p-4 w-full max-w-md border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          Message {candidate?.name || "Unnamed Candidate"}
        </h3>
        <button onClick={onClose} disabled={disabled}>
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
      </div>
      <textarea
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        rows="4"
        placeholder="Type your message..."
        disabled={disabled}
      />
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <button
          onClick={onSend}
          className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm font-medium border border-indigo-600 disabled:opacity-50 w-full sm:w-auto"
          disabled={disabled}
        >
          Send
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm font-medium border border-gray-600 disabled:opacity-50 w-full sm:w-auto"
          disabled={disabled}
        >
          Close
        </button>
      </div>
    </div>
  </motion.div>
);

// CandidateProfileModal Component
const CandidateProfileModal = ({ candidate, onClose, disabled }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
  >
    <div className="bg-white rounded-md p-4 w-full max-w-md max-h-[80vh] overflow-y-auto border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          Profile: {candidate.name || "Unnamed Candidate"}
        </h3>
        <button onClick={onClose} disabled={disabled}>
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
      </div>
      {disabled ? (
        <p className="text-center text-gray-600 text-sm">Loading profile...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-600">Name</p>
            <p className="text-sm sm:text-base text-gray-900">{candidate.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Email</p>
            <p className="text-sm sm:text-base text-gray-900">{candidate.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Phone</p>
            <p className="text-sm sm:text-base text-gray-900">{candidate.phone || "N/A"}</p>
          </div>
          {candidate.resume_link && (
            <div>
              <p className="text-xs text-gray-600">Resume</p>
              <a
                href={`${API_BASE_URL}${candidate.resume_link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 text-sm font-medium"
              >
                Download Resume
              </a>
            </div>
          )}
          {candidate.applied_at && (
            <div>
              <p className="text-xs text-gray-600">Applied On</p>
              <p className="text-sm sm:text-base text-gray-900">
                {new Date(candidate.applied_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-4 w-full bg-gray-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm font-medium border border-gray-600 disabled:opacity-50"
        disabled={disabled}
      >
        Close
      </button>
    </div>
  </motion.div>
);

// EmptyState Component
const EmptyState = ({ message, link, linkText }) => (
  <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
    <p className="text-gray-600 text-xs sm:text-sm mb-2">{message}</p>
    {link && (
      <Link
        to={link}
        className="text-indigo-600 text-xs sm:text-sm font-medium bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200"
      >
        {linkText}
      </Link>
    )}
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
    <button
      onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200 text-xs sm:text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
    >
      Previous
    </button>
    <span className="text-xs sm:text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
    <button
      onClick={() => onPageChange((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200 text-xs sm:text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
    >
      Next
    </button>
  </div>
);

export default EmployerDashboard;