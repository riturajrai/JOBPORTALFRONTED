import { memo, useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ExclamationCircleIcon, // Fallback for Urgent badge if FireIcon is unavailable
  StarIcon,
  ClockIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BookmarkIcon,
  FireIcon, // For Urgent badge (requires @heroicons/react v2 or custom SVG)
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// Helper function
const formatField = (field) => {
  if (!field) return "Not specified";
  if (Array.isArray(field)) return field.join(", ");
  if (typeof field === "string") {
    if (field.startsWith("[")) {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed.join(", ") : field;
      } catch {
        return field
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .join(", ");
      }
    }
    return field
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }
  return String(field);
};

const JobCard = memo(({ job, isTopSalary, onSave }) => {
  const [isSaved, setIsSaved] = useState(false); // Local state for save toggle
  const workLocation = formatField(job.work_location);
  const jobType = formatField(job.job_type);

  const formatSalary = (min, max, type = "monthly") => {
    if (!min && !max) return "Not disclosed";
    if (min && max) return `${min} - ${max} /${type}`;
    return min ? `${min} /${type}` : `${max} /${type}`;
  };

  const formatDatePosted = (date) => {
    if (!date) return { text: "Not specified", isNew: false };
    const postedDate = new Date(date);
    const now = new Date();
    const diff = Math.abs(now - postedDate);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const isNew = hours <= 48;
    const text = days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
    return { text, isNew };
  };

  const { text: dateText, isNew } = formatDatePosted(job.date_posted);

  const handleSaveToggle = (e) => {
    e.stopPropagation(); // Prevent card click when saving
    setIsSaved(!isSaved);
    onSave(job.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 sm:p-5 rounded-lg bg-white border shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer relative ${
        isTopSalary ? "border-l-4 border-teal-600 bg-teal-50/30" : "border-gray-100"
      }`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${job.title || "Untitled Job"} at ${job.company || "Confidential"}`}
    >
      {/* Save Button */}
      <button
        onClick={handleSaveToggle}
        className="absolute top-4 right-4 text-gray-500 hover:text-teal-600 transition"
        aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
      >
        <BookmarkIcon
          className={`h-5 w-5 ${isSaved ? "fill-teal-600 text-teal-600" : "fill-none"}`}
        />
      </button>

      {/* Header Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {isNew && (
          <Badge
            icon={CalendarIcon} // Icon for new jobs
            color="bg-red-100"
            textColor="text-red-700"
            text="New"
            tooltip="Posted within the last 48 hours"
          />
        )}
        {job.hiring_multiple === 1 && (
          <Badge
            icon={UsersIcon} // Icon for multiple hiring
            color="bg-green-100"
            textColor="text-green-700"
            text="Multiple Hiring"
            tooltip="Hiring for multiple positions"
          />
        )}
        {job.urgent_hiring === 1 && (
          <Badge
            icon={FireIcon || ExclamationCircleIcon} // Use FireIcon if available, else fallback to ExclamationCircleIcon
            color="bg-red-100"
            textColor="text-red-700"
            text="Urgent"
            tooltip="Urgent hiring need"
          />
        )}
        {(job.job_priority === "High" || job.job_priority === "Urgent") && (
          <Badge
            icon={StarIcon} // Icon for high-priority jobs
            color={job.job_priority === "Urgent" ? "bg-yellow-100" : "bg-orange-100"}
            textColor={job.job_priority === "Urgent" ? "text-yellow-700" : "text-orange-700"}
            text={job.job_priority}
            tooltip={`Priority: ${job.job_priority}`}
          />
        )}
        {job.hiring_timeline && job.hiring_timeline !== "Flexible" && (
          <Badge
            icon={ClockIcon} // Icon for hiring timeline
            color="bg-blue-100"
            textColor="text-blue-700"
            text={job.hiring_timeline}
            tooltip={`Hiring timeline: ${job.hiring_timeline}`}
          />
        )}
        {job.remote_work_allowance && job.remote_work_allowance !== "No Remote" && (
          <Badge
            icon={HomeIcon} // Icon for remote work
            color="bg-purple-100"
            textColor="text-purple-700"
            text={job.remote_work_allowance}
            tooltip={`Remote work: ${job.remote_work_allowance}`}
          />
        )}
        {job.interview_rounds && job.interview_rounds !== "1" && (
          <Badge
            icon={ChatBubbleLeftRightIcon} // Icon for interview rounds
            color="bg-teal-100"
            textColor="text-teal-700"
            text={`${job.interview_rounds} Rounds`}
            tooltip={`${job.interview_rounds} interview rounds`}
          />
        )}
        {job.candidate_availability && job.candidate_availability !== "Flexible" && (
          <Badge
            icon={UserIcon} // Icon for candidate availability
            color="bg-indigo-100"
            textColor="text-indigo-700"
            text={job.candidate_availability}
            tooltip={`Availability: ${job.candidate_availability}`}
          />
        )}
      </div>

      {/* Job Header with Job Icon */}
      <div className="flex items-start gap-3 mb-3">
        {/* Generic Job Icon */}
        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <BriefcaseIcon
            className="h-6 w-6 text-gray-600"
            aria-label="Job icon"
          />
        </div>
        <div className="flex-1">
          {/* Job Title */}
          <h2
            className="text-lg sm:text-xl font-semibold text-gray-900 truncate"
            title={job.title || "Untitled Job"}
          >
            {job.title || "Untitled Job"}
          </h2>
          {/* Company */}
          <div className="flex items-center text-sm text-gray-700">
            <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-1.5" />
            <span className="truncate" title={job.company || "Confidential"}>
              {job.company || "Confidential"}
            </span>
          </div>
        </div>
        {isTopSalary && (
          <span className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-full">
            Top Salary
          </span>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-2">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 text-gray-500 mr-1.5" />
          <span className="truncate" title={job.location || "Not specified"}>
            {job.location || "Not specified"}
          </span>
          {workLocation !== "Not specified" && (
            <span className="ml-1.5 truncate" title={workLocation}>
              • {workLocation}
            </span>
          )}
        </div>

        {/* Job Type */}
        {jobType !== "Not specified" && (
          <div className="flex items-center text-sm text-gray-600">
            <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-1.5" />
            <span>{jobType}</span>
          </div>
        )}

        {/* Salary */}
        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center text-sm font-semibold text-gray-800">
            <FaRupeeSign className="h-4 w-4 text-gray-700 mr-1.5" />
            <span>{formatSalary(job.salary_min, job.salary_max, job.salary_type)}</span>
          </div>
        )}

        {/* Date Posted */}
        {job.date_posted && (
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-1.5" />
            <span>Posted: {dateText}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Reusable badge component with tooltip
const Badge = ({ icon: Icon, color, textColor, text, tooltip }) => (
  <motion.span
    whileHover={{ scale: 1.05 }}
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${textColor} shadow-sm relative group`}
    role="status"
    aria-label={text}
  >
    <Icon className="h-3.5 w-3.5 mr-1" />
    <span className="truncate">{text}</span>
    {tooltip && (
      <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {tooltip}
      </span>
    )}
  </motion.span>
);

export default JobCard;