import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CertificateIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import parse from "html-react-parser";

const JobDetailsPC = ({
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
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = " http://localhost:5000";
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/jobQuestions/${job.id}`);
        const fetchedQuestions = response.data.questions || [];
        setQuestions(fetchedQuestions);
        console.log("Fetched questions for job", job.id, ":", fetchedQuestions);
      } catch (err) {
        console.error("Error fetching job questions:", err);
      }
    };
    fetchQuestions();
  }, [job.id]);

  const handleApply = () => {
    if (hasApplied) {
      console.log("Already applied to job", job.id);
      return;
    }
    if (questions.length > 0) {
      console.log("Showing questions with pagination for job", job.id);
      setShowQuestions(true);
    } else {
      console.log("No questions, applying directly for job", job.id);
      handleSubmitApplication();
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNextQuestion = () => {
    const currentAnswer = answers[questions[currentQuestionIndex].id]?.trim();
    if (!currentAnswer) {
      setError("Please answer the current question before proceeding.");
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setError("");
    } else {
      handleSubmitApplication();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setError("");
    }
  };

  const handleSubmitApplication = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume_link", "");
      if (questions.length > 0) {
        const unanswered = questions.filter((q) => !answers[q.id]?.trim());
        if (unanswered.length > 0) {
          setError("Please answer all questions before submitting.");
          setLoading(false);
          return;
        }
        const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
          question_id: questionId,
          answer,
        }));
        formData.append("answers", JSON.stringify(answersArray));
        console.log("FormData answers:", formData.get("answers"));
      }

      const response = await axios.post(`${API_BASE_URL}/api/jobs/${job.id}/apply`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Application response:", response.data);
      originalHandleApply();
      setShowQuestions(false);
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit application.");
      console.error("Application error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hidden md:block pt-2 md:pt-3 lg:pt-4 space-y-4 md:space-y-6 lg:space-y-8">
      {/* Job Header */}
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-3 lg:gap-4">
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-xs md:text-sm lg:text-base text-gray-600">{job.company}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
            <button
              onClick={handleSave}
              className={`p-1.5 md:p-2 lg:p-2.5 rounded-full transition-colors ${
                isSaved ? "bg-[#008080] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BookmarkIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </button>
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-1.5 md:p-2 lg:p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <ShareIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </button>
              {shareTooltip && (
                <div className="absolute top-10 right-0 bg-gray-800 text-white text-xs md:text-sm rounded py-1 px-2">
                  Link copied!
                </div>
              )}
            </div>
            {!isReported && (
              <button
                onClick={handleShowReportModal}
                className="p-1.5 md:p-2 lg:p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <FlagIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm lg:text-base text-gray-600">
          <div className="flex items-center gap-1 md:gap-1.5">
            <MapPinIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            <span>{job.location || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <BriefcaseIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            <span>{job.job_type}</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <CurrencyDollarIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            <span>
              ₹{job.salary_min} - ₹{job.salary_max}
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            <span>Posted: {new Date(job.date_posted).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Action Feedback */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-2 md:p-3 lg:p-4 rounded-md text-xs md:text-sm lg:text-base ${
              actionFeedback.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {actionFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Button */}
      {!showQuestions && (
        <div className="flex gap-2 md:gap-3 lg:gap-4">
          <button
            onClick={handleApply}
            disabled={hasApplied || loading}
            className={`flex-1 py-1.5 md:py-2 lg:py-3 px-3 md:px-4 lg:px-6 rounded-md text-white font-medium transition-colors text-xs md:text-sm lg:text-base ${
              hasApplied || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#008080] hover:bg-[#006666]"
            }`}
          >
            {loading ? "Submitting..." : hasApplied ? "Applied" : "Apply Now"}
          </button>
        </div>
      )}

      {/* Job Description */}
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">Job Description</h3>
        <div className="text-xs md:text-sm lg:text-base text-gray-700 break-words whitespace-pre-wrap">
          {parse(
            showFullDescription
              ? job.description
              : job.description.length > 300
              ? `${job.description.substring(0, 300)}...`
              : job.description
          )}
        </div>
        {job.description.length > 300 && (
          <button
            onClick={toggleDescription}
            className="text-[#008080] text-xs md:text-sm lg:text-base font-medium hover:underline flex items-center"
          >
            {showFullDescription ? "Show Less" : "Show More"}
            <ChevronDownIcon
              className={`w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 inline-block ml-1 transition-transform ${
                showFullDescription ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">Job Details</h3>
        <div className="space-y-2 md:space-y-3 text-xs md:text-sm lg:text-base text-gray-700">
          <div className="flex items-start gap-2 md:gap-3">
            <ClockIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Experience</p>
              <p>{job.experience || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <TagIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Skills</p>
              <p>{job.skills.join(", ") || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <BriefcaseIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Work Location</p>
              <p>{job.work_location || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <HeartIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Benefits</p>
              <p>{job.benefits || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <EyeIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Requirements</p>
              <p>{job.requirements || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <LanguageIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Preferred Languages</p>
              <p>{job.preferred_languages || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <CertificateIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Certifications</p>
              <p>{job.certifications || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">Company Details</h3>
        <div className="space-y-2 md:space-y-3 text-xs md:text-sm lg:text-base text-gray-700">
          <div className="flex items-start gap-2 md:gap-3">
            <BriefcaseIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Company Size</p>
              <p>{job.company_size || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <TagIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
            <div>
              <p className="font-medium">Category</p>
              <p>{job.category || "Not specified"}</p>
            </div>
          </div>
          {job.apply_url && (
            <div className="flex items-start gap-2 md:gap-3">
              <LinkIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-500" />
              <div>
                <p className="font-medium">Apply URL</p>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#008080] hover:underline"
                >
                  {job.apply_url}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions Section with Pagination */}
      {showQuestions && questions.length > 0 && (
        <div className="space-y-2 md:space-y-3 lg:space-y-4">
          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">
            Answer the Following Questions ({currentQuestionIndex + 1}/{questions.length})
          </h3>
          <div className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <label className="block text-xs md:text-sm lg:text-base font-medium text-gray-700">
                {questions[currentQuestionIndex].text}
              </label>
              <textarea
                value={answers[questions[currentQuestionIndex].id] || ""}
                onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                placeholder="Your answer..."
                rows="3"
                className="w-full px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008080] focus:border-[#008080] text-xs md:text-sm lg:text-base"
              />
            </div>
            {error && <p className="text-red-600 text-xs md:text-sm lg:text-base">{error}</p>}
            <div className="flex gap-2 md:gap-3 lg:gap-4">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={handlePreviousQuestion}
                  className="py-1.5 md:py-2 lg:py-3 px-3 md:px-4 lg:px-6 rounded-md text-[#008080] border border-[#008080] hover:bg-[#008080] hover:text-white transition-colors text-xs md:text-sm lg:text-base"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNextQuestion}
                disabled={loading}
                className={`flex-1 py-1.5 md:py-2 lg:py-3 px-3 md:px-4 lg:px-6 rounded-md text-white font-medium transition-colors text-xs md:text-sm lg:text-base ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080] hover:bg-[#006666]"
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
        </div>
      )}
    </div>
  );
};

export default JobDetailsPC;