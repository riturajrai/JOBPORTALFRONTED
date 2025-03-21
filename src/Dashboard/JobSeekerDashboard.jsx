import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  XMarkIcon,
  BookmarkIcon,
  BriefcaseIcon,
  ExclamationCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline"; // Added FileText for resume link
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { MapPin } from "lucide-react";

const API_BASE_URL = "https://jobportalapi.up.railway.app/api";
import { FileText } from "lucide-react";

const INITIAL_PROFILE = {
  completeness: 70,
  skills: ["JavaScript", "React"],
  resume_link: null,
  name: "Your Name",
  location: "Add your location",
};

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
        <div className="p-6 text-center">
          <h2 className="text-red-600 text-xl font-semibold">Something went wrong.</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const JobSeekerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("matchScore");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const jobsPerPage = 5;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  const fetchData = useCallback(async () => {
    if (!token || !userId) {
      setError("Please log in to access your dashboard.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const [
        jobsResponse,
        savedJobsResponse,
        appliedJobsResponse,
        profileResponse,
        notificationsResponse,
        unreadCountResponse,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/jobs`, { headers }),
        axios.get(`${API_BASE_URL}/users/${userId}/saved-jobs`, { headers }),
        axios.get(`${API_BASE_URL}/users/${userId}/applied-jobs`, { headers }),
        axios.get(`${API_BASE_URL}/user/${userId}`, { headers }),
        axios.get(`${API_BASE_URL}/notifications/${userId}`, { headers }),
        axios.get(`${API_BASE_URL}/notifications/${userId}/unread`, { headers }),
      ]);

      const allJobs = jobsResponse.data.map(job => ({
        ...job,
        title: job.title || "Untitled Job",
        company: job.company || "Unknown Company",
        location: job.location || "Remote",
        matchScore: job.match_score || Math.floor(Math.random() * 41) + 60,
      }));

      setJobs(allJobs);
      setSavedJobs(savedJobsResponse.data || []);
      setAppliedJobs(appliedJobsResponse.data || []);
      setProfile({
        ...profileResponse.data,
        completeness: profileResponse.data.completeness || INITIAL_PROFILE.completeness,
        skills: Array.isArray(profileResponse.data.skills) ? profileResponse.data.skills : INITIAL_PROFILE.skills,
        resume_link: profileResponse.data.resume_link || null,
        name: profileResponse.data.name || INITIAL_PROFILE.name,
        location: profileResponse.data.location || INITIAL_PROFILE.location,
      });
      setNotifications(notificationsResponse.data.notifications || []);
      setUnreadCount(unreadCountResponse.data.unreadCount || 0);
    } catch (error) {
      console.error("Fetch Data Error:", error.response?.data || error.message);
      setError(
        error.response?.status === 404
          ? "Some data is unavailable."
          : error.response?.status === 403
          ? "Session expired. Please log in again."
          : error.response?.data?.message || "Couldn’t load your dashboard."
      );
      if (error.response?.status === 403) {
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [token, userId, navigate]);

  useEffect(() => {
    fetchData();
    const handleJobAction = () => fetchData();
    window.addEventListener("jobAction", handleJobAction);
    return () => window.removeEventListener("jobAction", handleJobAction);
  }, [fetchData]);

  // Restored Action Handlers
  const handleSaveJob = useCallback(
    async (job) => {
      setActionLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/jobs/${job.id}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
        setToast({ type: "success", message: response.data.message || "Job saved successfully!" });
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to save job." });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const handleRemoveSavedJob = useCallback(
    async (jobId) => {
      if (!window.confirm("Remove this job from your saved list?")) return;
      setActionLoading(true);
      try {
        await axios.post(
          `${API_BASE_URL}/jobs/${jobId}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
        setToast({ type: "success", message: "Job removed from saved list!" });
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to remove job." });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const handleApplyJob = useCallback(
    async (job) => {
      setActionLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/jobs/${job.id}/apply`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
        setToast({ type: "success", message: response.data.message || "Application submitted successfully!" });
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to apply to job." });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const handleWithdrawApplication = useCallback(
    async (jobId) => {
      if (!window.confirm("Are you sure you want to withdraw this application?")) return;
      setActionLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/applications/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
        setToast({ type: "success", message: "Application withdrawn successfully!" });
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to withdraw application." });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const markNotificationAsRead = useCallback(
    async (id) => {
      setActionLoading(true);
      try {
        await axios.put(
          `${API_BASE_URL}/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
        setToast({ type: "success", message: "Notification marked as read." });
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to mark notification as read." });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const deleteNotification = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this notification?")) return;
      setActionLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
        setToast({ type: "success", message: "Notification deleted successfully!" });
      } catch (error) {
        setToast({ type: "error", message: error.response?.data?.message || "Failed to delete notification." });
      } finally {
        setActionLoading(false);
      }
    },
    [token, fetchData]
  );

  const clearAllNotifications = useCallback(async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    setActionLoading(true);
    try {
      await Promise.all(
        notifications.map(notification =>
          axios.delete(`${API_BASE_URL}/notifications/${notification.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      fetchData();
      setToast({ type: "success", message: "All notifications cleared!" });
    } catch (error) {
      setToast({ type: "error", message: error.response?.data?.message || "Failed to clear notifications." });
    } finally {
      setActionLoading(false);
    }
  }, [token, fetchData, notifications]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        job =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [jobs, searchQuery]
  );

  const sortedJobs = useMemo(
    () =>
      [...filteredJobs].sort((a, b) => {
        if (sortBy === "matchScore") return (b.matchScore || 0) - (a.matchScore || 0);
        if (sortBy === "date") return new Date(b.date_posted || b.created_at || 0) - new Date(a.date_posted || a.created_at || 0);
        return 0;
      }),
    [filteredJobs, sortBy]
  );

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    return sortedJobs.slice(start, end);
  }, [sortedJobs, currentPage]);

  const jobStats = useMemo(
    () => ({
      applied: appliedJobs.length,
      saved: savedJobs.length,
    }),
    [appliedJobs, savedJobs]
  );

  const recentSearches = useMemo(() => ["Software Engineer", "Remote Jobs", "React Developer"], []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Dashboard", icon: <BriefcaseIcon className="h-6 w-6" /> },
    { id: "applications", label: "Applications", icon: <CheckCircleIcon className="h-6 w-6" /> },
    { id: "savedJobs", label: "Saved Jobs", icon: <BookmarkIcon className="h-6 w-6" /> },
    { id: "recommended", label: "Recommended", icon: <StarIcon className="h-6 w-6" /> },
    { id: "recentSearches", label: "Recent Searches", icon: <ClockIcon className="h-6 w-6" /> },
    { id: "notifications", label: `Notifications (${unreadCount})`, icon: <BellIcon className="h-6 w-6" /> },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Seeker Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your job search effortlessly</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={fetchData}
                  className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 w-full sm:w-auto"
                  disabled={actionLoading}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Refresh
                </button>
                <Link
                  to="/profile"
                  className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  Find Jobs
                </Link>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
                  toast.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                } text-sm font-medium border z-50`}
                onClick={() => setToast(null)}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3 shadow-sm">
              <ExclamationCircleIcon className="w-6 h-6" />
              <span className="text-sm">{error}</span>
              <button
                onClick={fetchData}
                className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Tabs */}
            <nav className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50 overflow-x-auto scrollbar-hidden snap-x snap-mandatory">
              {tabs.map(tab => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors snap-start ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </nav>

            {/* Tab Content */}
            <div className="p-6 space-y-6">
              {activeTab === "overview" && (
                <div>
                  {/* Profile Overview */}
                  <motion.div
                    className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-lg border border-indigo-200 shadow-md mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-8 w-8 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" /> {profile.location}
                        </p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700">Skills</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.skills.length > 0 ? (
                              profile.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No skills added yet.</p>
                            )}
                            {profile.skills.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                +{profile.skills.length - 5}
                              </span>
                            )}
                          </div>
                          {profile.skills.length < 3 && (
                            <Link
                              to="/profile"
                              className="text-indigo-600 text-sm font-medium hover:underline mt-2 inline-block"
                            >
                              Add more skills
                            </Link>
                          )}
                        </div>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700">Resume</h4>
                          {profile.resume_link ? (
                            <a
                              href={`${API_BASE_URL}${profile.resume_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" /> Resume Uploaded
                            </a>
                          ) : (
                            <Link
                              to="/profile"
                              className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1"
                            >
                              <ExclamationCircleIcon className="h-4 w-4" /> Upload Resume
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="w-full sm:w-1/3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Profile Strength</h4>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profile.completeness}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {profile.completeness}% Complete
                          {profile.completeness < 100 && (
                            <Link to="/profile" className="text-indigo-600 font-medium hover:underline ml-1">
                              Improve
                            </Link>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Job Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <StatCard
                      icon={<BriefcaseIcon className="h-6 w-6 text-indigo-600" />}
                      label="Jobs Applied"
                      value={jobStats.applied}
                      bg="bg-indigo-50"
                    />
                    <StatCard
                      icon={<BookmarkIcon className="h-6 w-6 text-blue-600" />}
                      label="Saved Jobs"
                      value={jobStats.saved}
                      bg="bg-blue-50"
                    />
                  </div>

                  {/* Search and Job Listings */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search jobs by title, company, or location"
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                        disabled={actionLoading}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm w-full sm:w-40"
                      disabled={actionLoading}
                    >
                      <option value="matchScore">Best Match</option>
                      <option value="date">Most Recent</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{filteredJobs.length} jobs found</p>
                  <div className="space-y-4">
                    {paginatedJobs.length > 0 ? (
                      paginatedJobs.map(job => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onSave={handleSaveJob}
                          onApply={handleApplyJob}
                          disabled={actionLoading}
                        />
                      ))
                    ) : (
                      <EmptyState message="No jobs match your search." link="/jobs" linkText="Browse All Jobs" />
                    )}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredJobs.length / jobsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}

              {activeTab === "applications" && (
                <div>
                  {appliedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {appliedJobs.map(job => (
                        <ApplicationCard
                          key={job.id}
                          job={job}
                          onWithdraw={handleWithdrawApplication}
                          disabled={actionLoading}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="You haven’t applied to any jobs yet." link="/jobs" linkText="Find Jobs" />
                  )}
                </div>
              )}

              {activeTab === "savedJobs" && (
                <div>
                  {savedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {savedJobs.map(job => (
                        <SavedJobCard
                          key={job.id}
                          job={job}
                          onRemove={handleRemoveSavedJob}
                          onApply={handleApplyJob}
                          disabled={actionLoading}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="You have no saved jobs." link="/jobs" linkText="Browse Jobs" />
                  )}
                </div>
              )}

              {activeTab === "recommended" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Jobs</h3>
                  {sortedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {sortedJobs.slice(0, 5).map(job => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onSave={handleSaveJob}
                          onApply={handleApplyJob}
                          disabled={actionLoading}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No recommendations available." link="/jobs" linkText="Browse Jobs" />
                  )}
                </div>
              )}

              {activeTab === "recentSearches" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h3>
                  {recentSearches.length > 0 ? (
                    <div className="space-y-4">
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSearchQuery(search)}
                        >
                          <p className="text-sm text-gray-800">{search}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No recent searches." link="/jobs" linkText="Start Searching" />
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications ({unreadCount} unread)</h3>
                        <button
                          onClick={clearAllNotifications}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 w-full sm:w-auto"
                          disabled={actionLoading || notifications.length === 0}
                        >
                          Clear All
                        </button>
                      </div>
                      {notifications.map(notification => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkRead={markNotificationAsRead}
                          onDelete={deleteNotification}
                          disabled={actionLoading}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="You have no notifications." />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Components (unchanged except for imports and minor fixes)
const NotificationCard = ({ notification, onMarkRead, onDelete, disabled }) => (
  <div
    className={`p-4 rounded-lg border shadow-sm ${
      notification.read
        ? "bg-gray-50 text-gray-700 border-gray-200"
        : "bg-gradient-to-r from-blue-50 to-white text-blue-800 border-blue-200"
    }`}
  >
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="col-span-2">
        <p className={`text-sm ${notification.read ? "font-normal" : "font-medium"}`}>{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.created_at || 0).toLocaleString()}
          {notification.type && ` • ${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
            disabled={disabled}
          >
            Mark as Read
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 disabled:opacity-50"
          disabled={disabled}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const JobCard = ({ job, onSave, onApply, disabled }) => (
  <motion.div
    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    whileHover={{ y: -2 }}
  >
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h4>
        <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
        <p className="text-xs text-gray-500 mt-1">Posted {new Date(job.date_posted || job.created_at || 0).toLocaleDateString()}</p>
        {job.salary_min && job.salary_max && (
          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded-md">
            ${job.salary_min} - ${job.salary_max} {job.salary_type}
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md border border-green-200">
          {job.matchScore}% Match
        </span>
        <button
          onClick={() => onSave(job)}
          className="text-gray-600 flex items-center gap-2 text-sm font-medium hover:text-gray-800 disabled:opacity-50"
          disabled={disabled}
          aria-label="Save job"
        >
          <BookmarkIcon className="h-5 w-5" /> Save
        </button>
        <button
          onClick={() => onApply(job)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          disabled={disabled}
          aria-label="Apply to job"
        >
          Apply
        </button>
        <Link to={`/job/${job.id}`} className="text-indigo-600 text-sm font-medium hover:underline" aria-label="View job details">
          View Details
        </Link>
      </div>
    </div>
  </motion.div>
);

const ApplicationCard = ({ job, onWithdraw, disabled }) => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h4>
        <p className="text-sm text-gray-600">
          {job.company} • Applied {new Date(job.applied_at || 0).toLocaleDateString()}
        </p>
        <span
          className={`inline-block mt-2 px-2 py-1 rounded-md text-xs font-medium border ${
            job.status === "Hired"
              ? "bg-green-100 text-green-800 border-green-200"
              : job.status === "Shortlisted"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : job.status === "Rejected"
              ? "bg-red-100 text-red-800 border-red-200"
              : "bg-yellow-100 text-yellow-800 border-yellow-200"
          }`}
        >
          {job.status || "Pending"}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to={`/job/${job.id}`} className="text-indigo-600 text-sm font-medium hover:underline" aria-label="View job details">
          View Details
        </Link>
        {(job.status === "Pending" || job.status === "Applied") && (
          <button
            onClick={() => onWithdraw(job.id)}
            className="text-red-600 flex items-center gap-2 text-sm font-medium hover:text-red-800 disabled:opacity-50"
            disabled={disabled}
            aria-label="Withdraw application"
          >
            <TrashIcon className="h-5 w-5" /> Withdraw
          </button>
        )}
      </div>
    </div>
  </div>
);

const SavedJobCard = ({ job, onRemove, onApply, disabled }) => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h4>
        <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
        {job.salary_min && job.salary_max && (
          <p className="text-xs text-gray-500 mt-1">Salary: ${job.salary_min} - ${job.salary_max} {job.salary_type}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to={`/job/${job.id}`} className="text-indigo-600 text-sm font-medium hover:underline" aria-label="View job details">
          View Details
        </Link>
        <button
          onClick={() => onApply(job)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          disabled={disabled}
          aria-label="Apply to job"
        >
          Apply
        </button>
        <button
          onClick={() => onRemove(job.id)}
          className="text-red-600 flex items-center gap-2 text-sm font-medium hover:text-red-800 disabled:opacity-50"
          disabled={disabled}
          aria-label="Remove saved job"
        >
          <TrashIcon className="h-5 w-5" /> Remove
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, bg }) => (
  <div className={`${bg} p-4 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm`}>
    {icon}
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ message, link, linkText }) => (
  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
    <p className="text-sm text-gray-600 mb-3">{message}</p>
    {link && (
      <Link
        to={link}
        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        {linkText}
      </Link>
    )}
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-between items-center mt-6">
    <button
      onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
      aria-label="Previous page"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      Previous
    </button>
    <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
    <button
      onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
      aria-label="Next page"
    >
      Next
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

export default JobSeekerDashboard;