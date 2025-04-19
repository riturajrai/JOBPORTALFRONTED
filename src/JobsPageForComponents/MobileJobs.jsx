import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { SearchIcon, FilterIcon, XIcon, CheckCircleIcon, BriefcaseIcon } from "../assets/Icons";
import JobCard from "./JobCard";
import JobDetails from "./JobDeatils"; // Corrected typo in import
import { formatField } from "../FilterComponentForMobile.jsx/Utils";
import { useLoader } from "../pages/LoaderContext";
import Loader from "../pages/Loader";

// Constants
const API_BASE_URL = "http://localhost:5000/api";
const JOBS_PER_LOAD = 10;
const MIN_SEARCH_LENGTH = 0;
const DEBOUNCE_DELAY = 300;

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
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
  
  // Search related states
  const [searchTitle, setSearchTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  
  // Location related states
  const [locationQuery, setLocationQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  // Filter states
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
  
  // UI states
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isJobDetailsLoading, setIsJobDetailsLoading] = useState(false);

  // Refs for input focus
  const titleInputRef = useRef(null);
  const cityInputRef = useRef(null);

  // Hooks
  const { setIsLoading, setManualLoading } = useLoader();
  const navigate = useNavigate();
  const location = useLocation();
  const observerRef = useRef(null);

  // Debounced city search
  const fetchCitySuggestions = useCallback(
    async (name) => {
      if (name.length > 0) {
        try {
          const response = await axios.get(`${API_BASE_URL}/cities?name=${name}`);
          setCitySuggestions(response.data.data);
          setShowCitySuggestions(true);
        } catch (error) {
          setError("Unable to fetch cities.");
          setCitySuggestions([]);
        }
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
        setCityFilter("");
      }
    },
    []
  );

  const debouncedFetchCitySuggestions = useCallback(
    debounce(fetchCitySuggestions, DEBOUNCE_DELAY),
    [fetchCitySuggestions]
  );

  // Handle city search
  const handleCitySearch = useCallback((e) => {
    const name = e.target.value;
    setLocationQuery(name);
    setCityFilter(name); // Update city filter for immediate filtering
    debouncedFetchCitySuggestions(name);
  }, [debouncedFetchCitySuggestions]);

  // Handle city suggestion click
  const handleCitySuggestionClick = useCallback((city) => {
    setLocationQuery(city.name);
    setCityFilter(city.name);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    cityInputRef.current?.focus();
  }, []);

  // Clear city search
  const handleClearCitySearch = useCallback(() => {
    setLocationQuery("");
    setCityFilter("");
    setCitySuggestions([]);
    setShowCitySuggestions(false);
    cityInputRef.current?.focus();
  }, []);

  // Debounced job title search
  const debouncedSetSearchTitle = useCallback(
    debounce((value) => {
      setSearchTitle(value);
    }, DEBOUNCE_DELAY),
    []
  );

  // Handle job title input change
  const handleTitleChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTitle(value); // Update immediately for input display
    debouncedSetSearchTitle(value);
  }, [debouncedSetSearchTitle]);

  // Helper functions
  const parseSalaryRange = useCallback((min, max) => {
    const minVal = parseFloat(min) || 0;
    const maxVal = parseFloat(max) || minVal;
    return { min: minVal, max: Math.max(minVal, maxVal) };
  }, []);

  // Data fetching
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setManualLoading(false);
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jobs`, { timeout: 10000 });
      
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid job data format");
      }
      
      const shuffledJobs = response.data.sort(() => Math.random() - 0.5);
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

  // Effect hooks
  useEffect(() => {
    const filters = location.state || {};
    // Set search and location from Home component
    setSearchTitle(filters.searchQuery || "");
    setSearchQuery(filters.searchQuery || "");
    setLocationQuery(filters.cityFilter || filters.locationQuery || "");
    setCityFilter(filters.cityFilter || filters.locationQuery || "");
    
    // Set other filters
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

  // Infinite scroll implementation
  const loadMoreJobs = useCallback(() => {
    if (isFetchingMore || displayedJobs.length >= filteredJobs.length) return;
    
    setIsFetchingMore(true);
    setManualLoading(true);
    
    setTimeout(() => {
      const nextJobs = filteredJobs.slice(
        displayedJobs.length, 
        displayedJobs.length + JOBS_PER_LOAD
      );
      setDisplayedJobs((prev) => [...prev, ...nextJobs]);
      setIsFetchingMore(false);
      setManualLoading(false);
    }, 1000);
  }, [displayedJobs, filteredJobs, isFetchingMore, setManualLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetchingMore) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loadMoreJobs, loading, isFetchingMore]);

  // Filter and sort logic
  const filterAndSortJobs = useCallback(() => {
    setManualLoading(true);
    
    setTimeout(() => {
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
    }, 1000);
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
    setManualLoading,
    parseSalaryRange
  ]);

  useEffect(() => {
    if (
      searchQuery ||
      filterType ||
      sortSalary ||
      filterExperience ||
      minSalary ||
      maxSalary ||
      workLocation ||
      datePosted ||
      companySize ||
      skillsFilter ||
      cityFilter ||
      jobRoleFilter ||
      hiringMultipleFilter ||
      urgentHiringFilter ||
      jobPriorityFilter
    ) {
      setIsSearching(true);
    }
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

  // Search suggestions
  useEffect(() => {
    if (searchTitle && searchTitle.length >= MIN_SEARCH_LENGTH) {
      const jobTitlesAndCompanies = [...new Set(
        allJobs.map((job) => [job.title, job.company]).flat()
      )];
      
      const filteredSuggestions = jobTitlesAndCompanies
        .filter((item) => item && item.toLowerCase().includes(searchTitle.toLowerCase()))
        .slice(0, 5);
      
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTitle, allJobs]);

  const handleSearch = useCallback(() => {
    if (searchTitle.length < MIN_SEARCH_LENGTH) {
      alert(`Please enter at least ${MIN_SEARCH_LENGTH} characters to search.`);
      return;
    }
    setSearchQuery(searchTitle);
    setSuggestions([]);
    titleInputRef.current?.focus();
  }, [searchTitle]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTitle(suggestion);
    setSearchQuery(suggestion);
    setSuggestions([]);
    titleInputRef.current?.focus();
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTitle("");
    setSearchQuery("");
    setSuggestions([]);
    titleInputRef.current?.focus();
  }, []);

  // Active filters count
  useEffect(() => {
    let count = 0;
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
    setSearchTitle("");
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
    fetchJobs();
  }, [fetchJobs]);

  // Job interaction handlers
  const handleJobClick = useCallback((jobId) => {
    console.log("Job clicked, ID:", jobId);
    const jobExists = allJobs.some((job) => job.id === jobId);
    
    if (!jobExists) {
      console.error("Job ID not found in allJobs:", jobId);
      setSelectedJobId(null);
      return;
    }
    
    setIsJobDetailsLoading(true);
    setSelectedJobId(jobId);
    console.log("Selected Job ID set to:", jobId);
    navigate(`/job/${jobId}`);
    setIsJobDetailsLoading(false);
  }, [allJobs, navigate]);

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
    <header className="bg-white shadow-md p-3 sticky top-0 z-10 border-b border-gray-200 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Job Title Input */}
          <div className="relative w-full sm:w-[40%]">
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchTitle}
              onChange={handleTitleChange}
              onKeyPress={handleKeyPress}
              className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-md bg-white text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            {searchTitle && (
              <button onClick={handleClearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            )}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-md max-h-48 overflow-y-auto z-20">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
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
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locationQuery && (
              <button onClick={handleClearCitySearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            )}
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-md max-h-48 overflow-y-auto z-20">
                {citySuggestions.map((city, index) => (
                  <div
                    key={index}
                    onClick={() => handleCitySuggestionClick(city)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search & Filter Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full sm:w-auto bg-[#008080] hover:bg-[#006666] text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              {isSearching ? <Loader /> : "Search"}
            </button>
            <button
              onClick={() => navigate("/filters")}
              className="w-full sm:w-auto flex items-center gap-1 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
            >
              <FilterIcon className="w-4 h-4 text-gray-700" />
              Filters
            </button>
          </div>
        </div>
      </div>
    </header>
  ));

  const JobsListHeader = memo(() => (
    <div className="mb-2 sm:mb-3 md:mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 md:gap-3">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
          <BriefcaseIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#008080] inline-block mr-1 sm:mr-1.5 md:mr-2" />
          Jobs for you
        </h2>
        <p className="text-[0.65rem] sm:text-xs md:text-sm text-gray-600">jobs based on your activity</p>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-[0.65rem] sm:text-xs md:text-sm text-[#008080] font-medium hover:underline flex items-center gap-0.5 sm:gap-1 md:gap-1.5"
          >
            <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
            Reset Filters ({activeFiltersCount})
          </button>
        )}
      </div>
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
      <p className="text-gray-700 text-[0.65rem] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4">
        No jobs match your criteria.
      </p>
    </div>
  ));

  const EndOfListIndicator = memo(() => (
    <div className="py-2 sm:py-3 md:py-4 text-center text-[0.65rem] sm:text-xs md:text-sm text-gray-600 flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5">
      <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#008080]" />
      You've reached the end of the list.
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col lg:hidden">
      <SearchHeader />
      
      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-full mx-auto py-3 sm:py-4 md:py-6 px-2 sm:px-3 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {/* Jobs List */}
          <main className="md:col-span-1">
            <JobsListHeader />
            
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {loading || isSearching ? (
                <div className="flex justify-center py-3 sm:py-4">
                  <Loader />
                </div>
              ) : displayedJobs.length ? (
                displayedJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleJobClick(job.id)}
                    className="cursor-pointer"
                  >
                    <JobCard
                      job={job}
                      onSave={handleSaveJob}
                      isTopSalary={
                        sortSalary === "desc" &&
                        filteredJobs.slice(0, 3).some((topJob) => topJob.id === job.id)
                      }
                    />
                  </motion.div>
                ))
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
          </main>

          {/* Job Details (Mobile) */}
          <div className="md:hidden">
            {selectedJobId && !isJobDetailsLoading ? (
              <div className="bg-white rounded-xl shadow-md p-2 sm:p-3 md:p-4">
                <JobDetails id={selectedJobId} key={selectedJobId} />
              </div>
            ) : isJobDetailsLoading ? (
              <div className="p-2 sm:p-3 md:p-4 flex justify-center">
                <Loader />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MobileJobs);