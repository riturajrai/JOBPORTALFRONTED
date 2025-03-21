import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, DollarSign, Clock, ChevronRight, Star } from "lucide-react";

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleCardClick = () => {
    if (isAuthenticated) {
      navigate(`/job/${job.id}`);
    } else {
      navigate("/login");
    }
  };

  // Logo rendering with fallback
  const renderLogo = () => {
    if (job.logo) {
      return (
        <img
          src={job.logo}
          alt={`${job.company || "Company"} Logo`}
          className="w-10 h-10 rounded-md border border-gray-200 object-contain bg-white p-1 shadow-sm transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none";
          }}
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Briefcase className="w-4 h-4 text-gray-400" aria-hidden="true" />
      </div>
    );
  };

  // Professional fallbacks and formatting
  const salaryDisplay = job.salary && job.salary !== "Not specified" ? job.salary : "Competitive";
  const postedDate = job.date_posted
    ? (() => {
        const date = new Date(job.date_posted);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? "Today" : `${diffDays}d ago`;
      })()
    : "Recent";

  // Check if job is new (within 3 days) or featured
  const isNew = postedDate === "Today" || (job.date_posted && new Date(job.date_posted) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
  const isFeatured = job.featured; // Assuming `featured` is a boolean in your job data

  return (
    <div
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex items-center gap-3"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyPress={(e) => e.key === "Enter" && handleCardClick()}
      aria-label={`View details for ${job.title || "Untitled Job"} at ${job.company || "Confidential Employer"}`}
    >
      {/* Logo */}
      <div className="flex-shrink-0">{renderLogo()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3
              className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 truncate"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              {job.title || "Untitled Job"}
            </h3>
            {(isNew || isFeatured) && (
              <span
                className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                  isFeatured ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}
              >
                {isFeatured ? "Featured" : "New"}
              </span>
            )}
          </div>
          <ChevronRight
            className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>

        <p className="text-sm text-gray-600 truncate mt-1">{job.company || "Confidential Employer"}</p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-500" aria-hidden="true" />
            <span className="truncate">{job.location || "Remote"}</span>
          </div>
          {job.job_type && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-gray-500" aria-hidden="true" />
              <span>{job.job_type}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-600" aria-hidden="true" />
            <span>{salaryDisplay}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" aria-hidden="true" />
            <span>{postedDate}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100 transition-colors duration-200 hover:bg-indigo-100"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-shrink-0"
        aria-label="View job details"
      >
        {isAuthenticated ? "View" : "Login"}
      </button>
    </div>
  );
};

export default JobCard;