import { memo } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ExclamationCircleIcon,
  StarIcon,
  ClockIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

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

const JobCard = memo(({ job, isTopSalary }) => {
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

  return (
    <div
      className={`p-4 sm:p-5 md:p-6 rounded-xl shadow-sm bg-white border transition-all duration-300 hover:shadow-md cursor-pointer ${
        isTopSalary ? "border-l-4 border-teal-600 bg-teal-50/40" : "border-gray-200"
      }`}
    >
      {/* Header Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {isNew && (
          <Badge icon={CalendarIcon} color="bg-red-100" textColor="text-red-700" text="New" />
        )}
        {job.hiring_multiple === 1 && (
          <Badge icon={UsersIcon} color="bg-green-100" textColor="text-green-700" text="Multiple Hiring" />
        )}
        {job.urgent_hiring === 1 && (
          <Badge icon={ExclamationCircleIcon} color="bg-red-100" textColor="text-red-700" text="Urgent" />
        )}
        {(job.job_priority === "High" || job.job_priority === "Urgent") && (
          <Badge
            icon={StarIcon}
            color={job.job_priority === "Urgent" ? "bg-yellow-100" : "bg-orange-100"}
            textColor={job.job_priority === "Urgent" ? "text-yellow-700" : "text-orange-700"}
            text={job.job_priority}
          />
        )}
        {job.hiring_timeline && job.hiring_timeline !== "Flexible" && (
          <Badge icon={ClockIcon} color="bg-blue-100" textColor="text-blue-700" text={job.hiring_timeline} />
        )}
        {job.remote_work_allowance && job.remote_work_allowance !== "No Remote" && (
          <Badge icon={HomeIcon} color="bg-purple-100" textColor="text-purple-700" text={job.remote_work_allowance} />
        )}
        {job.interview_rounds && job.interview_rounds !== "1" && (
          <Badge
            icon={ChatBubbleLeftRightIcon}
            color="bg-teal-100"
            textColor="text-teal-700"
            text={`${job.interview_rounds} Rounds`}
          />
        )}
        {job.candidate_availability && job.candidate_availability !== "Flexible" && (
          <Badge
            icon={UserIcon}
            color="bg-indigo-100"
            textColor="text-indigo-700"
            text={job.candidate_availability}
          />
        )}
      </div>

      {/* Job Title + Salary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-full">
          {job.title || "Untitled Job"}
        </h2>
        {isTopSalary && (
          <span className="text-xs font-semibold text-white bg-teal-600 px-2.5 py-1 rounded-full">
            Top Salary
          </span>
        )}
      </div>

      {/* Company */}
      <div className="flex items-center text-sm text-gray-700 mb-1">
        <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-1" />
        {job.company || "Confidential"}
      </div>

      {/* Location */}
      <div className="flex items-center text-sm text-gray-600 flex-wrap mb-1">
        <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
        <span>{job.location || "Not specified"}</span>
        {workLocation !== "Not specified" && <span className="ml-1">• {workLocation}</span>}
      </div>

      {/* Job Type */}
      {jobType !== "Not specified" && (
        <div className="flex items-center text-sm text-gray-700 mt-1">
          <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-1" />
          <span>{jobType}</span>
        </div>
      )}

      {/* Salary */}
      {(job.salary_min || job.salary_max) && (
        <div className="mt-2 flex items-center text-sm font-semibold text-gray-800">
          <FaRupeeSign className="h-4 w-4 mr-1 text-gray-700" />
          {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
        </div>
      )}

      {/* Date Posted */}
      {job.date_posted && (
        <div className="mt-3 text-sm text-gray-500 flex items-center gap-1">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Posted:</span>
          <span>{dateText}</span>
        </div>
      )}
    </div>
  );
});

// Reusable badge component
const Badge = ({ icon: Icon, color, textColor, text }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${textColor} shadow-sm`}
  >
    <Icon className="h-3.5 w-3.5 mr-1" />
    {text}
  </span>
);

export default JobCard;
