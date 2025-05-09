import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";
import { FaRupeeSign } from "react-icons/fa";
import {
  BriefcaseIcon as HeroBriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ExclamationCircleIcon,
  StarIcon,
  ClockIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BookmarkIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// SVG Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v6H3V3zm4 8h10v10H7V11z" />
  </svg>
);

// Mock Data
const suggestions = [
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "Marketing Specialist",
  "Customer Support",
];

// JobCard Helper Functions
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

// JobCard Component
const JobCard = memo(({ job, isTopSalary, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);
  const workLocation = formatField(job.work_location);
  const jobType = formatField(job.job_type);

  const formatSalary = (min, max, type = "hourly") => {
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
    e.stopPropagation();
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
      <button
        onClick={handleSaveToggle}
        className="absolute top-4 right-4 text-gray-500 hover:text-teal-600 transition"
        aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
      >
        <BookmarkIcon
          className={`h-5 w-5 ${isSaved ? "fill-teal-600 text-teal-600" : "fill-none"}`}
        />
      </button>
      <div className="flex flex-wrap gap-2 mb-3">
        {isNew && (
          <Badge
            icon={CalendarIcon}
            color="bg-red-100"
            textColor="text-red-700"
            text="New"
            tooltip="Posted within the last 48 hours"
          />
        )}
        {job.hiring_multiple === 1 && (
          <Badge
            icon={UsersIcon}
            color="bg-green-100"
            textColor="text-green-700"
            text="Multiple Hiring"
            tooltip="Hiring for multiple positions"
          />
        )}
        {job.urgent_hiring === 1 && (
          <Badge
            icon={FireIcon || ExclamationCircleIcon}
            color="bg-red-100"
            textColor="text-red-700"
            text="Urgent"
            tooltip="Urgent hiring need"
          />
        )}
        {(job.job_priority === "High" || job.job_priority === "Urgent") && (
          <Badge
            icon={StarIcon}
            color={job.job_priority === "Urgent" ? "bg-yellow-100" : "bg-orange-100"}
            textColor={job.job_priority === "Urgent" ? "text-yellow-700" : "text-orange-700"}
            text={job.job_priority}
            tooltip={`Priority: ${job.job_priority}`}
          />
        )}
        {job.hiring_timeline && job.hiring_timeline !== "Flexible" && (
          <Badge
            icon={ClockIcon}
            color="bg-blue-100"
            textColor="text-blue-700"
            text={job.hiring_timeline}
            tooltip={`Hiring timeline: ${job.hiring_timeline}`}
          />
        )}
        {job.remote_work_allowance && job.remote_work_allowance !== "No Remote" && (
          <Badge
            icon={HomeIcon}
            color="bg-purple-100"
            textColor="text-purple-700"
            text={job.remote_work_allowance}
            tooltip={`Remote work: ${job.remote_work_allowance}`}
          />
        )}
        {job.interview_rounds && job.interview_rounds !== "1" && (
          <Badge
            icon={ChatBubbleLeftRightIcon}
            color="bg-teal-100"
            textColor="text-teal-700"
            text={`${job.interview_rounds} Rounds`}
            tooltip={`${job.interview_rounds} interview rounds`}
          />
        )}
        {job.candidate_availability && job.candidate_availability !== "Flexible" && (
          <Badge
            icon={UserIcon}
            color="bg-indigo-100"
            textColor="text-indigo-700"
            text={job.candidate_availability}
            tooltip={`Availability: ${job.candidate_availability}`}
          />
        )}
      </div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <HeroBriefcaseIcon className="h-6 w-6 text-gray-600" aria-label="Job icon" />
        </div>
        <div className="flex-1">
          <h2
            className="text-lg sm:text-xl font-semibold text-gray-900 truncate"
            title={job.title || "Untitled Job"}
          >
            {job.title || "Untitled Job"}
          </h2>
          <div className="flex items-center text-sm text-gray-700">
            <HeroBriefcaseIcon className="h-4 w-4 text-gray-500 mr-1.5" />
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
      <div className="space-y-2">
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
        {jobType !== "Not specified" && (
          <div className="flex items-center text-sm text-gray-600">
            <HeroBriefcaseIcon className="h-4 w-4 text-gray-500 mr-1.5" />
            <span>{jobType}</span>
          </div>
        )}
        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center text-sm font-semibold text-gray-800">
            <FaRupeeSign className="h-4 w-4 text-gray-700 mr-1.5" />
            <span>{formatSalary(job.salary_min, job.salary_max, job.salary_type)}</span>
          </div>
        )}
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

// Badge Component
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

const CandidateHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(60);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);
  const locationSuggestionsRef = useRef(null);

  // Fetch recommended jobs from API with daily refresh
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("https://jobporatl.onrender.com/api/jobs");
        const jobs = response.data.data || response.data;

        // Select 3 random jobs
        const shuffled = jobs.sort(() => 0.5 - Math.random());
        const selectedJobs = shuffled.slice(0, 3).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_type: job.salary_type || "hourly",
          job_type: job.job_type,
          work_location: job.work_location,
          date_posted: job.date_posted,
          hiring_multiple: job.hiring_multiple,
          urgent_hiring: job.urgent_hiring,
          job_priority: job.job_priority,
          hiring_timeline: job.hiring_timeline,
          remote_work_allowance: job.remote_work_allowance,
          interview_rounds: job.interview_rounds,
          candidate_availability: job.candidate_availability,
        }));

        setRecommendedJobs(selectedJobs);
        setError(null);
        localStorage.setItem("lastFetchDateCandidate", new Date().toDateString());
        localStorage.setItem("cachedJobsCandidate", JSON.stringify(selectedJobs));
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Unable to fetch recommended jobs.");
        setRecommendedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    const today = new Date().toDateString();
    const lastFetchDate = localStorage.getItem("lastFetchDateCandidate");
    const cachedJobs = localStorage.getItem("cachedJobsCandidate");

    if (lastFetchDate !== today || !cachedJobs) {
      fetchRecommendedJobs();
    } else {
      setRecommendedJobs(JSON.parse(cachedJobs));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (locationSuggestionsRef.current && !locationSuggestionsRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debouncedCitySearch = useCallback(
    debounce(async (name) => {
      if (name.length < 2) {
        setCities([]);
        setShowLocationSuggestions(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get(`https://jobporatl.onrender.com/api/cities?name=${name}`);
        setCities(response.data.data || []);
        setShowLocationSuggestions(true);
        setError(null);
      } catch (err) {
        setError("Unable to fetch cities.");
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleCitySearch = (e) => {
    const name = e.target.value;
    setLocationQuery(name);
    debouncedCitySearch(name);
  };

  const handleSearch = useCallback(() => {
    if (searchQuery.trim() || locationQuery.trim()) {
      navigate("/jobs", { state: { searchQuery, locationQuery } });
      setShowSuggestions(false);
      setShowLocationSuggestions(false);
    }
  }, [searchQuery, locationQuery, navigate]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleSaveJob = useCallback((jobId) => {
    setSavedJobs((prev) => {
      const newSavedJobs = new Set(prev);
      if (newSavedJobs.has(jobId)) {
        newSavedJobs.delete(jobId);
      } else {
        newSavedJobs.add(jobId);
      }
      return newSavedJobs;
    });
  }, []);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className="mt-[-50px] min-h-screen bg-gray-50 font-sans pt-16">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-teal-600 to-teal-800 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight text-center">
            Welcome Back, Job Seeker!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-100 mb-8 text-center max-w-2xl mx-auto">
            Find jobs tailored to your skills and preferences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative" ref={suggestionsRef}>
              <input
                type="text"
                placeholder="Job title, skills, or company"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length >= 2);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                aria-label="Search jobs"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-lg mt-2 max-h-60 overflow-auto z-20 shadow-lg">
                  {filteredSuggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-teal-50"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch();
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 relative" ref={locationSuggestionsRef}>
              <input
                type="text"
                placeholder="Location (e.g., Remote, New York)"
                value={locationQuery}
                onChange={handleCitySearch}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowLocationSuggestions(locationQuery.length >= 2)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                aria-label="Search location"
              />
              {isLoading && (
                <div className="absolute w-full bg-white border border-gray-300 rounded-lg mt-2 p-3 text-sm text-gray-600 z-20 shadow-lg">
                  Loading...
                </div>
              )}
              {error && (
                <div className="absolute w-full bg-white border border-gray-300 rounded-lg mt-2 p-3 text-sm text-red-600 z-20 shadow-lg">
                  {error}
                </div>
              )}
              {showLocationSuggestions && cities.length > 0 && !isLoading && !error && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-lg mt-2 max-h-60 overflow-auto z-20 shadow-lg">
                  {cities.map((city) => (
                    <li
                      key={city.id || city.name}
                      className="px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-teal-50"
                      onClick={() => {
                        setLocationQuery(city.name);
                        setShowLocationSuggestions(false);
                        handleSearch();
                      }}
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-orange-600 transition"
              aria-label="Search"
            >
              <SearchIcon />
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Profile Completion */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Complete Your Profile
          </h2>
          <div className="bg-gray-100 rounded-lg p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Your profile is {profileCompletion}% complete. Add more details to stand out to employers!
            </p>
            <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
              <div
                className="bg-teal-600 h-2.5 rounded-full"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
            >
              Update Profile
            </button>
          </div>
        </div>
      </section>

      {/* Recommended Jobs */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            Recommended for You
          </h2>
          {isLoading && (
            <div className="text-center text-gray-600">Loading recommended jobs...</div>
          )}
          {error && (
            <div className="text-center text-red-600">{error}</div>
          )}
          {!isLoading && !error && recommendedJobs.length === 0 && (
            <div className="text-center text-gray-600">No recommended jobs available.</div>
          )}
          {!isLoading && !error && recommendedJobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <JobCard
                    job={job}
                    isTopSalary={false}
                    onSave={handleSaveJob}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <a
              href="/jobs"
              className="px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
            >
              View More Jobs
            </a>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                title: "Build Your Resume",
                desc: "Create a professional resume in minutes.",
                icon: <BriefcaseIcon />,
                path: "/resumebuilder",
              },
              {
                title: "View Salaries",
                desc: "Explore salary trends for your role.",
                icon: <BriefcaseIcon />,
                path: "/salaries",
              },
              {
                title: "Check Notifications",
                desc: "Stay updated on job applications.",
                icon: <BriefcaseIcon />,
                path: "/notifications",
              },
            ].map((action) => (
              <div
                key={action.title}
                className="bg-gray-100 p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <div className="flex justify-center mb-4 text-teal-600">{action.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CandidateHome;