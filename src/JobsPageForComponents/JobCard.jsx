import { memo } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,          // For hiring_multiple
  ExclamationCircleIcon, // For urgent_hiring
  StarIcon,          // For job_priority
  ClockIcon,         // For hiring_timeline
  HomeIcon,          // For remote_work_allowance
  ChatBubbleLeftRightIcon, // For interview_rounds
  UserIcon,          // For candidate_availability
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
        return field.split(",").map((item) => item.trim()).filter(Boolean).join(", ");
      }
    }
    return field.split(",").map((item) => item.trim()).filter(Boolean).join(", ");
  }
  return String(field);
};

const JobCard = memo(({ job, isTopSalary }) => {
  const workLocation = formatField(job.work_location);
  const jobType = formatField(job.job_type);

  const formatSalary = (min, max, type = "monthly") => {
    if (!min && !max) return "Not disclosed";
    if (min && max) return `${min} - ${max} /${type}`;
    return min ? `${min} /${type} *` : `${max} /${type} *`;
  };

  const formatDatePosted = (date) => {
    if (!date) return { text: "Not specified", isNew: false };
    const postedDate = new Date(date);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const text = diffDays === 0 ? "Today" : diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    return { text, isNew: diffHours <= 48 };
  };

  const { text: dateText, isNew } = formatDatePosted(job.date_posted);

  return (
    <div
      className={`p-3 sm:p-4 md:p-6 rounded-xl shadow-md bg-white border transition-all duration-300 hover:shadow-lg cursor-pointer ${
        isTopSalary ? "border-l-4 border-[#008080] bg-[#f0fafa]/50" : "border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 lg:gap-2">
        <div className="space-y-2 sm:space-y-3 lg:space-y-1 flex-grow">
          {/* Header Section */}
          <div className="flex flex-col gap-1 sm:gap-2 lg:gap-1">
            {/* Tags for New and Case 5 Features */}
            <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-1">
              {isNew && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold text-red-700 bg-red-100 shadow-sm transition-colors duration-200 hover:bg-red-200">
                  <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  New
                </span>
              )}
              {job.hiring_multiple === 1 && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold text-green-700 bg-green-100 shadow-sm transition-colors duration-200 hover:bg-green-200">
                  <UsersIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  Multiple Hiring
                </span>
              )}
              {job.urgent_hiring === 1 && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold text-red-700 bg-red-100 shadow-sm transition-colors duration-200 hover:bg-red-200">
                  <ExclamationCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  Urgent
                </span>
              )}
              {(job.job_priority === "High" || job.job_priority === "Urgent") && (
                <span
                  className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold shadow-sm transition-colors duration-200 hover:bg-opacity-80 ${
                    job.job_priority === "Urgent"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  <StarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  {job.job_priority}
                </span>
              )}
              {job.hiring_timeline && job.hiring_timeline !== "Flexible" && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold text-blue-700 bg-blue-100 shadow-sm transition-colors duration-200 hover:bg-blue-200">
                  <ClockIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  {job.hiring_timeline}
                </span>
              )}
              {job.remote_work_allowance && job.remote_work_allowance !== "No Remote" && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold text-purple-700 bg-purple-100 shadow-sm transition-colors duration-200 hover:bg-purple-200">
                  <HomeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  {job.remote_work_allowance}
                </span>
              )}
              {job.interview_rounds && job.interview_rounds !== "1" && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold text-teal-700 bg-teal-100 shadow-sm transition-colors duration-200 hover:bg-teal-200">
                  <ChatBubbleLeftRightIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  {job.interview_rounds} Rounds
                </span>
              )}
              {job.candidate_availability && job.candidate_availability !== "Flexible" && (
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold text-indigo-700 bg-indigo-100 shadow-sm transition-colors duration-200 hover:bg-indigo-200">
                  <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  {job.candidate_availability}
                </span>
              )}
            </div>

            {/* Job Title and Top Salary */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-1">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                {job.title || "Untitled Job"}
              </h3>
              {isTopSalary && (
                <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold bg-[#008080] text-white shadow-sm">
                  Top Salary
                </span>
              )}
            </div>

            {/* Salary */}
            {(job.salary_min || job.salary_max) && (
              <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-0.5">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 flex items-center gap-0.5 sm:gap-1 lg:gap-0.5">
                  <FaRupeeSign size={10} className="sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
                </span>
              </div>
            )}
          </div>

          {/* Company */}
          <p className="text-xs sm:text-sm md:text-base text-gray-700 font-medium flex items-center gap-1 sm:gap-1.5 lg:gap-1">
            <BriefcaseIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
            {job.company || "Confidential"}
          </p>

          {/* Location */}
          <p className="text-xs sm:text-sm md:text-base text-gray-600 flex items-center gap-1 sm:gap-1.5 lg:gap-1 flex-wrap">
            <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
            {job.location || "Location not specified"}
            {workLocation !== "Not specified" && (
              <span className="ml-0.5 sm:ml-1 text-gray-500">• {workLocation}</span>
            )}
          </p>

          {/* Job Type */}
          {jobType !== "Not specified" && (
            <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-1 bg-gray-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm md:text-base text-gray-700 w-fit shadow-sm">
              <BriefcaseIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
              {jobType}
            </div>
          )}

          {/* Date Posted */}
          <div className="mt-2 sm:mt-3 lg:mt-1 text-xs sm:text-sm md:text-base text-gray-600 space-y-1 border-t border-gray-200 pt-2 sm:pt-3 lg:pt-1">
            {job.date_posted && (
              <p className="flex items-center gap-1 sm:gap-1.5 lg:gap-1">
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
                <span className="font-semibold">Posted:</span> {dateText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default JobCard;