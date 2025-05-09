import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, FilterIcon, XIcon, CheckCircleIcon, BriefcaseIcon } from "../assets/Icons";
import JobCard from "./JobCard";
import JobDetails from "./JobDeatils";
import { formatField } from "../FilterComponentForMobile.jsx/Utils";
import { useLoader } from "../pages/LoaderContext";
import Loader from "../pages/Loader";

// Constants
const API_BASE_URL = "https://jobporatl.onrender.com/api"; // Update to production URL if needed
const JOBS_PER_LOAD = 10;
const DEBOUNCE_DELAY = 300;

// Debounce utility with cancellation
const debounce = (func, delay) => {
  let timeoutId;
  return {
    invoke: (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    },
    cancel: () => clearTimeout(timeoutId),
  };
};

const MobileJobs = () => {
  // State hooks
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [sortSalary, setSortSalary] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("");
  const [hiringMultipleFilter, setHiringMultipleFilter] = useState("");
  const [urgentHiringFilter, setUrgentHiringFilter] = useState("");
  const [jobPriorityFilter, setJobPriorityFilter] = useState("");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isJobDetailsLoading, setIsJobDetailsLoading] = useState(false);

  // Refs
  const titleInputRef = useRef(null);
  const cityInputRef = useRef(null);
  const observerRef = useRef(null);
  const jobDetailsRef = useRef(null);

  // Hooks
  const { setIsLoading, setManualLoading } = useLoader();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch city suggestions with cancellation
  const fetchCitySuggestions = useCallback(
    async (name, signal) => {
      if (name.length === 0) {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
        setCityFilter("");
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/cities?name=${name}`, { signal });
        setCitySuggestions(response.data.data || []);
        setShowCitySuggestions(true);
        setError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          setError("Unable to fetch cities.");
          setCitySuggestions([]);
        }
      }
    },
    []
  );

  const debouncedFetchCitySuggestions = useRef(
    debounce(
      (name, signal) => fetchCitySuggestions(name, signal),
      DEBOUNCE_DELAY
    )
  ).current;

  // Helper functions
  const parseSalaryRange = useCallback((min, max) => {
    const minVal = parseFloat(min) || 0;
    const maxVal = parseFloat(max) || minVal;
    return { min: minVal, max: Math.max(minVal, maxVal) };
  }, []);

  // Optimized filter and sort logic (moved up to avoid TDZ)
  const filterAndSortJobs = useCallback(() => {
    setIsSearching(true);
    setManualLoading(true);
    let filtered = [...allJobs];
    filtered = filtered.filter((job) => {
      const salaryRange = parseSalaryRange(job.salary_min, job.salary_max);
      const jobDate = job.date_posted ? new Date(job.date_posted) : null;
      const now = new Date();
      const jobType = formatField(job.job_type).toLowerCase();
      const workLoc = formatField(job.work_location).toLowerCase();
      const exp = formatField(job.experience);
      const skills = formatField(job.skills).toLowerCase().split(", ").filter(Boolean);
      const title = (job.title || "").toLowerCase();
      const company = (job.company || "").toLowerCase();
      const city = (job.location || "").toLowerCase();
      const role = (job.title || "").toLowerCase();

      return (
        (!searchQuery ||
          title.includes(searchQuery.toLowerCase()) ||
          company.includes(searchQuery.toLowerCase())) &&
        (!filterType || jobType.includes(filterType.toLowerCase())) &&
        (!filterExperience || exp === filterExperience) &&
        (!minSalary || salaryRange.max >= parseFloat(minSalary)) &&
        (!maxSalary || salaryRange.min <= parseFloat(maxSalary)) &&
        (!workLocation || workLoc.includes(workLocation.toLowerCase())) &&
        (!datePosted ||
          (datePosted === "24h" && jobDate && now - jobDate <= 24 * 60 * 60 * 1000) ||
          (datePosted === "3d" && jobDate && now - jobDate <= 3 * 24 * 60 * 60 * 1000) ||
          (datePosted === "7d" && jobDate && now - jobDate <= 7 * 24 * 60 * 60 * 1000) ||
          (datePosted === "30d" && jobDate && now - jobDate <= 30 * 24 * 60 * 60 * 1000)) &&
        (!companySize || formatField(job.company_size) === companySize) &&
        (!skillsFilter ||
          skills.some((skill) => skill.includes(skillsFilter.toLowerCase()))) &&
        (!cityFilter || city.includes(cityFilter.toLowerCase())) &&
        (!jobRoleFilter || role.includes(jobRoleFilter.toLowerCase())) &&
        (!hiringMultipleFilter ||
          (hiringMultipleFilter === "yes" ? job.hiring_multiple === 1 : job.hiring_multiple === 0)) &&
        (!urgentHiringFilter ||
          (urgentHiringFilter === "yes" ? job.urgent_hiring === 1 : job.urgent_hiring === 0)) &&
        (!jobPriorityFilter ||
          job.job_priority.toLowerCase() === jobPriorityFilter.toLowerCase())
      );
    });

    if (sortSalary) {
      filtered.sort((a, b) => {
        const aSalary = parseSalaryRange(a.salary_min, a.salary_max).min;
        const bSalary = parseSalaryRange(b.salary_min, b.salary_max).min;
        return sortSalary === "asc" ? aSalary - bSalary : bSalary - aSalary;
      });
    }

    setFilteredJobs(filtered);
    setDisplayedJobs(filtered.slice(0, JOBS_PER_LOAD));
    setIsSearching(false);
    setManualLoading(false);
  }, [
    allJobs,
    searchQuery,
    filterType,
    sortSalary,
    filterExperience,
    minSalary,
    maxSalary,
    workLocation,
    datePosted,
    companySize,
    skillsFilter,
    cityFilter,
    jobRoleFilter,
    hiringMultipleFilter,
    urgentHiringFilter,
    jobPriorityFilter,
    parseSalaryRange,
    setManualLoading,
  ]);

  // Handlers (moved after filterAndSortJobs to avoid TDZ)
  const handleCitySearch = useCallback(
    (e) => {
      const name = e.target.value;
      setLocationQuery(name);
      setCityFilter(name);
      const controller = new AbortController();
      debouncedFetchCitySuggestions.invoke(name, controller.signal);
      return () => controller.abort();
    },
    []
  );

  const handleCitySuggestionClick = useCallback((city) => {
    setLocationQuery(city.name);
    setCityFilter(city.name);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    cityInputRef.current?.focus();
  }, []);

  const handleClearCitySearch = useCallback(() => {
    setLocationQuery("");
    setCityFilter("");
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    cityInputRef.current?.focus();
  }, []);

  const handleTitleChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSuggestions(
      value.length > 0
        ? [...new Set(allJobs.map((job) => [job.title, job.company]).flat())]
            .filter((item) => item && item.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 5)
        : []
    );
  }, [allJobs]);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    filterAndSortJobs();
    titleInputRef.current?.focus();
  }, [filterAndSortJobs]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    setIsSearching(true);
    filterAndSortJobs();
    titleInputRef.current?.focus();
  }, [filterAndSortJobs]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSuggestions([]);
    setIsSearching(true);
    filterAndSortJobs();
    titleInputRef.current?.focus();
  }, [filterAndSortJobs]);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setManualLoading(false);
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/jobs`, { timeout: 10000 });
      if (!Array.isArray(response.data)) throw new Error("Invalid job data format");
      const shuffledJobs = response.data.sort(() => Math.random() - 0.5);
      setAllJobs(shuffledJobs);
      setFilteredJobs(shuffledJobs);
      setDisplayedJobs(shuffledJobs.slice(0, JOBS_PER_LOAD));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch jobs.");
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
      setManualLoading(false);
      setLoading(false);
    }
  }, [setIsLoading, setManualLoading]);

  // Effects
  useEffect(() => {
    const filters = location.state || {};
    setSearchQuery(filters.searchQuery || "");
    setLocationQuery(filters.cityFilter || filters.locationQuery || "");
    setCityFilter(filters.cityFilter || filters.locationQuery || "");
    setFilterType(filters.filterType || "");
    setFilterExperience(filters.filterExperience || "");
    setWorkLocation(filters.workLocation || "");
    setDatePosted(filters.datePosted || "");
    setCompanySize(filters.companySize || "");
    setMinSalary(filters.minSalary || "");
    setMaxSalary(filters.maxSalary || "");
    setSortSalary(filters.sortSalary || "");
    setSkillsFilter(filters.skillsFilter || "");
    setJobRoleFilter(filters.jobRoleFilter || "");
    setHiringMultipleFilter(filters.hiringMultipleFilter || "");
    setUrgentHiringFilter(filters.urgentHiringFilter || "");
    setJobPriorityFilter(filters.jobPriorityFilter || "");
  }, [location.state]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    filterAndSortJobs();
  }, [
    searchQuery,
    filterType,
    sortSalary,
    filterExperience,
    minSalary,
    maxSalary,
    workLocation,
    datePosted,
    companySize,
    skillsFilter,
    cityFilter,
    jobRoleFilter,
    hiringMultipleFilter,
    urgentHiringFilter,
    jobPriorityFilter,
    filterAndSortJobs,
  ]);

  // Infinite scroll
  const loadMoreJobs = useCallback(() => {
    if (isFetchingMore || displayedJobs.length >= filteredJobs.length) return;
    setIsFetchingMore(true);
    setManualLoading(true);
    const nextJobs = filteredJobs
      .slice(displayedJobs.length, displayedJobs.length + JOBS_PER_LOAD)
      .filter((job) => !displayedJobs.some((existing) => existing.id === job.id));
    setDisplayedJobs((prev) => [...prev, ...nextJobs]);
    setIsFetchingMore(false);
    setManualLoading(false);
  }, [displayedJobs, filteredJobs, isFetchingMore, setManualLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetchingMore) {
          loadMoreJobs();
        }
      },
      { threshold: 0.5 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loadMoreJobs, loading, isFetchingMore]);

  // Active filters count
  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (filterType) count++;
    if (filterExperience) count++;
    if (minSalary) count++;
    if (maxSalary) count++;
    if (workLocation) count++;
    if (datePosted) count++;
    if (companySize) count++;
    if (skillsFilter) count++;
    if (sortSalary) count++;
    if (cityFilter) count++;
    if (jobRoleFilter) count++;
    if (hiringMultipleFilter) count++;
    if (urgentHiringFilter) count++;
    if (jobPriorityFilter) count++;
    setActiveFiltersCount(count);
  }, [
    searchQuery,
    filterType,
    filterExperience,
    minSalary,
    maxSalary,
    workLocation,
    datePosted,
    companySize,
    skillsFilter,
    sortSalary,
    cityFilter,
    jobRoleFilter,
    hiringMultipleFilter,
    urgentHiringFilter,
    jobPriorityFilter,
  ]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setLocationQuery("");
    setCityFilter("");
    setFilterType("");
    setSortSalary("");
    setFilterExperience("");
    setMinSalary("");
    setMaxSalary("");
    setWorkLocation("");
    setDatePosted("");
    setCompanySize("");
    setSkillsFilter("");
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    setJobRoleFilter("");
    setHiringMultipleFilter("");
    setUrgentHiringFilter("");
    setJobPriorityFilter("");
    setSuggestions([]);
    setFilteredJobs(allJobs);
    setDisplayedJobs(allJobs.slice(0, JOBS_PER_LOAD));
    setError("");
  }, [allJobs]);

  // Job interaction handlers
  const handleJobClick = useCallback(
    (jobId) => {
      const jobExists = allJobs.some((job) => job.id === jobId);
      if (!jobExists) {
        setError("Job not found.");
        setSelectedJobId(null);
        return;
      }
      setIsJobDetailsLoading(true);
      setSelectedJobId(jobId);
      navigate(`/job/${jobId}`);
      setIsJobDetailsLoading(false);
    },
    [allJobs, navigate]
  );

  const handleSaveJob = useCallback((jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  }, []);

  const handleMobileNumberSubmit = useCallback(() => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    alert(`App link sent to ${mobileNumber}`);
    setMobileNumber("");
  }, [mobileNumber]);

  // Sub-components
  const SearchHeader = memo(() => (
    <header className="   bg-white shadow-md p-3  z-10 border-b border-gray-200 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Job Title Input */}
          <div className="relative w-full sm:w-[40%]">
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchQuery}
              onChange={handleTitleChange}
              onKeyPress={handleKeyPress}
              className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md bg-white text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]"
              aria-label="Search jobs by title, keywords, or company"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-md max-h-48 overflow-y-auto z-20"
                  role="listbox"
                >
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onKeyPress={(e) => e.key === "Enter" && handleSuggestionClick(suggestion)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      role="option"
                      aria-selected={false}
                      tabIndex={0}
                    >
                      {suggestion}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* City Input */}
          <div className="relative w-full sm:w-[30%]">
            <input
              ref={cityInputRef}
              type="text"
              placeholder="City or location"
              value={locationQuery}
              onChange={handleCitySearch}
              className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md bg-white text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]"
              aria-label="Search by city or location"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {locationQuery && (
              <button
                onClick={handleClearCitySearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear city search"
              >
                ✕
              </button>
            )}
            <AnimatePresence>
              {showCitySuggestions && citySuggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-md max-h-48 overflow-y-auto z-20"
                  role="listbox"
                >
                  {citySuggestions.map((city, index) => (
                    <li
                      key={index}
                      onClick={() => handleCitySuggestionClick(city)}
                      onKeyPress={(e) => e.key === "Enter" && handleCitySuggestionClick(city)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      role="option"
                      aria-selected={false}
                      tabIndex={0}
                    >
                      {city.name}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Search & Filter Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full sm:w-auto bg-[#008080] hover:bg-[#006666] text-white px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
              aria-label="Search jobs"
            >
              {isSearching ? <Loader /> : "Search"}
            </button>
            <button
              onClick={() => navigate("/filters")}
              className="w-full sm:w-auto flex items-center gap-1 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
              aria-label="Open filters"
            >
              <FilterIcon className="w-4 h-4 text-gray-700" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
        </div>
      </div>
    </header>
  ));

  const FilterChips = memo(() => {
    const filters = [
      { label: searchQuery, clear: () => setSearchQuery("") },
      { label: filterType, clear: () => setFilterType("") },
      { label: filterExperience, clear: () => setFilterExperience("") },
      { label: minSalary ? `Min: $${minSalary}` : "", clear: () => setMinSalary("") },
      { label: maxSalary ? `Max: $${maxSalary}` : "", clear: () => setMaxSalary("") },
      { label: workLocation, clear: () => setWorkLocation("") },
      { label: datePosted, clear: () => setDatePosted("") },
      { label: companySize, clear: () => setCompanySize("") },
      { label: skillsFilter, clear: () => setSkillsFilter("") },
      { label: cityFilter, clear: () => setCityFilter("") },
      { label: jobRoleFilter, clear: () => setJobRoleFilter("") },
      { label: hiringMultipleFilter === "yes" ? "Hiring Multiple" : "", clear: () => setHiringMultipleFilter("") },
      { label: urgentHiringFilter === "yes" ? "Urgent Hiring" : "", clear: () => setUrgentHiringFilter("") },
      { label: jobPriorityFilter, clear: () => setJobPriorityFilter("") },
      { label: sortSalary ? `Sort: ${sortSalary === "asc" ? "Low to High" : "High to Low"}` : "", clear: () => setSortSalary("") },
    ].filter((f) => f.label);

    return filters.length > 0 ? (
      <div className="flex flex-wrap gap-2 px-2 sm:px-3 md:px-4 py-2 bg-gray-50">
        {filters.map((filter, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded-full"
            role="button"
            aria-label={`Filter: ${filter.label}`}
          >
            {filter.label}
            <button
              onClick={filter.clear}
              className="text-teal-600 hover:text-teal-800"
              aria-label={`Remove ${filter.label} filter`}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={handleResetFilters}
          className="text-teal-600 hover:text-teal-800 text-xs font-medium"
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>
    ) : null;
  });

  const JobsListHeader = memo(() => (
    <div className="mb-2 sm:mb-3 md:mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 md:gap-3">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
          <BriefcaseIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#008080] inline-block mr-1 sm:mr-1.5 md:mr-2" />
          Jobs for you
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">jobs based on your activity</p>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-xs sm:text-sm text-[#008080] font-medium hover:underline flex items-center gap-0.5 sm:gap-1 md:gap-1.5"
          >
            <XIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Reset Filters ({activeFiltersCount})
          </button>
        )}
      </div>
    </div>
  ));

  const SkeletonLoader = memo(() => (
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  ));

  const NoJobsFound = memo(() => (
    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-sm text-center border border-gray-100">
      <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">
        No jobs match your criteria.
      </p>
      <button
        onClick={handleResetFilters}
        className="text-teal-600 hover:text-teal-800 text-xs sm:text-sm font-medium"
      >
        Reset Filters
      </button>
    </div>
  ));

  const EndOfListIndicator = memo(() => (
    <div className="py-2 sm:py-3 md:py-4 text-center text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5">
      <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#008080]" />
      You've reached the end of the list.
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col lg:hidden">
      <SearchHeader />
      <FilterChips />

      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-full mx-auto py-3 sm:py-4 md:py-6 px-2 sm:px-3 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {/* Jobs List */}
          <main className="md:col-span-1">
            <JobsListHeader />

            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {loading || isSearching ? (
                <SkeletonLoader />
              ) : displayedJobs.length ? (
                <AnimatePresence>
                  {displayedJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleJobClick(job.id)}
                      className="cursor-pointer"
                    >
                      <JobCard
                        job={{
                          ...job,
                          title: job.title || "Untitled Job",
                          company: job.company || "Confidential",
                          location: job.location || "Not specified",
                          work_location: job.work_location || "Not specified",
                          job_type: job.job_type || "Not specified",
                          salary_min: job.salary_min || "",
                          salary_max: job.salary_max || "",
                          salary_type: job.salary_type || "monthly",
                          date_posted: job.date_posted || "",
                          hiring_multiple: job.hiring_multiple || 0,
                          urgent_hiring: job.urgent_hiring || 0,
                          job_priority: job.job_priority || "",
                          hiring_timeline: job.hiring_timeline || "",
                          remote_work_allowance: job.remote_work_allowance || "",
                          interview_rounds: job.interview_rounds || "",
                          candidate_availability: job.candidate_availability || "",
                        }}
                        onSave={handleSaveJob}
                        isTopSalary={
                          sortSalary === "desc" &&
                          filteredJobs.slice(0, 3).some((topJob) => topJob.id === job.id)
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <NoJobsFound />
              )}
            </div>

            {displayedJobs.length < filteredJobs.length && !isSearching && (
              <div ref={observerRef} className="py-2 sm:py-3 md:py-4 flex justify-center">
                {isFetchingMore ? <Loader /> : null}
              </div>
            )}

            {displayedJobs.length === filteredJobs.length && filteredJobs.length > 0 && !isSearching && (
              <EndOfListIndicator />
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-4 text-xs sm:text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
                <button
                  onClick={() => {
                    setError("");
                    fetchJobs();
                  }}
                  className="ml-auto text-red-600 hover:text-red-800"
                  aria-label="Retry"
                >
                  Retry
                </button>
              </div>
            )}
          </main>

          {/* Job Details (Mobile) */}
          <AnimatePresence>
            {selectedJobId && !isJobDetailsLoading && (
              <motion.div
                ref={jobDetailsRef}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="md:col-span-1 md:hidden bg-white rounded-xl shadow-md p-2 sm:p-3 md:p-4"
              >
                <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Job Details</h3>
                  <button
                    onClick={() => {
                      setSelectedJobId(null);
                      navigate(-1);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Close job details"
                  >
                    <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <JobDetails id={selectedJobId} key={selectedJobId} />
              </motion.div>
            )}
          </AnimatePresence>
          {selectedJobId && isJobDetailsLoading && (
            <div className="md:col-span-1 md:hidden p-2 sm:p-3 md:p-4 flex justify-center">
              <Loader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MobileJobs);