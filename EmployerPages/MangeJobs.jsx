import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useLoader } from "../pages/LoaderContext";

// Update API_BASE_URL to match your deployed backend
const API_BASE_URL = " https://jobporatl.onrender.com/api";

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
        <div className="p-4 text-center bg-gray-100 min-h-screen">
          <ExclamationCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-teal-600 text-lg sm:text-xl md:text-2xl font-semibold">Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-teal-700 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ManageJobsPage = () => {
  const [state, setState] = useState({
    jobs: [],
    totalPages: 1,
    loading: true,
    actionLoading: false,
    error: "",
    toast: null,
    search: "",
    statusFilter: "all",
    sortBy: "title",
    currentPage: 1,
    showAddModal: false,
    showEditModal: null,
  });

  const { setIsLoading } = useLoader();
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState((prev) => ({ ...prev, error: "Please log in to manage jobs", loading: false }));
      return;
    }

    try {
      setIsLoading(true);
      setState((prev) => ({ ...prev, loading: true }));
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const params = new URLSearchParams({
        search: state.search,
        status: state.statusFilter,
        sortBy: state.sortBy,
        page: state.currentPage,
        limit: itemsPerPage,
      });

      console.log("Fetching jobs with params:", params.toString());
      const response = await axios.get(`${API_BASE_URL}/jobs?${params.toString()}`, { headers }); // Adjusted endpoint
      console.log("API Response:", response.data);

      // Ensure jobs is an array, even if the response structure differs
      const jobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
      const totalPages = response.data.totalPages || 1;

      setState((prev) => ({
        ...prev,
        jobs,
        totalPages,
        error: jobs.length === 0 ? "No jobs found yet." : "",
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching jobs:", error.response?.status, error.response?.data);
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Failed to fetch jobs",
        loading: false,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [state.search, state.statusFilter, state.sortBy, state.currentPage, setIsLoading]);

  const handleAddJob = async (jobData) => {
    const token = localStorage.getItem("token");
    try {
      setState((prev) => ({ ...prev, actionLoading: true }));
      const response = await axios.post(`${API_BASE_URL}/jobs`, jobData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setState((prev) => ({
        ...prev,
        jobs: [...prev.jobs, response.data],
        toast: { type: "success", message: "Job added successfully!" },
        showAddModal: false,
        actionLoading: false,
      }));
      fetchJobs();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        toast: { type: "error", message: error.response?.data?.message || "Failed to add job." },
        actionLoading: false,
      }));
    }
  };

  const handleEditJob = async (jobId, jobData) => {
    const token = localStorage.getItem("token");
    try {
      setState((prev) => ({ ...prev, actionLoading: true }));
      await axios.put(`${API_BASE_URL}/jobs/${jobId}`, jobData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setState((prev) => ({
        ...prev,
        toast: { type: "success", message: "Job updated successfully!" },
        showEditModal: null,
        actionLoading: false,
      }));
      fetchJobs();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        toast: { type: "error", message: error.response?.data?.message || "Failed to update job." },
        actionLoading: false,
      }));
    }
  };

  const handleDeleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      setState((prev) => ({ ...prev, actionLoading: true }));
      await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState((prev) => ({
        ...prev,
        jobs: prev.jobs.filter((job) => job.id !== jobId),
        toast: { type: "success", message: "Job deleted successfully!" },
        actionLoading: false,
      }));
      fetchJobs();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        toast: { type: "error", message: error.response?.data?.message || "Failed to delete job." },
        actionLoading: false,
      }));
    }
  };

  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => setState((prev) => ({ ...prev, toast: null })), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl space-y-4 sm:space-y-6">
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

  const currentJobs = state.jobs;

  const paginate = (pageNumber) => {
    setState((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Manage Jobs</h1>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setState((prev) => ({ ...prev, showAddModal: true }))}
                className="bg-teal-600 text-white px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg text-xs sm:text-sm md:text-base shadow-sm hover:bg-teal-700"
              >
                Add Job
              </button>
              <Link
                to="/employer-dashboard"
                className="text-teal-600 text-sm sm:text-base md:text-lg font-semibold hover:text-teal-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <AnimatePresence>
            {state.toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-3 sm:p-4 rounded-lg shadow-lg text-xs sm:text-sm md:text-base max-w-[90%] sm:max-w-xs md:max-w-sm w-full flex items-center gap-2 ${
                  state.toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"
                }`}
                style={{ zIndex: 100000 }}
                onClick={() => setState((prev) => ({ ...prev, toast: null }))}
              >
                {state.toast.type === "success" ? (
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                {state.toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {state.error && (
            <div className="bg-red-50 p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center gap-3">
              <ExclamationCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
              <span className="text-xs sm:text-sm md:text-base text-red-700 text-center">{state.error}</span>
              <Link
                to="/login"
                className="flex items-center gap-2 bg-teal-600 text-white px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg text-xs sm:text-sm md:text-base shadow-sm hover:bg-teal-700"
              >
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                Log In
              </Link>
            </div>
          )}

          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  value={state.search}
                  onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search jobs by title"
                  className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-sm sm:text-base shadow-sm"
                />
                {state.search && (
                  <button
                    onClick={() => setState((prev) => ({ ...prev, search: "" }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
                <select
                  value={state.statusFilter}
                  onChange={(e) => setState((prev) => ({ ...prev, statusFilter: e.target.value }))}
                  className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm w-full sm:w-36 md:w-40 lg:w-48"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={state.sortBy}
                  onChange={(e) => setState((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm w-full sm:w-36 md:w-40 lg:w-48"
                >
                  <option value="title">Sort by Title</option>
                  <option value="date">Sort by Last Updated</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={() => setState((prev) => ({ ...prev, showEditModal: job }))}
                    onDelete={() => handleDeleteJob(job.id)}
                    disabled={state.actionLoading}
                  />
                ))
              ) : (
                <EmptyState message="No jobs match your criteria." />
              )}
            </div>

            {state.totalPages > 1 && (
              <Pagination currentPage={state.currentPage} totalPages={state.totalPages} onPageChange={paginate} />
            )}
          </div>

          <AnimatePresence>
            {state.showAddModal && (
              <JobFormModal
                onSubmit={handleAddJob}
                onClose={() => setState((prev) => ({ ...prev, showAddModal: false }))}
                disabled={state.actionLoading}
              />
            )}
            {state.showEditModal && (
              <JobFormModal
                job={state.showEditModal}
                onSubmit={(data) => handleEditJob(state.showEditModal.id, data)}
                onClose={() => setState((prev) => ({ ...prev, showEditModal: null }))}
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
const JobCard = ({ job, onEdit, onDelete, disabled }) => (
  <div className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
      <div>
        <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{job.title || "Untitled Job"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Location: {job.location || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Skills: {job.skills?.join(", ") || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Status: {job.status || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">
          Last Updated: {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : "N/A"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 sm:gap-2 bg-teal-600 text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm md:text-base disabled:opacity-50 shadow-sm hover:bg-teal-700"
          disabled={disabled}
        >
          <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 sm:gap-2 bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm md:text-base disabled:opacity-50 shadow-sm hover:bg-red-700"
          disabled={disabled}
        >
          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          Delete
        </button>
      </div>
    </div>
  </div>
);

// JobFormModal Component
const JobFormModal = ({ job, onSubmit, onClose, disabled }) => {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    location: job?.location || "",
    skills: job?.skills?.join(", ") || "",
    description: job?.description || "",
    status: job?.status || "open",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(",").map((skill) => skill.trim());
    onSubmit({ ...formData, skills: skillsArray });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 truncate flex items-center gap-2">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
            {job ? "Edit Job" : "Add Job"}
          </h3>
          <button onClick={onClose} disabled={disabled} className="text-gray-600">
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm text-gray-600">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-600">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-600">Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-600">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-gray-600">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button
              type="submit"
              className="flex-1 bg-teal-600 text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm md:text-base disabled:opacity-50 shadow-sm hover:bg-teal-700"
              disabled={disabled}
            >
              {job ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm md:text-base disabled:opacity-50 shadow-sm hover:bg-gray-700"
              disabled={disabled}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// EmptyState Component
const EmptyState = ({ message }) => (
  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 bg-white rounded-lg shadow-sm">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900">{message}</h3>
    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Add a job or adjust your filters.</p>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-4 sm:mt-6 lg:mt-8">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 bg-gray-100 text-teal-600 rounded-lg text-xs sm:text-sm md:text-base font-medium disabled:opacity-50 shadow-sm w-full sm:w-auto hover:bg-teal-100"
    >
      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      Previous
    </button>
    <span className="text-xs sm:text-sm md:text-base text-gray-600">Page {currentPage} of {totalPages}</span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 bg-gray-100 text-teal-600 rounded-lg text-xs sm:text-sm md:text-base font-medium disabled:opacity-50 shadow-sm w-full sm:w-auto hover:bg-teal-100"
    >
      Next
      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
    </button>
  </div>
);

export default ManageJobsPage;