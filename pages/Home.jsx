import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRupeeSign } from "react-icons/fa";
import {
  BriefcaseIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  StarIcon,
  ClockIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BookmarkIcon,
  FireIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ReadingEbook, Lowerleftpencil, PeopleManGraduateOutline, UserGraduate, BookOpen, Diploma1, HomeTwo, Clock, Students } from '../assets/Icons';
import businessman from '../assets/businessman.png';
import employees from '../assets/employees.png';
import jobApplication from '../assets/job-application.png';
import computer from '../assets/computer.png';
import service from '../assets/service.png';
import planning from '../assets/planning.png';
import revenue from '../assets/revenue.png';
import person from '../assets/person.png';
import learning from '../assets/learning.png';

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

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
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave(job.id);
  };

  return (
    <div
      className={`p-4 sm:p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative ${
        isTopSalary ? "border-l-4 border-teal-500" : ""
      }`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${job.title || "Untitled Job"} at ${job.company || "Confidential"}`}
    >
      <button
        onClick={handleSaveToggle}
        className="absolute top-4 right-4 text-gray-500 hover:text-teal-500"
        aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
      >
        <BookmarkIcon
          className={`h-5 w-5 ${isSaved ? "fill-teal-500 text-teal-500" : "fill-none"}`}
        />
      </button>
      <div className="flex flex-wrap gap-2 mb-4">
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
            icon={FireIcon}
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
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <BriefcaseIcon className="h-6 w-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <h2
            className="text-lg sm:text-xl font-semibold text-gray-900 truncate"
            title={job.title || "Untitled Job"}
          >
            {job.title || "Untitled Job"}
          </h2>
          <div className="flex items-center text-sm text-gray-600">
            <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-1.5" />
            <span className="truncate" title={job.company || "Confidential"}>
              {job.company || "Confidential"}
            </span>
          </div>
        </div>
        {isTopSalary && (
          <span className="text-xs font-semibold text-white bg-teal-500 px-2 py-1 rounded-full">
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
            <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-1.5" />
            <span>{jobType}</span>
          </div>
        )}
        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center text-sm font-semibold text-gray-800">
            <FaRupeeSign className="h-4 w-4 text-gray-700 mr-15" />
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
    </div>
  );
});

// Badge Component
const Badge = ({ icon: Icon, color, textColor, text, tooltip }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${textColor} shadow-sm relative group`}
    role="status"
    aria-label={text}
  >
    <Icon className="h-3.5 w-3.5 mr-1" />
    <span className="truncate">{text}</span>
    {tooltip && (
      <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        {tooltip}
      </span>
    )}
  </span>
);

// Category Card Component
const CategoryCard = ({ icon: Icon, title, vacancies, onClick }) => (
  <div
    className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between"
    onClick={onClick}
    role="button"
    aria-label={`Filter jobs by ${title}`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-teal-600" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-xs text-gray-600">{vacancies} Vacancies</p>
      </div>
    </div>
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>
);

// Mock Data
const suggestions = [
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "Marketing Specialist",
  "Customer Support",
];

const categories = [
  { name: "Technology", count: "1,200+", image: computer },
  { name: "Sales", count: "900+", image: revenue },
  { name: "Marketing", count: "750+", image: planning },
  { name: "Customer Support", count: "600+", image: service },
];

const qualifications = [
  { title: "Below 10th", vacancies: "25,00,000+", icon: Lowerleftpencil, filter: "Below 10th" },
  { title: "10th Pass", vacancies: "4,00,000+", icon: ReadingEbook, filter: "10th Pass" },
  { title: "12th Pass", vacancies: "7,30,000+", icon: BookOpen, filter: "12th Pass" },
  { title: "Diploma", vacancies: "60,000+", icon: Diploma1, filter: "Diploma" },
  { title: "Graduate", vacancies: "7,10,000+", icon: UserGraduate, filter: "Graduate" },
  { title: "Post Graduate", vacancies: "15,000+", icon: PeopleManGraduateOutline, filter: "Post Graduate" },
];

const jobTypes = [
  { title: "Work from home", vacancies: "60,00,000+", icon: HomeTwo, filter: "Work from home" },
  { title: "Part Time", vacancies: "4,90,000+", icon: Clock, filter: "Part Time" },
  { title: "Jobs for Women", vacancies: "2,60,000+", icon: UserGroupIcon, filter: "Jobs for Women" },
  { title: "Fresher Jobs", vacancies: "5,50,000+", icon: Students, filter: "Fresher Jobs" },
];

const features = [
  {
    title: "Wide Range of Jobs",
    desc: "Explore opportunities across industries and locations.",
    icon: businessman,
    bg: "bg-gray-50",
  },
  {
    title: "Easy Applications",
    desc: "Apply quickly and track your applications seamlessly.",
    icon: jobApplication,
    bg: "bg-white",
  },
  {
    title: "Trusted Employers",
    desc: "Connect with verified companies and recruiters.",
    icon: employees,
    bg: "bg-gray-50",
  },
  {
    title: "Fresher Jobs",
    desc: "Kickstart your career with entry-level opportunities.",
    icon: person,
    bg: "bg-white",
  },
  {
    title: "24/7 Support",
    desc: "Get help anytime with our dedicated support team.",
    icon: service,
    bg: "bg-gray-50",
  },
  {
    title: "Skill Development",
    desc: "Access resources to grow your skills and career.",
    icon: learning,
    bg: "bg-white",
  },
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ location: "" });
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);
  const locationSuggestionsRef = useRef(null);

  // Fetch featured jobs from API with daily refresh
  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("https://jobportal.onrender.com/api/jobs");
        const jobs = response.data.data || response.data;

        // Select 3 random jobs
        const shuffled = jobs.sort(() => 0.5 - Math.random());
        const selectedJobs = shuffled.slice(0, 3).map((job) => ({
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

        setFeaturedJobs(selectedJobs);
        setError(null);
        localStorage.setItem("lastFetchDate", new Date().toDateString());
        localStorage.setItem("cachedJobs", JSON.stringify(selectedJobs));
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Unable to fetch featured jobs.");
        setFeaturedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    const today = new Date().toDateString();
    const lastFetchDate = localStorage.getItem("lastFetchDate");
    const cachedJobs = localStorage.getItem("cachedJobs");

    if (lastFetchDate !== today || !cachedJobs) {
      fetchFeaturedJobs();
    } else {
      setFeaturedJobs(JSON.parse(cachedJobs));
    }
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target)
      ) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced city search
  const handleCitySearch = useCallback(
    debounce(async (name) => {
      if (name.length < 2) {
        setCities([]);
        setShowLocationSuggestions(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://jobportal.onrender.com/api/cities?name=${name}`
        );
        setCities(response.data.data || []);
        setShowLocationSuggestions(true);
        setError(null);
      } catch (error) {
        setError("Unable to fetch cities.");
        setCities([]);
        setShowLocationSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Input handlers
  const onCityChange = useCallback(
    (e) => {
      const name = e.target.value;
      setLocationQuery(name);
      setFormData((prev) => ({ ...prev, location: name }));
      handleCitySearch(name);
    },
    [handleCitySearch]
  );

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

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setSearchQuery(suggestion);
      setShowSuggestions(false);
      handleSearch();
    },
    [handleSearch]
  );

  const handleCitySuggestionClick = useCallback(
    (city) => {
      setLocationQuery(city.name);
      setFormData((prev) => ({ ...prev, location: city.name }));
      setShowLocationSuggestions(false);
      handleSearch();
    },
    [handleSearch]
  );

  // Save job handler
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

  // Memoized filtered suggestions
  const filteredSuggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-teal-500 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1521791055366-0d553872125f')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Discover Your Dream Job
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Explore thousands of opportunities from top companies worldwide.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative" ref={suggestionsRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Job title, skills, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 shadow-sm"
                  aria-label="Search jobs"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute w-full bg-white border border-gray-200 rounded-lg mt-2 max-h-60 overflow-auto shadow-lg z-20">
                  {filteredSuggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-teal-50"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 relative" ref={locationSuggestionsRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Location (e.g., Remote, New York)"
                  value={locationQuery}
                  onChange={onCityChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => locationQuery.length >= 2 && setShowLocationSuggestions(true)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 shadow-sm"
                  aria-label="Search location"
                />
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              {isLoading && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-lg mt-2 p-3 text-sm text-gray-600 shadow-lg z-20">
                  Loading...
                </div>
              )}
              {error && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-lg mt-2 p-3 text-sm text-red-600 shadow-lg z-20">
                  {error}
                </div>
              )}
              {showLocationSuggestions && cities.length > 0 && !isLoading && !error && (
                <ul className="absolute w-full bg-white border border-gray-200 rounded-lg mt-2 max-h-60 overflow-auto shadow-lg z-20">
                  {cities.map((city) => (
                    <li
                      key={city.id || city.name}
                      className="px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-teal-50"
                      onClick={() => handleCitySuggestionClick(city)}
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-teal-700 text-white rounded-lg text-base font-medium hover:bg-teal-800 transition-all duration-200"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5 inline-block mr-2" />
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What is your Qualification?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualifications.map((qual) => (
              <CategoryCard
                key={qual.title}
                icon={qual.icon}
                title={qual.title}
                vacancies={qual.vacancies}
                onClick={() =>
                  navigate("/jobs", { state: { qualificationFilter: qual.filter } })
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Job Types Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What type of job do you want?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobTypes.map((type) => (
              <CategoryCard
                key={type.title}
                icon={type.icon}
                title={type.title}
                vacancies={type.vacancies}
                onClick={() =>
                  navigate("/jobs", { state: { jobTypeFilter: type.filter } })
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Featured Jobs
          </h2>
          {isLoading && (
            <div className="flex justify-center items-center space-x-2 h-16">
              <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"></div>
            </div>
          )}
          {error && (
            <div className="text-center text-red-600 text-base">{error}</div>
          )}
          {!isLoading && !error && featuredJobs.length === 0 && (
            <div className="text-center text-gray-600 text-base">No featured jobs available.</div>
          )}
          {!isLoading && !error && featuredJobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
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
              className="px-6 py-3 bg-teal-500 text-white rounded-lg text-base font-medium hover:bg-teal-600 transition-all duration-200"
            >
              View All Jobs
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => navigate("/jobs", { state: { jobRoleFilter: category.name } })}
              >
                <div className="h-40 flex items-center justify-center bg-gray-50">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-20 w-20 object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-600">{category.count} Jobs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose JobLeAaye?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${feature.bg}`}
              >
                <div className="flex justify-center mb-4">
                  <img src={feature.icon} className="h-12 w-12" alt={feature.title} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-lg mb-6 max-w-md mx-auto">
            Join JobLeAaye and start exploring opportunities today.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 bg-white text-teal-600 rounded-lg text-base font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-teal-700 text-white rounded-lg text-base font-medium hover:bg-teal-800 transition-all duration-200"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">JobLeAaye</h3>
              <p className="text-sm text-gray-400">
                Your platform for finding and posting jobs worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/jobs" className="hover:text-white transition-colors">
                    Browse Jobs
                  </a>
                </li>
                <li>
                  <a href="/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-white transition-colors">
                    Log In
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/postjob" className="hover:text-white transition-colors">
                    Post a Job
                  </a>
                </li>
                <li>
                  <a href="/employer-login" className="hover:text-white transition-colors">
                    Employer Login
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Email for newsletter"
                />
                <button
                  onClick={() => alert("Subscribed!")}
                  className="px-4 py-2 bg-teal-500 text-white rounded-r-lg text-sm hover:bg-teal-600 transition-all duration-200"
                  aria-label="Subscribe"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} JobLeAaye. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;