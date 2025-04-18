import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { SearchIcon, FilterIcon, XIcon, CheckCircleIcon, BriefcaseIcon } from "../assets/Icons";
import JobCard from "./JobCard";
import JobDetails from "./JobDeatils"; // Fixed typo
import { formatField } from "../FilterComponentForMobile.jsx/Utils";
import { useLoader } from "../pages/LoaderContext";
import Loader from "../pages/Loader";

const MobileJobs = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortSalary, setSortSalary] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [cityFilter, setCityFilter] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isJobDetailsLoading, setIsJobDetailsLoading] = useState(false);
  const [hiringMultipleFilter, setHiringMultipleFilter] = useState("");
  const [urgentHiringFilter, setUrgentHiringFilter] = useState("");
  const [jobPriorityFilter, setJobPriorityFilter] = useState("");

  const { setIsLoading, setManualLoading } = useLoader();
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = " http://localhost:5000/api";
  const jobsPerLoad = 10;
  const observerRef = useRef(null);
  const MIN_SEARCH_LENGTH = 2;

  useEffect(() => {
    const filters = location.state || {};
    setFilterType(filters.filterType || "");
    setFilterExperience(filters.filterExperience || "");
    setWorkLocation(filters.workLocation || "");
    setDatePosted(filters.datePosted || "");
    setCompanySize(filters.companySize || "");
    setMinSalary(filters.minSalary || "");
    setMaxSalary(filters.maxSalary || "");
    setSortSalary(filters.sortSalary || "");
    setSkillsFilter(filters.skillsFilter || "");
    setCityFilter(filters.cityFilter || "");
    setJobRoleFilter(filters.jobRoleFilter || "");
    setHiringMultipleFilter(filters.hiringMultipleFilter || "");
    setUrgentHiringFilter(filters.urgentHiringFilter || "");
    setJobPriorityFilter(filters.jobPriorityFilter || "");
  }, [location.state]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setManualLoading(false);
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jobs`, { timeout: 10000 });
      if (!Array.isArray(response.data)) throw new Error("Invalid job data format");
      const shuffledJobs = response.data.sort(() => Math.random() - 0.5);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAllJobs(shuffledJobs);
      setFilteredJobs(shuffledJobs);
      setDisplayedJobs(shuffledJobs.slice(0, jobsPerLoad));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch jobs.");
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
      setManualLoading(false);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);

  const loadMoreJobs = useCallback(() => {
    if (isFetchingMore || displayedJobs.length >= filteredJobs.length) return;
    setIsFetchingMore(true);
    setManualLoading(true);
    setTimeout(() => {
      const nextJobs = filteredJobs.slice(displayedJobs.length, displayedJobs.length + jobsPerLoad);
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

  const parseSalaryRange = useCallback((min, max) => {
    const minVal = parseFloat(min) || 0;
    const maxVal = parseFloat(max) || minVal;
    return { min: minVal, max: Math.max(minVal, maxVal) };
  }, []);

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
          (!hiringMultipleFilter || (hiringMultipleFilter === "yes" ? job.hiring_multiple === 1 : job.hiring_multiple === 0)) &&
          (!urgentHiringFilter || (urgentHiringFilter === "yes" ? job.urgent_hiring === 1 : job.urgent_hiring === 0)) &&
          (!jobPriorityFilter || job.job_priority.toLowerCase() === jobPriorityFilter.toLowerCase())
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
      setDisplayedJobs(filtered.slice(0, jobsPerLoad));
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

  useEffect(() => {
    if (searchTitle && searchTitle.length >= MIN_SEARCH_LENGTH) {
      const jobTitlesAndCompanies = [...new Set(allJobs.map((job) => [job.title, job.company]).flat())];
      const filteredSuggestions = jobTitlesAndCompanies
        .filter((item) => item && item.toLowerCase().includes(searchTitle.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTitle, allJobs]);

  const handleSearch = () => {
    if (searchTitle.length < MIN_SEARCH_LENGTH) {
      alert(`Please enter at least ${MIN_SEARCH_LENGTH} characters to search.`);
      return;
    }
    setSearchQuery(searchTitle);
    setSuggestions([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTitle(suggestion);
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  const handleClearSearch = () => {
    setSearchTitle("");
    setSearchQuery("");
    setSuggestions([]);
  };

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

  const handleResetFilters = () => {
    setSearchTitle("");
    setSearchQuery("");
    setFilterType("");
    setSortSalary("");
    setFilterExperience("");
    setMinSalary("");
    setMaxSalary("");
    setWorkLocation("");
    setDatePosted("");
    setCompanySize("");
    setSkillsFilter("");
    setCityFilter("");
    setJobRoleFilter("");
    setHiringMultipleFilter("");
    setUrgentHiringFilter("");
    setJobPriorityFilter("");
    setSuggestions([]);
    fetchJobs();
  };

  const handleJobClick = (jobId) => {
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
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleMobileNumberSubmit = () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    alert(`App link sent to ${mobileNumber}`);
    setMobileNumber("");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col lg:hidden">
      {/* Header */}
      <header className="bg-white shadow-md p-2 sm:p-3 md:p-4 sticky top-0 left-0 z-10 border-b border-gray-200 w-full">
        <div className="w-full mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex flex-row items-center justify-start gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={() => navigate("/filters")}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm md:text-base font-medium transition-all hover:bg-gray-50"
            >
              <FilterIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-black shrink-0" />
              <span className="font-medium">Filters</span>
            </button>
            <div className="relative flex-grow w-full max-w-[calc(100%-70px)] sm:max-w-[calc(100%-90px)] md:max-w-[calc(100%-110px)]">
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search jobs here"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-1.5 sm:p-2 md:p-2.5 pl-6 sm:pl-8 md:pl-10 pr-6 sm:pr-8 md:pr-10 border border-gray-300 rounded-l-md bg-white shadow-sm focus:ring-1 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm md:text-base text-gray-500 placeholder-gray-400 outline-none transition-all"
                  />
                  <svg
                    className="absolute left-1.5 sm:left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTitle && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-1.5 sm:right-2 md:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-full h-full"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-10 max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  className="p-1.5 sm:p-2 md:p-2.5 bg-white text-white rounded-r-md shadow-sm hover:bg-gray-100 transition-colors relative"
                  disabled={isSearching}
                >
                  {isSearching ? <Loader /> : <SearchIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="max-w-full mx-auto py-3 sm:py-4 md:py-6 px-2 sm:px-3 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {/* Jobs List */}
          <main className="md:col-span-1">
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
                  <p className="text-gray-700 text-[0.65rem] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4">No jobs match your criteria.</p>
                </div>
              )}
            </div>
            {displayedJobs.length < filteredJobs.length && !isSearching && (
              <div ref={observerRef} className="py-2 sm:py-3 md:py-4 flex justify-center">
                {isFetchingMore ? <Loader /> : null}
              </div>
            )}
            {displayedJobs.length === filteredJobs.length && filteredJobs.length > 0 && !isSearching && (
              <div className="py-2 sm:py-3 md:py-4 text-center text-[0.65rem] sm:text-xs md:text-sm text-gray-600 flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5">
                <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#008080]" />
                You've reached the end of the list.
              </div>
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