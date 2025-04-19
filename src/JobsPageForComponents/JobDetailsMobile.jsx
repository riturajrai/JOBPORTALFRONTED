import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLoader } from "../pages/LoaderContext";
import Loader from "../pages/Loader";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { motion, AnimatePresence } from "framer-motion";
import useIsMobile from "../Hooks/useIsMobile";
import {
  BookmarkIcon,
  ShareIcon,
  MapPinIcon,
  FlagIcon,
  ClockIcon,
  EyeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  HeartIcon,
  LinkIcon,
  LanguageIcon,
  ArrowLeftIcon,
  CheckBadgeIcon as CertificateIcon,
  UsersIcon,
  ExclamationCircleIcon,
  ClockIcon as TimeIcon,
  GlobeAltIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

// Custom hook to detect screen size
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    setMatches(media.matches);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

const JobDetailsMobile = ({
  job,
  isSaved,
  shareTooltip,
  isReported,
  hasApplied,
  actionFeedback,
  showFullDescription,
  handleSave,
  handleShare,
  handleShowReportModal,
  handleApply: originalHandleApply,
  toggleDescription,
}) => {
  const navigate = useNavigate();
  const { setIsLoading } = useLoader();
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasNavigated, setHasNavigated] = useState(false); // Prevent infinite navigation

  const API_BASE_URL = "https://jobporatl.onrender.com";
  const isDesktop = useMediaQuery("(min-width: 1024px)"); // Aligned with 1024px
  const isMobile = useIsMobile();
  const token = localStorage.getItem("token");

  // Handle screen size change
  useEffect(() => {
    if (!isMobile && !hasNavigated && job?.id) {
      setHasNavigated(true);
      console.log("Navigating to /jobs due to screen size ≥1024px");
      navigate("/jobs", { replace: true });
    }
  }, [isMobile, navigate, job?.id, hasNavigated]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!job?.id || !token) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/jobQuestions/${job.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(response.data.questions || []);
      } catch (err) {
        console.error("Error fetching job questions:", err);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [job?.id, token, setIsLoading]);

  const handleApply = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (hasApplied) return;
    if (questions.length > 0) {
      setShowQuestions(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setError("");
    } else {
      handleSubmitApplication();
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNextQuestion = () => {
    const currentAnswer = answers[questions[currentQuestionIndex].id]?.trim();
    if (!currentAnswer) {
      setError("Please answer this question before proceeding.");
      return;
    }
    setError("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmitApplication();
    }
  };

  const handlePrevQuestion = () => {
    setError("");
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitApplication = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (questions.length > 0) {
      const unanswered = questions.filter((q) => !answers[q.id]?.trim());
      if (unanswered.length > 0) {
        setError("Please answer all questions before submitting.");
        return;
      }
    }

    setIsLoading(true);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume_link", "");
      if (questions.length > 0) {
        const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
          question_id: questionId,
          answer,
        }));
        formData.append("answers", JSON.stringify(answersArray));
      }

      await axios.post(`${API_BASE_URL}/api/jobs/${job.id}/apply`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      originalHandleApply();
      setShowQuestions(false);
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const renderDescription = (text, maxLength = 150) => {
    try {
      const sanitized = DOMPurify.sanitize(
        showFullDescription ? text : text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
      );
      return parse(sanitized);
    } catch {
      return <p>{showFullDescription ? text : text.substring(0, maxLength) + "..."}</p>;
    }
  };

  if (!job) return <div className="text-center py-10 text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
              <span className="text-lg font-medium">Back</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                title={isSaved ? "Unsave Job" : "Save Job"}
              >
                <BookmarkIcon className="w-6 h-6" />
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                  title="Share Job"
                >
                  <ShareIcon className="w-6 h-6" />
                </button>
                {shareTooltip && (
                  <div className="absolute top-12 right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg">
                    Link copied!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 px-4 max-w-6xl mx-auto">
        <div className="lg:flex lg:gap-6">
          {/* Left Column (Job Details) */}
          <div className="lg:flex-1">
            {/* Job Overview */}
            <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  {job.title && (
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  )}
                  {job.company && <p className="text-lg text-gray-600 mb-4">{job.company}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                {job.work_location && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-teal-600" />
                    <span>{job.work_location}</span>
                  </div>
                )}
                {job.job_type && (
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-teal-600" />
                    <span>{job.job_type}</span>
                  </div>
                )}
                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-teal-600" />
                    <span>
                      {job.salary_min && job.salary_max
                        ? `₹${job.salary_min} - ₹${job.salary_max}`
                        : "Salary not disclosed"}
                    </span>
                  </div>
                )}
                {job.date_posted && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-teal-600" />
                    <span>{new Date(job.date_posted).toLocaleDateString()}</span>
                  </div>
                )}
                {job.application_deadline && (
                  <div className="flex items-center gap-2">
                    <TimeIcon className="w-5 h-5 text-teal-600" />
                    <span>Apply by: {new Date(job.application_deadline).toLocaleDateString()}</span>
                  </div>
                )}
                {job.job_priority && (
                  <div className="flex items-center gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-teal-600" />
                    <span>Priority: {job.job_priority}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Job Description */}
            {job.description && (
              <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
                <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                  {renderDescription(job.description, 150)}
                </div>
                {job.description.length > 150 && (
                  <button
                    onClick={toggleDescription}
                    className="mt-3 flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700 transition-colors"
                  >
                    {showFullDescription ? "Show Less" : "Show More"}
                  </button>
                )}
              </section>
            )}

            {/* Job Details */}
            {(job.experience || job.skills || job.work_location || job.benefits || job.requirements || job.preferred_languages || job.certifications) && (
              <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-gray-700">
                  {job.experience && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Experience</p>
                        <p>{job.experience}</p>
                      </div>
                    </div>
                  )}
                  {job.skills && (
                    <div className="flex items-start gap-3">
                      <TagIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Skills</p>
                        <p>{job.skills.join(", ")}</p>
                      </div>
                    </div>
                  )}
                  {job.work_location && (
                    <div className="flex items-start gap-3">
                      <BriefcaseIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Work Location</p>
                        <p>{job.work_location}</p>
                      </div>
                    </div>
                  )}
                  {job.benefits && (
                    <div className="flex items-start gap-3">
                      <HeartIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Benefits</p>
                        <p>{job.benefits}</p>
                      </div>
                    </div>
                  )}
                  {job.requirements && (
                    <div className="flex items-start gap-3">
                      <EyeIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Requirements</p>
                        <p>{job.requirements}</p>
                      </div>
                    </div>
                  )}
                  {job.preferred_languages && (
                    <div className="flex items-start gap-3">
                      <LanguageIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Preferred Languages</p>
                        <p>{job.preferred_languages}</p>
                      </div>
                    </div>
                  )}
                  {job.certifications && (
                    <div className="flex items-start gap-3">
                      <CertificateIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Certifications</p>
                        <p>{job.certifications}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
          {/* Right Column (Company Details, Report, Apply Button) */}
          <div className="lg:w-1/3">
            {/* Company Details */}
            {(job.company_size || job.category || job.apply_url) && (
              <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
                <div className="space-y-4 text-gray-700">
                  {job.company_size && (
                    <div className="flex items-start gap-3">
                      <BriefcaseIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Company Size</p>
                        <p>{job.company_size}</p>
                      </div>
                    </div>
                  )}
                  {job.category && (
                    <div className="flex items-start gap-3">
                      <TagIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Category</p>
                        <p>{job.category}</p>
                      </div>
                    </div>
                  )}
                  {job.apply_url && (
                    <div className="flex items-start gap-3">
                      <LinkIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Apply URL</p>
                        <a
                          href={job.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline break-words"
                        >
                          {job.apply_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Report Button */}
            {!isReported && (
              <section className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
                <button
                  onClick={handleShowReportModal}
                  className="flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors mx-auto"
                >
                  <FlagIcon className="w-5 h-5" />
                  Report this job
                </button>
              </section>
            )}
            {/* Sticky Apply Button (Desktop) */}
            {!showQuestions && (
              <section className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
                <button
                  onClick={handleApply}
                  disabled={hasApplied || loading}
                  className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition-all duration-300 ${
                    hasApplied || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? "Submitting..." : hasApplied ? "Applied" : "Apply Now"}
                </button>
              </section>
            )}
          </div>
        </div>
        {/* Action Feedback */}
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 left-1/2 transform -translate-x-1/2 max-w-md w-full p-4 rounded-lg shadow-lg text-sm z-50 ${
                actionFeedback.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {actionFeedback.message}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 max-w-md w-full p-4 rounded-lg shadow-lg text-sm z-50 bg-red-100 text-red-800 border border-red-300"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Paginated Questions Modal */}
        {showQuestions && questions.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    {questions[currentQuestionIndex].text}
                  </label>
                  <textarea
                    value={answers[questions[currentQuestionIndex].id] || ""}
                    onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                    placeholder="Your answer..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex justify-between gap-4">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={handlePrevQuestion}
                      className="py-2 px-4 rounded-lg border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors text-sm font-medium"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={handleNextQuestion}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-lg text-white font-medium text-sm transition-colors ${
                      loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
                    }`}
                  >
                    {loading
                      ? "Submitting..."
                      : currentQuestionIndex === questions.length - 1
                      ? "Submit Application"
                      : "Next"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowQuestions(false)}
                className="mt-4 text-sm text-teal-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Apply Button (Mobile Only) */}
      {!showQuestions && !isDesktop && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleApply}
              disabled={hasApplied || loading}
              className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition-all duration-300 ${
                hasApplied || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? "Submitting..." : hasApplied ? "Applied" : "Apply Now"}
            </button>
          </div>
        </footer>
      )}

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default JobDetailsMobile;
