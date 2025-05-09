import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLoader } from "../pages/LoaderContext";
import Loader from "../pages/Loader";
import JobDetailsMobile from "./JobDetailsMobile";
import JobDetailsPC from "./JobDetailsPC";
import { motion } from "framer-motion";
import {
  ExclamationCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import logintoview from "../assets/icons8-view-64.png";

const JobDetails = ({ id }) => { // Accept id prop from DesktopJobs
  const { id: paramId } = useParams(); // For standalone /job/:id routes
  const navigate = useNavigate();
  const { setIsLoading } = useLoader();
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const API_BASE_URL = "https://jobporatl.onrender.com";
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");
  const reportOptions = ["Inappropriate Content", "Spam or Scam", "Job Expired", "False Information", "Other"];

  // Use id from props (DesktopJobs) or params (standalone route)
  const jobId = id || paramId;

  const formatList = (value) => {
    if (!value) return "Not specified";
    if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ");
        return value.split(",").map((item) => item.trim()).filter(Boolean).join(", ");
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean).join(", ");
      }
    }
    return String(value);
  };

  const fetchData = useCallback(async () => {
    if (!jobId) {
      setError({ message: "No job ID provided." });
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      setIsLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [
        jobResponse,
        statusResponse,
        appliedResponse,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/jobs/${jobId}`, { headers, signal: controller.signal }),
        token && userId && role === "candidate"
          ? axios.get(`${API_BASE_URL}/api/jobs/${jobId}/status`, { headers, signal: controller.signal }).catch(() => ({ data: {} }))
          : Promise.resolve({ data: {} }),
        token && userId && role === "candidate"
          ? axios.get(`${API_BASE_URL}/api/jobs/${jobId}/applied`, { headers, signal: controller.signal }).catch(() => ({ data: { hasApplied: false } }))
          : Promise.resolve({ data: { hasApplied: false } }),
      ]);

      clearTimeout(timeoutId);

      setJob({
        ...jobResponse.data,
        company: jobResponse.data.company || "Unknown Company",
        title: jobResponse.data.title || "Untitled Job",
        description: jobResponse.data.description || "No description available",
        skills: formatList(jobResponse.data.skills).split(", ").filter((skill) => skill && skill !== "Not specified"),
        job_type: formatList(jobResponse.data.job_type) || "Not specified",
        work_location: formatList(jobResponse.data.work_location) || "Not specified",
        experience: formatList(jobResponse.data.experience) || "Not specified",
        salary_min: jobResponse.data.salary_min || 0,
        salary_max: jobResponse.data.salary_max || 0,
        benefits: formatList(jobResponse.data.benefits) || "Not specified",
        requirements: formatList(jobResponse.data.requirements) || "Not specified",
        company_size: formatList(jobResponse.data.company_size) || "Not specified",
        category: formatList(jobResponse.data.category) || "Not specified",
        apply_url: jobResponse.data.apply_url || "",
        preferred_languages: formatList(jobResponse.data.preferred_languages) || "Not specified",
        certifications: formatList(jobResponse.data.certifications) || "Not specified",
      });
      setIsSaved(statusResponse.data.isSaved || false);
      setIsReported(statusResponse.data.isReported || false);
      setHasApplied(appliedResponse.data.hasApplied || false);
    } catch (err) {
      setError({
        message: err.name === "AbortError"
          ? "Request timed out. Please try again."
          : !token || err.response?.status === 401
          ? <img src={logintoview} alt="Login to view" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
          : err.response?.status === 404
          ? "Job not found."
          : "An error occurred while fetching job details.",
        status: err.response?.status,
      });
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [jobId, token, userId, role, setIsLoading]);

  useEffect(() => {
    if (jobId) fetchData();
  }, [jobId, fetchData]);

  const handleSave = async () => {
    if (!token || role !== "candidate") {
      navigate("/login");
      return;
    }
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      if (isSaved) {
        await axios.delete(`${API_BASE_URL}/api/jobs/${jobId}/save`, { headers });
        setIsSaved(false);
        setActionFeedback({ type: "success", message: "Job unsaved." });
      } else {
        await axios.post(`${API_BASE_URL}/api/jobs/${jobId}/save`, {}, { headers });
        setIsSaved(true);
        setActionFeedback({ type: "success", message: "Job saved!" });
      }
    } catch (err) {
      setActionFeedback({ type: "error", message: "Failed to save job. Please try again." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleShare = () => {
    const jobUrl = `${window.location.origin}/job/${jobId}`;
    navigator.clipboard.writeText(jobUrl);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  const handleShowReportModal = () => {
    if (!token || role !== "candidate") {
      navigate("/login");
      return;
    }
    setShowReportModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) {
      setActionFeedback({ type: "error", message: "Please select a reason for reporting." });
      return;
    }
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API_BASE_URL}/api/jobs/${jobId}/report`,
        { reason: reportReason, details: reportDetails },
        { headers }
      );
      setIsReported(true);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason("");
        setReportDetails("");
      }, 2000);
    } catch (err) {
      setActionFeedback({ type: "error", message: "Failed to submit report. Please try again." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleApply = () => {
    setHasApplied(true);
    setActionFeedback({ type: "success", message: "Application submitted successfully!" });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  const ReportModal = () => (
    showReportModal && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowReportModal(false)}
      >
        <div
          className="bg-white rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Report Job</h3>
            <button onClick={() => setShowReportModal(false)} className="text-gray-600 hover:text-gray-800">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {reportSuccess ? (
            <div className="text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 text-base mb-4">Report submitted successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Reporting</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#008080] focus:border-[#008080] text-sm"
                >
                  <option value="">Select a reason</option>
                  {reportOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#008080] focus:border-[#008080] text-sm"
                  rows="3"
                  placeholder="Provide more details about your report..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-md text-white bg-[#008080] hover:bg-[#006666] text-sm"
              >
                Submit Report
              </button>
            </form>
          )}
        </div>
      </div>
    )
  );

  if (isFetching) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center border border-gray-100 max-w-7xl mx-auto">
        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-gray-700 mb-6">{error.message}</p>
        {error.status === 401 ? (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#008080] text-white rounded-md hover:bg-[#006666] text-lg"
          >
            Log In to View Job
          </button>
        ) : (
          <button
            onClick={() => navigate("/jobs")}
            className="px-6 py-3 bg-[#008080] text-white rounded-md hover:bg-[#006666] text-lg"
          >
            Back to Jobs
          </button>
        )}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center border border-gray-100 max-w-7xl mx-auto">
        <ExclamationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-700 mb-6">No job data available.</p>
        <button
          onClick={() => navigate("/jobs")}
          className="px-6 py-3 bg-[#008080] text-white rounded-md hover:bg-[#006666] text-lg"
          >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {window.innerWidth < 1024 ? (
          <JobDetailsMobile
            job={job}
            isSaved={isSaved}
            shareTooltip={shareTooltip}
            isReported={isReported}
            hasApplied={hasApplied}
            actionFeedback={actionFeedback}
            showFullDescription={showFullDescription}
            handleSave={handleSave}
            handleShare={handleShare}
            handleShowReportModal={handleShowReportModal}
            handleApply={handleApply}
            toggleDescription={toggleDescription}
          />
        ) : (
          <JobDetailsPC
            job={job}
            isSaved={isSaved}
            shareTooltip={shareTooltip}
            isReported={isReported}
            hasApplied={hasApplied}
            actionFeedback={actionFeedback}
            showFullDescription={showFullDescription}
            handleSave={handleSave}
            handleShare={handleShare}
            handleShowReportModal={handleShowReportModal}
            handleApply={handleApply}
            toggleDescription={toggleDescription}
          />
        )}
      </div>
      <ReportModal />
    </>
  );
};

export default JobDetails;