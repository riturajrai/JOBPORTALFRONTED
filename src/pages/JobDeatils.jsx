import { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookmarkIcon,
  ShareIcon,
  ExclamationCircleIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  FlagIcon,
  XMarkIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import parse from "html-react-parser";

const API_BASE_URL = "https://jobportalapi.up.railway.app/api";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  const reportOptions = ["Inappropriate Content", "Spam or Scam", "Job Expired", "False Information", "Other"];

  // Fetch job and profile data
  const fetchJobAndProfile = useCallback(async () => {
    if (!token || !userId || role !== "candidate") {
      setError({ message: "Please sign in as a candidate to view job details.", action: "login" });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [jobResponse, profileResponse, statusResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/jobs/${id}`, { headers }),
        axios.get(`${API_BASE_URL}/user/${userId}`, { headers }),
        axios.get(`${API_BASE_URL}/jobs/${id}/status`, { headers }).catch(() => ({ data: {} })),
      ]);

      const jobData = {
        ...jobResponse.data,
        company: jobResponse.data.company_name || "Unknown Company",
        skills: Array.isArray(jobResponse.data.skills) ? jobResponse.data.skills : [],
        salary_min: jobResponse.data.salary_min || 0,
        salary_max: jobResponse.data.salary_max || 0,
      };

      setJob(jobData);
      setUserProfile(profileResponse.data);
      setHasApplied(statusResponse.data.hasApplied || false);
      setIsSaved(statusResponse.data.isSaved || false);
      setIsReported(statusResponse.data.isReported || false);
    } catch (err) {
      const status = err.response?.status;
      setError({
        message: status === 404 ? "Job not found." : "Failed to load job details. Please try again.",
        status,
      });
    } finally {
      setLoading(false);
    }
  }, [id, token, userId, role]);

  // Handlers
  const handleSave = async () => {
    if (!token || role !== "candidate") return navigate("/login");
    if (isJobExpired()) {
      setActionFeedback({ type: "error", message: "Cannot save an expired job." });
      return;
    }
    try {
      const method = isSaved ? "delete" : "post";
      await axios[method](`${API_BASE_URL}/jobs/${id}/save`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsSaved(!isSaved);
      setActionFeedback({ type: "success", message: isSaved ? "Job unsaved!" : "Job saved!" });
    } catch (err) {
      setActionFeedback({ type: "error", message: "Failed to save job. Please try again." });
    } finally {
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = { title: job?.title || "Job Opportunity", url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 1500);
      }
    } catch (err) {
      setActionFeedback({ type: "error", message: "Failed to share job." });
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  const handleApply = async () => {
    if (!isProfileComplete()) {
      setActionFeedback({ type: "error", message: "Please complete your profile to apply." });
      return;
    }
    if (isJobExpired()) {
      setActionFeedback({ type: "error", message: "This job has expired." });
      return;
    }
    if (hasApplied) {
      setActionFeedback({ type: "info", message: "You have already applied to this job." });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/apply`,
        { user_id: userId, job_id: id, cover_letter: coverLetter, ...userProfile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHasApplied(true);
      setActionFeedback({ type: "success", message: "Application submitted successfully!" });
      setCoverLetter("");
    } catch (err) {
      setActionFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to submit application. Please try again.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) {
      setActionFeedback({ type: "error", message: "Please select a report reason." });
      return;
    }
    setReportLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/jobs/${id}/report`,
        { reason: reportReason, details: reportDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsReported(true);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason("");
        setReportDetails("");
      }, 1500);
    } catch (err) {
      setActionFeedback({ type: "error", message: "Failed to report job. Please try again." });
    } finally {
      setReportLoading(false);
    }
  };

  const isJobExpired = () => job?.application_deadline && new Date(job.application_deadline) < new Date();
  const isProfileComplete = () =>
    userProfile?.name && userProfile?.email && userProfile?.phone && userProfile?.resume_link;
  const getDaysSincePosted = (date) => {
    if (!date) return "Unknown";
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    return days <= 0 ? "Today" : `${days} day${days > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    fetchJobAndProfile();
  }, [fetchJobAndProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Feedback Toast */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg text-white shadow-lg z-50 ${
              actionFeedback.type === "success"
                ? "bg-green-600"
                : actionFeedback.type === "info"
                ? "bg-blue-600"
                : "bg-red-600"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {actionFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 animate-pulse">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-5 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <p className="text-gray-700 text-lg mb-6">{error.message}</p>
            <button
              onClick={() => (error.action === "login" ? navigate("/login") : fetchJobAndProfile())}
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {error.action === "login" ? "Sign In" : "Retry"}
            </button>
          </div>
        ) : job ? (
          <div className="p-8 space-y-8">
            {/* Header Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-16 h-16 flex-shrink-0">
                  {job.logo ? (
                    <img
                      src={job.logo}
                      alt={`${job.company} Logo`}
                      className="w-full h-full rounded-full object-cover border border-gray-200 shadow-sm"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/64?text=Job")}
                    />
                  ) : (
                    <BriefcaseIcon className="w-16 h-16 text-blue-500 p-2 bg-blue-50 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                  <p className="text-gray-600 text-lg mt-1">{job.company}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    {job.location || "Remote"} {job.work_location && `• ${job.work_location}`}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isJobExpired()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md ${
                      isSaved
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-600"
                    } ${isJobExpired() ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <BookmarkIcon className="w-5 h-5" />
                    {isSaved ? "Saved" : "Save"}
                  </button>
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all duration-300 shadow-md"
                    >
                      <ShareIcon className="w-5 h-5" />
                      Share
                    </button>
                    {shareTooltip && (
                      <span className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-lg">
                        Copied!
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowReportModal(true)}
                    disabled={isReported || isJobExpired()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all duration-300 shadow-md ${
                      isReported || isJobExpired() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FlagIcon className="w-5 h-5" />
                    {isReported ? "Reported" : "Report"}
                  </button>
                </div>
              </div>
            </div>

            {/* Job Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                <span className="font-medium">{job.job_type || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                <span className="font-medium">
                  ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} {job.salary_type || ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-gray-600" />
                <span>Posted {getDaysSincePosted(job.date_posted)}</span>
              </div>
              <div className="flex items-center gap-3">
                <EyeIcon className="w-6 h-6 text-gray-600" />
                <span>{job.views || 0} views</span>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-10">
              {job.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
                  <div className="text-gray-700 prose prose-sm leading-relaxed bg-gray-50 p-4 rounded-lg shadow-sm">
                    {parse(job.description)}
                  </div>
                </div>
              )}
              {job.requirements && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Requirements</h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-3 bg-gray-50 p-4 rounded-lg shadow-sm">
                    {job.requirements.split("\n").map((req, idx) => req.trim() && <li key={idx}>{req}</li>)}
                  </ul>
                </div>
              )}
              {job.skills.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-3">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium shadow-sm hover:bg-blue-200 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.benefits && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Benefits</h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-3 bg-gray-50 p-4 rounded-lg shadow-sm">
                    {job.benefits.split("\n").map((benefit, idx) => benefit.trim() && <li key={idx}>{benefit}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Application Section (Desktop) */}
            {!hasApplied && !isJobExpired() && (
              <div className="mt-10 border-t border-gray-200 pt-6 hidden sm:block">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Apply Now</h2>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Add a cover letter (optional)"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm resize-none transition-all duration-300"
                  rows="6"
                  disabled={loading || !isProfileComplete()}
                />
                {!isProfileComplete() && (
                  <p className="text-red-600 text-sm mt-3">
                    Please complete your{" "}
                    <button onClick={() => navigate("/profile")} className="underline text-blue-600 hover:text-blue-800">
                      profile
                    </button>{" "}
                    to apply.
                  </p>
                )}
                <button
                  onClick={handleApply}
                  disabled={loading || !isProfileComplete()}
                  className={`w-full mt-4 py-3 rounded-full text-white font-semibold transition-all duration-300 shadow-md ${
                    loading || !isProfileComplete()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  }`}
                >
                  {loading ? "Submitting..." : "Apply Now"}
                </button>
              </div>
            )}
            {hasApplied && (
              <div className="mt-10 bg-green-50 p-6 rounded-lg text-center shadow-md">
                <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-green-700 font-semibold text-xl">Application Submitted Successfully!</p>
              </div>
            )}
            {isJobExpired() && (
              <div className="mt-10 bg-red-50 p-6 rounded-lg text-center shadow-md">
                <ExclamationCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-700 font-semibold text-xl">This Job Has Expired</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Fixed Apply Button (Mobile) */}
      {!hasApplied && !isJobExpired() && (
        <div className="sm:hidden fixed bottom-6 left-0 right-0 px-6 z-50">
          <button
            onClick={handleApply}
            disabled={loading || !isProfileComplete()}
            className={`w-full py-4 rounded-full text-white font-semibold transition-all duration-300 shadow-lg ${
              loading || !isProfileComplete()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
            }`}
          >
            {loading ? "Submitting..." : "Apply Now"}
          </button>
          {!isProfileComplete() && (
            <p className="text-red-600 text-sm text-center mt-3">
              Complete your{" "}
              <button onClick={() => navigate("/profile")} className="underline text-blue-600 hover:text-blue-800">
                profile
              </button>{" "}
              to apply.
            </p>
          )}
        </div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Report Job</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              {reportSuccess ? (
                <div className="text-center py-6">
                  <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-green-700 font-semibold text-lg">Report Submitted Successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                      required
                    >
                      <option value="">Select a reason</option>
                      {reportOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Details (optional)</label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Provide more details"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                      rows="4"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className={`w-full py-3 rounded-full text-white font-semibold transition-all duration-300 shadow-md ${
                      reportLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                    }`}
                  >
                    {reportLoading ? "Submitting..." : "Submit Report"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(JobDetails);