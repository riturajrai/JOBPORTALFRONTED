import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import React from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { UserCircle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useLoader } from "../pages/LoaderContext";

const API_BASE_URL = " https://jobporatl.onrender.com";

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

const ResumeSearchPage = () => {
  const [state, setState] = useState({
    resumes: [],
    totalPages: 1,
    loading: true,
    actionLoading: false,
    error: "",
    toast: null,
    search: "",
    experienceFilter: "all",
    locationFilter: "",
    skillsFilter: [],
    availabilityFilter: "all",
    sortBy: "name",
    selectedProfile: null,
    currentPage: 1,
  });

  const { setIsLoading } = useLoader();
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const fetchResumes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      setState((prev) => ({ ...prev, error: "Please log in to access resumes", loading: false }));
      return;
    }

    try {
      setIsLoading(true);
      setState((prev) => ({ ...prev, loading: true }));
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const params = new URLSearchParams({
        search: state.search,
        experience: state.experienceFilter,
        location: state.locationFilter,
        skills: state.skillsFilter.join(','),
        availability: state.availabilityFilter,
        sortBy: state.sortBy,
        page: state.currentPage,
        limit: itemsPerPage,
      });

      console.log("Fetching resumes with params:", params.toString());
      const response = await axios.get(`${API_BASE_URL}/api/resumes?${params.toString()}`, { headers });
      console.log("API Response:", response.data);
      const { resumes, totalPages } = response.data;

      setState((prev) => ({
        ...prev,
        resumes: Array.isArray(resumes) ? resumes : [],
        totalPages: totalPages || 1,
        error: resumes.length === 0 ? "No resumes found yet." : "",
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching resumes:", error.response?.status, error.response?.data);
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.error || "Failed to fetch resumes",
        loading: false,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [
    state.search,
    state.experienceFilter,
    state.locationFilter,
    state.skillsFilter,
    state.availabilityFilter,
    state.sortBy,
    state.currentPage,
    setIsLoading,
  ]);

  const fetchCandidateProfile = useCallback(async (candidateId) => {
    setState((prev) => ({ ...prev, actionLoading: true }));
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/userr/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = { ...response.data, email: response.data.email || "N/A" };
      setState((prev) => ({ ...prev, selectedProfile: profile, actionLoading: false }));
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

  const handleAddSkill = (skill) => {
    if (skill.trim() && !state.skillsFilter.includes(skill.trim())) {
      setState((prev) => ({ ...prev, skillsFilter: [...prev.skillsFilter, skill.trim()] }));
    }
  };

  const handleRemoveSkill = (skill) => {
    setState((prev) => ({
      ...prev,
      skillsFilter: prev.skillsFilter.filter((s) => s !== skill),
    }));
  };

  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => setState((prev) => ({ ...prev, toast: null })), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

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

  const currentResumes = state.resumes;

  const paginate = (pageNumber) => {
    setState((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Resume Search
            </h1>
            <Link
              to="/employer-dashboard"
              className="text-teal-600 text-sm sm:text-base md:text-lg font-semibold hover:text-teal-700"
            >
              Back to Dashboard
            </Link>
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
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  placeholder="Search resumes by name or skills"
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
                  value={state.experienceFilter}
                  onChange={(e) => setState((prev) => ({ ...prev, experienceFilter: e.target.value }))}
                  className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm w-full sm:w-36 md:w-40 lg:w-48"
                >
                  <option value="all">All Experience Levels</option>
                  <option value="entry">Entry</option>
                  <option value="mid-level">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Executive</option>
                </select>
                <input
                  type="text"
                  value={state.locationFilter}
                  onChange={(e) => setState((prev) => ({ ...prev, locationFilter: e.target.value }))}
                  placeholder="Filter by location"
                  className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm w-full sm:w-36 md:w-40 lg:w-48"
                />
                <select
                  value={state.availabilityFilter}
                  onChange={(e) => setState((prev) => ({ ...prev, availabilityFilter: e.target.value }))}
                  className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm w-full sm:w-36 md:w-40 lg:w-48"
                >
                  <option value="all">All Availability</option>
                  <option value="immediate">Immediate</option>
                  <option value="within 1 month">Within 1 Month</option>
                  <option value="flexible">Flexible</option>
                </select>
                <select
                  value={state.sortBy}
                  onChange={(e) => setState((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm w-full sm:w-36 md:w-40 lg:w-48"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Last Updated</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Add skill (e.g., JavaScript)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddSkill(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-xs sm:text-sm md:text-base shadow-sm w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {state.skillsFilter.map((skill) => (
                    <span
                      key={skill}
                      className="bg-teal-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shadow-md"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-red-200 hover:text-red-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {currentResumes.length > 0 ? (
                currentResumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onViewProfile={() => fetchCandidateProfile(resume.user_id)}
                    disabled={state.actionLoading}
                  />
                ))
              ) : (
                <EmptyState message="No resumes match your criteria." />
              )}
            </div>

            {state.totalPages > 1 && (
              <Pagination currentPage={state.currentPage} totalPages={state.totalPages} onPageChange={paginate} />
            )}
          </div>

          <AnimatePresence>
            {state.selectedProfile && (
              <CandidateProfileModal
                candidate={state.selectedProfile}
                onClose={() => setState((prev) => ({ ...prev, selectedProfile: null }))}
                disabled={state.actionLoading}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// ResumeCard Component
const ResumeCard = ({ resume, onViewProfile, disabled }) => (
  <div className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
      <div>
        <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
          {resume.name || "Unnamed Candidate"}
        </p>
        <p className="text-xs sm:text-sm text-gray-500">Experience: {resume.experience || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Location: {resume.location || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Skills: {resume.skills?.join(", ") || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">Availability: {resume.availability || "N/A"}</p>
        <p className="text-xs sm:text-sm text-gray-500">
          Last Updated: {resume.updated_at ? new Date(resume.updated_at).toLocaleDateString() : "N/A"}
        </p>
        {resume.resume_link && (
          <a
            href={`${API_BASE_URL}${resume.resume_link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 text-xs sm:text-sm md:text-base font-medium flex items-center gap-1 hover:underline"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            Download Resume
          </a>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={onViewProfile}
          className="flex items-center gap-1 sm:gap-2 bg-teal-600 text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm md:text-base disabled:opacity-50 shadow-sm hover:bg-teal-700"
          disabled={disabled}
        >
          <UserCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          View Profile
        </button>
      </div>
    </div>
  </div>
);

// CandidateProfileModal Component
const CandidateProfileModal = ({ candidate, onClose, disabled }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
  >
    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-[90%] sm:max-w-sm md:max-w-md lg:max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 truncate flex items-center gap-2">
          <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
          Profile: {candidate.name || "Unnamed Candidate"}
        </h3>
        <button onClick={onClose} disabled={disabled} className="text-gray-600">
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        </button>
      </div>
      {disabled ? (
        <p className="text-center text-gray-600 text-xs sm:text-sm md:text-base">Loading profile...</p>
      ) : (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Name</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{candidate.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Email</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{candidate.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Phone</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{candidate.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Experience</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{candidate.experience || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Location</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{candidate.location || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Skills</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{candidate.skills?.join(", ") || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Availability</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{candidate.availability || "N/A"}</p>
          </div>
          {candidate.resume_link && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Resume</p>
              <a
                href={`${API_BASE_URL}${candidate.resume_link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 text-xs sm:text-sm md:text-base font-medium flex items-center gap-1 hover:underline"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                Download Resume
              </a>
            </div>
          )}
          {candidate.updated_at && (
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Last Updated</p>
            <p className="text-sm sm:text-base md:text-lg text-gray-900">{new Date(candidate.updated_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-4 sm:mt-6 w-full flex items-center justify-center gap-1 sm:gap-2 bg-gray-600 text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-medium disabled:opacity-50 shadow-sm hover:bg-gray-700"
        disabled={disabled}
      >
        <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        Close
      </button>
    </div>
  </motion.div>
);

// EmptyState Component
const EmptyState = ({ message }) => (
  <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 bg-white rounded-lg shadow-sm">
    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900">{message}</h3>
    <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Adjust your filters to find more resumes.</p>
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

export default ResumeSearchPage;