import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from "./JobCard";

const Job = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortSalary, setSortSalary] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayedJobsCount, setDisplayedJobsCount] = useState(10);
  const [isInfiniteScrollActive, setIsInfiniteScrollActive] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState({
    jobType: true,
    salary: true,
    experience: true,
    locationType: true,
    datePosted: true,
    companySize: true,
    skills: true,
  });

  const observerRef = useRef(null);
  const searchTitleRef = useRef(null);
  const jobsPerPage = 10;
  const navigate = useNavigate();
  const API_BASE_URL = "https://jobportalapi.up.railway.app/api";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const usertoken = localStorage.getItem("usertoken");
        const employertoken = localStorage.getItem("employertoken");
        const token = usertoken || employertoken;

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_BASE_URL}/jobs`, { headers, timeout: 10000 });

        if (!Array.isArray(response.data)) throw new Error("Invalid job data format");
        setJobs(response.data);
        setFilteredJobs(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch jobs.");
        console.error("Fetch jobs error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const parseSalaryRange = useCallback((salary) => {
    if (!salary) return { min: 0, max: 0 };
    if (typeof salary !== "string" || !salary.includes("-")) {
      const value = parseFloat(salary.replace(/[^0-9.]/g, "")) || 0;
      return { min: value, max: value };
    }
    const [minStr, maxStr] = salary.split("-").map((s) => s.trim().replace(/[^0-9.]/g, ""));
    const min = parseFloat(minStr) || 0;
    const max = parseFloat(maxStr) || min;
    return { min, max: Math.max(min, max) };
  }, []);

  const filterAndSortJobs = useCallback(
    debounce(() => {
      let filtered = [...jobs];
      filtered = filtered.filter((job) => {
        const salaryRange = parseSalaryRange(job.salary);
        const jobDate = new Date(job.date_posted);
        const now = new Date();
        const skills = Array.isArray(job.skills) ? job.skills : [];
        return (
          (!searchTitle || job.title?.toLowerCase().includes(searchTitle.toLowerCase())) &&
          (!searchLocation || job.location?.toLowerCase().includes(searchLocation.toLowerCase())) &&
          (!filterType || job.job_type?.toLowerCase() === filterType.toLowerCase()) &&
          (!filterExperience || job.experience === filterExperience) &&
          (!minSalary || salaryRange.max >= parseFloat(minSalary)) &&
          (!maxSalary || salaryRange.min <= parseFloat(maxSalary)) &&
          (!workLocation || job.work_location === workLocation) &&
          (!datePosted ||
            (datePosted === "24h" && now - jobDate <= 24 * 60 * 60 * 1000) ||
            (datePosted === "7d" && now - jobDate <= 7 * 24 * 60 * 60 * 1000) ||
            (datePosted === "30d" && now - jobDate <= 30 * 24 * 60 * 60 * 1000)) &&
          (!companySize || job.company_size === companySize) &&
          (!skillsFilter ||
            skills.some((skill) => skill?.toLowerCase().includes(skillsFilter.toLowerCase())))
        );
      });

      if (sortSalary) {
        filtered.sort((a, b) => {
          const aSalary = parseSalaryRange(a.salary).min;
          const bSalary = parseSalaryRange(b.salary).min;
          return sortSalary === "asc" ? aSalary - bSalary : bSalary - aSalary;
        });
      }

      setFilteredJobs(filtered);
      setDisplayedJobsCount(10);
      setIsInfiniteScrollActive(false);
    }, 300),
    [
      jobs,
      searchTitle,
      searchLocation,
      filterType,
      sortSalary,
      filterExperience,
      minSalary,
      maxSalary,
      workLocation,
      datePosted,
      companySize,
      skillsFilter,
    ]
  );

  useEffect(() => {
    filterAndSortJobs();
  }, [
    searchTitle,
    searchLocation,
    filterType,
    sortSalary,
    filterExperience,
    minSalary,
    maxSalary,
    workLocation,
    datePosted,
    companySize,
    skillsFilter,
    filterAndSortJobs,
  ]);

  useEffect(() => {
    if (searchTitle) {
      const jobTitles = [...new Set(jobs.map((job) => job.title))];
      const filteredSuggestions = jobTitles
        .filter((title) => title.toLowerCase().includes(searchTitle.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTitle, jobs]);

  const handleSearchSubmit = () => {
    if (searchTitle && !searchHistory.includes(searchTitle)) {
      setSearchHistory((prev) => [searchTitle, ...prev.slice(0, 4)]);
    }
    setIsSearchExpanded(false);
    filterAndSortJobs();
  };

  useEffect(() => {
    if (!isInfiniteScrollActive || displayedJobsCount >= filteredJobs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedJobsCount((prev) => Math.min(prev + jobsPerPage, filteredJobs.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [isInfiniteScrollActive, displayedJobsCount, filteredJobs.length]);

  const handleResetFilters = () => {
    setSearchTitle("");
    setSearchLocation("");
    setFilterType("");
    setSortSalary("");
    setFilterExperience("");
    setMinSalary("");
    setMaxSalary("");
    setWorkLocation("");
    setDatePosted("");
    setCompanySize("");
    setSkillsFilter("");
    setDisplayedJobsCount(10);
    setIsInfiniteScrollActive(false);
  };

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const handleViewMore = () => {
    setDisplayedJobsCount((prev) => Math.min(prev + jobsPerPage, filteredJobs.length));
    setIsInfiniteScrollActive(true);
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const currentJobs = filteredJobs.slice(0, displayedJobsCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {Array.from({ length: jobsPerPage }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-red-600 font-semibold text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const FilterSection = memo(() => (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilterSection("jobType")}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Job Type
          {expandedFilters.jobType ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedFilters.jobType && (
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          >
            <option value="">All</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>
        )}
      </div>
      {/* Other filter sections remain unchanged */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilterSection("salary")}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Salary
          {expandedFilters.salary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedFilters.salary && (
          <div className="space-y-3 mt-3">
            <select
              value={sortSalary}
              onChange={(e) => setSortSalary(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
            >
              <option value="">Default Sort</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Min Salary"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-1/2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
              />
              <input
                type="number"
                placeholder="Max Salary"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-1/2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilterSection("experience")}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Experience Level
          {expandedFilters.experience ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedFilters.experience && (
          <select
            value={filterExperience}
            onChange={(e) => setFilterExperience(e.target.value)}
            className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          >
            <option value="">All</option>
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
          </select>
        )}
      </div>
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilterSection("locationType")}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Location Type
          {expandedFilters.locationType ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedFilters.locationType && (
          <select
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
            className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          >
            <option value="">All</option>
            <option value="Remote">Remote</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        )}
      </div>
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilterSection("datePosted")}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Date Posted
          {expandedFilters.datePosted ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedFilters.datePosted && (
          <select
            value={datePosted}
            onChange={(e) => setDatePosted(e.target.value)}
            className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          >
            <option value="">Any Time</option>
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        )}
      </div>
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilterSection("companySize")}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Company Size
          {expandedFilters.companySize ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedFilters.companySize && (
          <select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          >
            <option value="">All</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501+">501+ employees</option>
          </select>
        )}
      </div>
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleFilterSection("skills")}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Skills
          {expandedFilters.skills ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedFilters.skills && (
          <input
            type="text"
            placeholder="e.g., JavaScript, Python"
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
            className="w-full mt-3 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
          />
        )}
      </div>
      <button
        onClick={handleResetFilters}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
      >
        Clear All Filters
      </button>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Search Header */}
      <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchTitleRef}
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onFocus={() => {
                  if (window.innerWidth < 1024) setIsSearchExpanded(true); // Only for sm/md (< lg)
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && window.innerWidth >= 1024) handleSearchSubmit(); // lg devices
                }}
                className="w-full p-4 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm transition-all duration-300"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="City, state, or zip code"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onFocus={() => {
                  if (window.innerWidth < 1024) setIsSearchExpanded(true); // Only for sm/md (< lg)
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && window.innerWidth >= 1024) handleSearchSubmit(); // lg devices
                }}
                className="w-full p-4 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm transition-all duration-300"
              />
              {/* Search Button for lg devices */}
              <button
                onClick={handleSearchSubmit}
                className="lg:absolute lg:right-2 lg:top-1/2 lg:transform lg:-translate-y-1/2 lg:bg-blue-600 lg:text-white lg:px-4 lg:py-1 lg:rounded-full lg:hover:bg-blue-700 lg:transition-all lg:duration-300 hidden lg:block"
              >
                Search
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="sm:hidden mt-4 text-blue-600 flex items-center gap-2 font-semibold hover:text-blue-700 transition-colors"
          >
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>
      </header>

      {/* Full Height Search Slide (sm/md only) */}
      <AnimatePresence>
        {isSearchExpanded && window.innerWidth < 1024 && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 p-6 flex flex-col shadow-2xl lg:hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Search Jobs</h2>
              <button onClick={() => setIsSearchExpanded(false)}>
                <X className="w-7 h-7 text-gray-600 hover:text-gray-800 transition-colors" />
              </button>
            </div>
            <div className="space-y-6 flex-grow">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
                  className="w-full p-4 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                  autoFocus
                />
                {suggestions.length > 0 && (
                  <div className="absolute w-full bg-white border border-gray-200 mt-2 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors"
                        onClick={() => {
                          setSearchTitle(suggestion);
                          handleSearchSubmit();
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="City, state, or zip code"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
                  className="w-full p-4 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                />
              </div>
              {searchHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Searches</h3>
                  <div className="space-y-3">
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
                        onClick={() => {
                          setSearchTitle(item);
                          handleSearchSubmit();
                        }}
                      >
                        <span className="text-sm text-gray-700">{item}</span>
                        <X
                          className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchHistory((prev) => prev.filter((_, i) => i !== index));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
            >
              Search Jobs
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-24 h-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Refine Your Search</h3>
          <FilterSection />
        </aside>

        {isFilterOpen && (
          <>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 sm:hidden bg-white rounded-t-xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <button onClick={() => setIsFilterOpen(false)} className="absolute top-6 right-6 text-gray-600">
                  <X className="w-7 h-7 hover:text-gray-800 transition-colors" />
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Refine Your Search</h3>
                <FilterSection />
              </div>
            </motion.div>
            <div
              className="fixed inset-0 bg-gray-800 bg-opacity-60 sm:hidden z-40"
              onClick={() => setIsFilterOpen(false)}
            />
          </>
        )}

        <main className="col-span-1 lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredJobs.length} {filteredJobs.length === 1 ? "Job" : "Jobs"} Found
            </h2>
            <span className="text-sm text-gray-600 font-medium">
              Showing {currentJobs.length} of {filteredJobs.length} jobs
            </span>
          </div>

          <div className="space-y-6">
            {currentJobs.length ? (
              currentJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleJobClick(job.id)}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-300"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === "Enter" && handleJobClick(job.id)}
                >
                  <JobCard job={job} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
                <p className="text-gray-600 text-lg">No jobs match your criteria.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {filteredJobs.length > displayedJobsCount && (
            <div className="text-center mt-8">
              <button
                onClick={handleViewMore}
                className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Load More Jobs
              </button>
            </div>
          )}

          {isInfiniteScrollActive && <div ref={observerRef} className="h-12" />}
        </main>
      </div>
    </div>
  );
};

export default memo(Job);