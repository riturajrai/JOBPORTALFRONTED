import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { SearchIcon, XIcon, CheckCircleIcon, BriefcaseIcon } from "../assets/Icons";
import JobCard from "./JobCard";
import JobDetails from "./JobDeatils";
import { formatField } from "../FilterComponentForMobile.jsx/Utils";
import { useLoader } from "../pages/LoaderContext";
import DesktopFilters from "../FilterComponentForMobile.jsx/DesktopFilters";
import Loader from "../pages/Loader";

const DesktopJobs = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hiringMultipleFilter, setHiringMultipleFilter] = useState("");
  const [urgentHiringFilter, setUrgentHiringFilter] = useState("");
  const [jobPriorityFilter, setJobPriorityFilter] = useState("");

  const { setIsLoading, setManualLoading } = useLoader();
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = "http://localhost:5000/api";
  const jobsPerPage = 10;
  const MIN_SEARCH_LENGTH = 0;

  const jobsListRef = useRef(null);
  const jobDetailsRef = useRef(null);

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
      setManualLoading(true);
      setLoading(true);
      console.log("Fetching jobs from:", `${API_BASE_URL}/jobs`);

      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}/jobs`, {
        timeout: 15000,
        headers: { "Content-Type": "application/json" },
      });

      const fetchDuration = (Date.now() - startTime) / 1000;
      console.log(`API fetch took ${fetchDuration} seconds`);

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid job data format");
      }

      const jobs = response.data;
      setAllJobs(jobs);
      setFilteredJobs(jobs);
      setDisplayedJobs(jobs.slice(0, jobsPerPage));
    } catch (err) {
      let errorMessage = "Failed to fetch jobs.";
      if (err.code === "ERR_NETWORK") {
        errorMessage = "Network error: Unable to connect to the server.";
      } else if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      }
      setError(errorMessage);
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
      const startIndex = (currentPage - 1) * jobsPerPage;
      const endIndex = startIndex + jobsPerPage;
      const newDisplayedJobs = filtered.slice(startIndex, endIndex);
      setDisplayedJobs(newDisplayedJobs);

      // Select the top job if none is selected or the current selection is invalid
      if (newDisplayedJobs.length > 0 && (!selectedJobId || !newDisplayedJobs.some((job) => job.id === selectedJobId))) {
        setSelectedJobId(newDisplayedJobs[0].id);
        setIsJobDetailsLoading(true);
        setTimeout(() => {
          setIsJobDetailsLoading(false);
          if (jobDetailsRef.current) {
            const offset = -50; // Adjusted for better visibility
            const top = jobDetailsRef.current.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({
              top,
              behavior: "smooth",
            });
          }
        }, 100);
      } else if (filtered.length === 0) {
        setSelectedJobId(null); // Clear selection if no jobs match
      }

      setIsSearching(false);
      setManualLoading(false);
    }, 500); // Reduced delay for faster response
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
    currentPage,
    selectedJobId,
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
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTitle("");
    setSearchQuery("");
    setSuggestions([]);
    setCurrentPage(1);
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
    setCurrentPage(1);
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
    setTimeout(() => {
      if (jobDetailsRef.current) {
        const offset = -50;
        const top = jobDetailsRef.current.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({
          top,
          behavior: "smooth",
        });
      }
      setIsJobDetailsLoading(false);
    }, 100);
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

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    if (currentPage < totalPages) {
      setManualLoading(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setManualLoading(false);
        if (jobsListRef.current) {
          jobsListRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 1000);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setManualLoading(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setManualLoading(false);
        if (jobsListRef.current) {
          jobsListRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col hidden md:block">
      <header className="bg-white shadow-md p-2 md:p-3 lg:p-4 sticky top-0 left-0 z-10 border-b border-gray-200 w-full">
        <div className="w-full mx-auto px-2 md:px-4 lg:px-6">
          <div className="flex flex-row items-center justify-center gap-2 md:gap-3 lg:gap-4">
            <div className="relative flex-grow-0 w-full max-w-md md:max-w-lg lg:max-w-xl">
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search jobs here"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-1.5 md:p-2 lg:p-2.5 pl-8 md:pl-9 lg:pl-10 pr-8 md:pr-9 lg:pr-10 border border-gray-300 rounded-l-md bg-white shadow-sm focus:ring-1 focus:ring-[#008080] focus:border-[#008080] text-xs md:text-sm lg:text-base text-gray-500 placeholder-gray-400 outline-none transition-all"
                  />
                  <svg
                    className="absolute left-2 md:left-2.5 lg:left-3 top-1/2 transform -translate-y-1/2 w-4 md:w-5 lg:w-5 h-4 md:h-5 lg:h-5 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTitle && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 md:right-2.5 lg:right-3 top-1/2 transform -translate-y-1/2 w-4 md:w-5 lg:w-5 h-4 md:h-5 lg:h-5 text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-4 md:w-5 lg:w-5 h-4 md:h-5 lg:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-10 max-h-48 md:max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-2 md:px-3 lg:px-4 py-1 md:py-2 text-xs md:text-sm lg:text-base text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  className="p-1.5 md:p-2 lg:p-2.5 bg-white text-white rounded-r-md shadow-sm hover:bg-gray-100 transition-colors relative"
                  disabled={isSearching}
                >
                  {isSearching ? <Loader /> : <SearchIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow">
        <div className="max-w-full md:max-w-7xl mx-auto py-4 md:py-6 lg:py-8 px-2 md:px-4 lg:px-6 xl:px-8 grid grid-cols-12 gap-4 md:gap-6 lg:gap-8 h-[800px] md:h-[1000px]">
          <DesktopFilters
            filterType={filterType}
            setFilterType={setFilterType}
            sortSalary={sortSalary}
            setSortSalary={setSortSalary}
            filterExperience={filterExperience}
            setFilterExperience={setFilterExperience}
            minSalary={minSalary}
            setMinSalary={setMinSalary}
            maxSalary={maxSalary}
            setMaxSalary={setMaxSalary}
            workLocation={workLocation}
            setWorkLocation={setWorkLocation}
            datePosted={datePosted}
            setDatePosted={setDatePosted}
            companySize={companySize}
            setCompanySize={setCompanySize}
            skillsFilter={skillsFilter}
            setSkillsFilter={setSkillsFilter}
            cityFilter={cityFilter}
            setCityFilter={setCityFilter}
            jobRoleFilter={jobRoleFilter}
            setJobRoleFilter={setJobRoleFilter}
            hiringMultipleFilter={hiringMultipleFilter}
            setHiringMultipleFilter={setHiringMultipleFilter}
            urgentHiringFilter={urgentHiringFilter}
            setUrgentHiringFilter={setUrgentHiringFilter}
            jobPriorityFilter={jobPriorityFilter}
            setJobPriorityFilter={setJobPriorityFilter}
            activeFiltersCount={activeFiltersCount}
          />

          <main className="col-span-6 md:col-span-5" ref={jobsListRef}>
            <div className="mb-2 md:mb-4 lg:mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-3 lg:gap-4">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">
                  <BriefcaseIcon className="w-4 md:w-5 lg:w-5 h-4 md:h-5 lg:h-5 text-[#008080] inline-block mr-1 md:mr-2" />
                  Jobs for you
                </h2>
                <p className="text-xs md:text-sm lg:text-base text-gray-600">jobs based on your activity</p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs md:text-sm lg:text-base text-[#008080] font-medium hover:underline flex items-center gap-1"
                  >
                    <XIcon className="w-3 md:w-4 lg:w-4 h-3 md:h-4 lg:h-4" />
                    Reset Filters ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 lg:space-y-4">
              {loading || isSearching ? (
                <Loader />
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
                      isSelected={job.id === selectedJobId} // Highlight selected job
                    />
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-3 md:p-4 lg:p-6 rounded-lg shadow-sm text-center border border-gray-100">
                  <div className="flex justify-center mb-3 md:mb-4">
                    <svg
                      className="w-10 md:w-12 lg:w-12 h-10 md:h-12 lg:h-12 text-gray-400"
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
                  <p className="text-gray-700 text-xs md:text-sm lg:text-base mb-3 md:mb-4">No jobs match your criteria.</p>
                </div>
              )}
            </div>

            {!loading && displayedJobs.length > 0 && (
              <div className="py-3 md:py-4 lg:py-4 flex justify-between items-center">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-2 md:px-3 lg:px-4 py-1 md:py-2 rounded-md flex items-center gap-1 md:gap-2 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#008080] text-white hover:bg-teal-700"
                  }`}
                >
                  Previous
                </button>
                <span className="text-xs md:text-sm lg:text-base text-gray-600">
                  Page {currentPage} of {Math.ceil(filteredJobs.length / jobsPerPage)}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === Math.ceil(filteredJobs.length / jobsPerPage)}
                  className={`px-2 md:px-3 lg:px-4 py-1 md:py-2 rounded-md flex items-center gap-1 md:gap-2 ${
                    currentPage === Math.ceil(filteredJobs.length / jobsPerPage)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#008080] text-white hover:bg-teal-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </main>

          <div className="col-span-4" ref={jobDetailsRef}>
            {isJobDetailsLoading || loading ? (
              <Loader />
            ) : selectedJobId ? (
              <div className="bg-white rounded-xl shadow-md p-3 md:p-4 lg:p-6 mt-[8px] md:mt-[10px]">
                <JobDetails id={selectedJobId} key={selectedJobId} />
              </div>
            ) : (
              <div className="hidden md:block p-3 md:p-4 lg:p-6 bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-xs md:text-sm lg:text-base">Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DesktopJobs);