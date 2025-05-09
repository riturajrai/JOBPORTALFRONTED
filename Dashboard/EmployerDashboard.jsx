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
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BriefcaseIcon, UserCircle, FileText, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useLoader } from "../pages/LoaderContext";

const API_BASE_URL = "https://jobporatl.onrender.com";

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
        <div className="p-4 text-center bg-[#f2f2f2] min-h-screen">
          <ExclamationCircleIcon className="w-12 h-12 text-[#008080] mx-auto mb-4" />
          <h2 className="text-[#008080] text-lg sm:text-xl font-semibold">Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 bg-[#008080] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 text-sm sm:text-base"
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
  const [state, setState] = useState({
    jobs: [],
    candidates: [],
    loading: true,
    actionLoading: false,
    error: "",
    toast: null,
    search: "",
    statusFilter: "all",
    sortBy: "date",
    candidateFilter: "all",
    sortCandidateBy: "name",
    activeTab: "jobs",
    selectedJobApplications: null,
    selectedCandidate: null,
    messageContent: "",
    selectedCandidateProfile: null,
    currentPage: 1,
    isMobileMenuOpen: false,
  });

  const { setIsLoading } = useLoader();
  const itemsPerPage = 50;
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");
    if (!userId || !token) {
      setState((prev) => ({ ...prev, error: "Please log in to access the dashboard", loading: false }));
      return;
    }
    try {
      setIsLoading(true);
      setState((prev) => ({ ...prev, loading: true }));
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const jobsResponse = await axios.get(`${API_BASE_URL}/api/jobs/user/${userId}`, { headers });
      const employerJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];

      const jobIds = employerJobs.map((job) => job.id);
      let allApplications = [];
      if (jobIds.length > 0) {
        const applicationsPromises = jobIds.map((jobId) =>
          axios.get(`${API_BASE_URL}/api/applications/job/${jobId}`, { headers }).catch(() => ({
            data: { applications: [] },
          }))
        );
        const applicationsResponses = await Promise.all(applicationsPromises);
        allApplications = applicationsResponses
          .flatMap((response) => response.data.applications || [])
          .filter((app) => app && jobIds.includes(app.job_id));
      }

      setState((prev) => ({
        ...prev,
        jobs: employerJobs,
        candidates: allApplications,
        error: employerJobs.length === 0 && allApplications.length === 0 ? "No jobs or candidates found yet." : "",
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.error || "You have not posted any jobs yet",
        loading: false,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const fetchCandidateProfile = useCallback(async (candidateId) => {
    setState((prev) => ({ ...prev, actionLoading: true }));
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/userr/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = { ...response.data, email: response.data.email || "N/A" };
      setState((prev) => ({ ...prev, selectedCandidateProfile: profile, actionLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        toast: { type: "error", message: "Failed to fetch candidate profile." },
        actionLoading: false,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const handleJobAction = useCallback(
    async (jobId, action) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setState((prev) => ({ ...prev, toast: { type: "error", message: "Please log in to perform this action" } }));
        return;
      }
      if (action === "delete" && window.confirm("Are you sure you want to delete this job?")) {
        try {
          setIsLoading(true);
          setState((prev) => ({ ...prev, actionLoading: true }));
          await axios.delete(`${API_BASE_URL}/api/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
          setState((prev) => ({
            ...prev,
            jobs: prev.jobs.filter((job) => job.id !== jobId),
            candidates: prev.candidates.filter((candidate) => candidate.job_id !== jobId),
            toast: { type: "success", message: "Job deleted successfully!" },
            actionLoading: false,
          }));
        } catch (error) {
          setState((prev) => ({
            ...prev,
            toast: { type: "error", message: error.response?.data?.message || "Failed to delete job" },
            actionLoading: false,
          }));
        } finally {
          setIsLoading(false);
        }
      } else if (action === "viewApplications") {
        setState((prev) => ({
          ...prev,
          selectedJobApplications: { jobId, candidates: prev.candidates.filter((c) => c.job_id === jobId) },
        }));
      }
    },
    [state.candidates, setIsLoading]
  );
  const handleCandidateAction = useCallback(
    async (candidateId, action) => {
      const token = localStorage.getItem("token");
      try {
        setIsLoading(true);
        setState((prev) => ({ ...prev, actionLoading: true }));
        const status = action.charAt(0).toUpperCase() + action.slice(1);
        const response = await axios.put(
          `${API_BASE_URL}/api/applications/status/${candidateId}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setState((prev) => ({
          ...prev,
          candidates: prev.candidates.map((c) =>
            c.id === candidateId ? { ...c, status: response.data.application.status } : c
          ),
          selectedJobApplications: prev.selectedJobApplications
            ? {
                ...prev.selectedJobApplications,
                candidates: prev.selectedJobApplications.candidates.map((c) =>
                  c.id === candidateId ? { ...c, status: response.data.application.status } : c
                ),
              }
            : null,
          toast: { type: "success", message: `Candidate status updated to ${status}!` },
          actionLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          toast: { type: "error", message: error.response?.data?.message || "Failed to update candidate status" },
          actionLoading: false,
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [state.selectedJobApplications, setIsLoading]
  );

  const handleSendMessage = useCallback(async () => {
    if (!state.messageContent.trim()) {
      setState((prev) => ({ ...prev, toast: { type: "error", message: "Message cannot be empty." } }));
      return;
    }
    try {
      setIsLoading(true);
      setState((prev) => ({ ...prev, actionLoading: true }));
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/messages`,
        { candidateId: state.selectedCandidate, message: state.messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setState((prev) => ({
        ...prev,
        messageContent: "",
        selectedCandidate: null,
        toast: { type: "success", message: "Message sent successfully!" },
        actionLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        toast: { type: "error", message: "Failed to send message." },
        actionLoading: false,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedCandidate, state.messageContent, setIsLoading]);

  const handlePostJobClick = () => navigate("/job-form");
  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("employertoken");
    navigate("/login");
  };

  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => setState((prev) => ({ ...prev, toast: null })), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, location.state?.refresh]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <div className="p-4 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2 sm:mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredJobs = state.jobs
    .filter((job) => {
      if (!job.title || !job.company) return false;
      const matchesSearch =
        job.title.toLowerCase().includes(state.search.toLowerCase()) ||
        job.company.toLowerCase().includes(state.search.toLowerCase());
      const matchesStatus = state.statusFilter === "all" || (job.status || "active").toLowerCase() === state.statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) =>
      state.sortBy === "applications"
        ? (b.applications || 0) - (a.applications || 0)
        : new Date(b.created_at || b.date_posted || 0) - new Date(a.created_at || a.date_posted || 0)
    );

  const filteredCandidates = state.candidates
    .filter((candidate) => state.candidateFilter === "all" || (candidate.status || "pending").toLowerCase() === state.candidateFilter)
    .sort((a, b) =>
      state.sortCandidateBy === "name"
        ? (a.name || "").localeCompare(b.name || "")
        : new Date(b.applied_at || 0) - new Date(a.applied_at || 0)
    );
  const indexOfLastItem = state.currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalJobPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const totalCandidatePages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setState((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const jobStats = { jobs: state.jobs.length, candidates: state.candidates.length };
  const tabs = [
    { id: "jobs", label: "Job Postings", count: jobStats.jobs, icon: <BriefcaseIcon className="h-5 w-5" /> },
    { id: "candidates", label: "Candidates", count: jobStats.candidates, icon: <UserCircle className="h-5 w-5" /> },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#f2f2f2] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <nav className="flex gap-4 overflow-x-auto border-b border-gray-200 pb-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setState((prev) => ({ ...prev, activeTab: tab.id }))}
                className={`flex items-center gap-2 pb-2 text-sm sm:text-base font-medium whitespace-nowrap ${
                  state.activeTab === tab.id ? "text-[#008080] border-b-2 border-[#008080]" : "text-gray-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon}
                {tab.label} <span className="text-gray-500">({tab.count})</span>
              </motion.button>
            ))}
          </nav>

          <AnimatePresence>
            {state.toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-3 sm:p-4 rounded-lg shadow-lg text-sm sm:text-base max-w-xs sm:max-w-sm w-full flex items-center gap-2 ${
                  state.toast.type === "success" ? "bg-[#008080] text-white" : "bg-red-600 text-white"
                }`}
                style={{ zIndex: 100000 }}
                onClick={() => setState((prev) => ({ ...prev, toast: null }))}
              >
                {state.toast.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5" />
                )}
                {state.toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {state.error && (
            <div className="bg-red-50 p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center gap-3">
              <ExclamationCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
              <span className="text-sm sm:text-base text-red-700 text-center">{state.error}</span>
              <Link
                to="/login"
                className="flex items-center gap-2 bg-[#008080] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base shadow-sm hover:bg-teal-700"
              >
                <UserIcon className="h-5 w-5" />
                Log In
              </Link>
            </div>
          )}

          <div className="space-y-6 sm:space-y-8">
            {state.activeTab === "jobs" && (
              <div>
                <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={state.search}
                      onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
                      placeholder="Search jobs by title or company"
                      className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-sm sm:text-base shadow-sm"
                    />
                    {state.search && (
                      <button
                        onClick={() => setState((prev) => ({ ...prev, search: "" }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <select
                      value={state.statusFilter}
                      onChange={(e) => setState((prev) => ({ ...prev, statusFilter: e.target.value }))}
                      className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-sm sm:text-base shadow-sm w-full sm:w-40 md:w-48"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="paused">Paused</option>
                    </select>
                    <select
                      value={state.sortBy}
                      onChange={(e) => setState((prev) => ({ ...prev, sortBy: e.target.value }))}
                      className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-sm sm:text-base shadow-sm w-full sm:w-40 md:w-48"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="applications">Sort by Applications</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {currentJobs.length > 0 ? (
                    currentJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onAction={handleJobAction}
                        disabled={state.actionLoading}
                      />
                    ))
                  ) : (
                    <EmptyState message="No job postings available." link="/job-form" linkText="Post a Job" />
                  )}
                </div>
                {totalJobPages > 1 && (
                  <Pagination
                    currentPage={state.currentPage}
                    totalPages={totalJobPages}
                    onPageChange={paginate}
                  />
                )}
              </div>
            )}

            {state.activeTab === "candidates" && (
              <div>
                <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <select
                      value={state.candidateFilter}
                      onChange={(e) => setState((prev) => ({ ...prev, candidateFilter: e.target.value }))}
                      className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-sm sm:text-base shadow-sm w-full sm:w-40 md:w-48"
                    >
                      <option value="all">All Candidates</option>
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                    <select
                      value={state.sortCandidateBy}
                      onChange={(e) => setState((prev) => ({ ...prev, sortCandidateBy: e.target.value }))}
                      className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-sm sm:text-base shadow-sm w-full sm:w-40 md:w-48"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="date">Sort by Date</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {currentCandidates.length > 0 ? (
                    currentCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        jobs={state.jobs}
                        onAction={handleCandidateAction}
                        onMessage={() => setState((prev) => ({ ...prev, selectedCandidate: candidate.id }))}
                        onViewProfile={() => fetchCandidateProfile(candidate.user_id)}
                        disabled={state.actionLoading}
                      />
                    ))
                  ) : (
                    <EmptyState message="No candidates have applied yet." />
                  )}
                </div>
                {totalCandidatePages > 1 && (
                  <Pagination
                    currentPage={state.currentPage}
                    totalPages={totalCandidatePages}
                    onPageChange={paginate}
                  />
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {state.selectedJobApplications && (
              <ApplicationsModal
                job={state.jobs.find((j) => j.id === state.selectedJobApplications.jobId)}
                candidates={state.selectedJobApplications.candidates}
                onClose={() => setState((prev) => ({ ...prev, selectedJobApplications: null }))}
                onAction={handleCandidateAction}
                onViewProfile={fetchCandidateProfile}
                disabled={state.actionLoading}
              />
            )}
            {state.selectedCandidate && (
              <MessageModal
                candidate={state.candidates.find((c) => c.id === state.selectedCandidate)}
                messageContent={state.messageContent}
                setMessageContent={(value) => setState((prev) => ({ ...prev, messageContent: value }))}
                onSend={handleSendMessage}
                onClose={() => setState((prev) => ({ ...prev, selectedCandidate: null }))}
                disabled={state.actionLoading}
              />
            )}
            {state.selectedCandidateProfile && (
              <CandidateProfileModal
                candidate={state.selectedCandidateProfile}
                onClose={() => setState((prev) => ({ ...prev, selectedCandidateProfile: null }))}
                disabled={state.actionLoading}
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
  <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="flex flex-col gap-3 sm:gap-4">
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{job.title}</h4>
        <p className="text-sm sm:text-base text-gray-600">{job.company}</p>
        <p className="text-xs sm:text-sm text-gray-500 capitalize">Status: {job.status || "Active"}</p>
        <p className="text-xs sm:text-sm text-gray-500">
          Posted: {new Date(job.created_at || job.date_posted).toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={() => onAction(job.id, "viewApplications")}
          className="flex items-center gap-2 bg-[#008080] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base disabled:opacity-50 shadow-sm hover:bg-teal-700"
          disabled={disabled}
        >
          <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          View Applications
        </button>
        <button
          onClick={() => onAction(job.id, "delete")}
          className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base disabled:opacity-50 shadow-sm hover:bg-red-700"
          disabled={disabled}
        >
          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          Delete
        </button>
      </div>
    </div>
  </div>
);
// CandidateCard Component
const CandidateCard = ({ candidate, jobs, onAction, onMessage, onViewProfile, disabled }) => (
  <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="flex flex-col gap-3 sm:gap-4">
      <div>
        <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{candidate.name || "Unnamed Candidate"}</p>
        <p className="text-sm sm:text-base text-gray-600">Job: {jobs.find((job) => job.id === candidate.job_id)?.title || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Email: {candidate.email || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Phone: {candidate.phone || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">
          Applied: {candidate.applied_at ? new Date(candidate.applied_at).toLocaleDateString() : "N/A"}
        </p>
        {candidate.resume_link && (
          <a
            href={`${API_BASE_URL}${candidate.resume_link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#008080] text-sm sm:text-base font-medium flex items-center gap-1 hover:underline"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            View Resume
          </a>
        )}
        <p className="text-xs">Answers Of Your Questions:{candidate.answers}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <select
          value={candidate.status?.toLowerCase() || "pending"}
          onChange={(e) => onAction(candidate.id, e.target.value)}
          className="p-1 sm:p-2 border border-gray-300 rounded-lg text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-[#008080]"
          disabled={disabled}
        >
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
        <button
          onClick={onMessage}
          className="flex items-center gap-2 bg-[#f2f2f2] text-[#008080] px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base disabled:opacity-50 shadow-sm hover:bg-teal-100"
          disabled={disabled}
        >
          <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          Message
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
    className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
  >
    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[80vh] overflow-y-auto shadow-xl">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5 text-[#008080]" />
          Applications for {job?.title || "Job"}
        </h3>
        <button onClick={onClose} disabled={disabled} className="text-gray-600">
          <XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>
      {candidates.length ? (
        <div className="space-y-4 sm:space-y-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="p-4 sm:p-6 bg-[#f2f2f2] rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {candidate.name || "Unnamed Candidate"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 capitalize">Status: {candidate.status || "Pending"}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Email: {candidate.email || "N/A"}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Applied: {candidate.applied_at ? new Date(candidate.applied_at).toLocaleDateString() : "N/A"}
                  </p>
                  {candidate.resume_link && (
                    <a
                      href={`${API_BASE_URL}${candidate.resume_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#008080] text-sm sm:text-base font-medium flex items-center gap-1 hover:underline"
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      View Resume
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => onViewProfile(candidate.user_id)}
                    className="flex items-center gap-2 bg-[#008080] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base disabled:opacity-50 shadow-sm hover:bg-teal-700"
                    disabled={disabled}
                  >
                    <UserCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Profile
                  </button>
                  <select
                    value={candidate.status?.toLowerCase() || "pending"}
                    onChange={(e) => onAction(candidate.id, e.target.value)}
                    className="p-1 sm:p-2 border border-gray-300 rounded-lg text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-[#008080]"
                    disabled={disabled}
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
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
    className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
  >
    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg shadow-xl">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate flex items-center gap-2">
          <ChatBubbleLeftIcon className="h-5 w-5 text-[#008080]" />
          Message {candidate?.name || "Unnamed Candidate"}
        </h3>
        <button onClick={onClose} disabled={disabled} className="text-gray-600">
          <XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>
      <textarea
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-sm sm:text-base shadow-sm"
        rows="5"
        placeholder="Type your message..."
        disabled={disabled}
      />
      <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6">
        <button
          onClick={onSend}
          className="flex items-center gap-2 bg-[#008080] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 shadow-sm hover:bg-teal-700"
          disabled={disabled}
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          Send
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-gray-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 shadow-sm hover:bg-gray-700"
          disabled={disabled}
        >
          <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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
    className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
  >
    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-[#008080]" />
          Profile: {candidate.name || "Unnamed Candidate"}
        </h3>
        <button onClick={onClose} disabled={disabled} className="text-gray-600">
          <XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>
      {disabled ? (
        <p className="text-center text-gray-600 text-sm sm:text-base">Loading profile...</p>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Name</p>
            <p className="text-base sm:text-lg text-gray-900">{candidate.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Email</p>
            <p className="text-base sm:text-lg text-gray-900">{candidate.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Phone</p>
            <p className="text-base sm:text-lg text-gray-900">{candidate.phone || "N/A"}</p>
          </div>
          {candidate.resume_link && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Resume</p>
              <a
                href={`${API_BASE_URL}${candidate.resume_link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#008080] text-sm sm:text-base font-medium flex items-center gap-1 hover:underline"
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Download Resume
              </a>
            </div>
          )}
          {candidate.applied_at && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Applied On</p>
              <p className="text-base sm:text-lg text-gray-900">{new Date(candidate.applied_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-4 sm:mt-6 w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 shadow-sm hover:bg-gray-700"
        disabled={disabled}
      >
        <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        Close
      </button>
    </div>
  </motion.div>
);

// EmptyState Component
const EmptyState = ({ message, link, linkText }) => (
  <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
    <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#008080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{message}</h3>
    <p className="text-sm sm:text-base text-gray-600 mt-1">Jobs or candidates you manage will appear here.</p>
    {link && (
      <Link
        to={link}
        className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-[#008080] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium shadow-sm hover:bg-teal-700"
      >
        <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        {linkText}
      </Link>
    )}
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-[#f2f2f2] text-[#008080] rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 shadow-sm w-full sm:w-auto hover:bg-teal-100"
    >
      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      Previous
    </button>
    <span className="text-sm sm:text-base text-gray-600">Page {currentPage} of {totalPages}</span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-[#f2f2f2] text-[#008080] rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 shadow-sm w-full sm:w-auto hover:bg-teal-100"
    >
      Next
      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  </div>
);

export default EmployerDashboard;