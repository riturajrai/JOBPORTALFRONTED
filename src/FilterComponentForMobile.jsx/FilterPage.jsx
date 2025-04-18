import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterSection from "./FilterSection"; // Adjust import path
import { BackArrowIcon } from "../assets/Icons"; // Adjust import path
import Loader from "../pages/Loader";

const FilterPage = () => {
  const [filterType, setFilterType] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sortSalary, setSortSalary] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("");
  const [hiringMultipleFilter, setHiringMultipleFilter] = useState("");  // New
  const [urgentHiringFilter, setUrgentHiringFilter] = useState("");      // New
  const [jobPriorityFilter, setJobPriorityFilter] = useState("");        // New
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isJobRoleOpen, setIsJobRoleOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const navigate = useNavigate();

  const handleResetFilters = () => {
    setFilterType("");
    setFilterExperience("");
    setWorkLocation("");
    setDatePosted("");
    setCompanySize("");
    setMinSalary("");
    setMaxSalary("");
    setSortSalary("");
    setSkillsFilter("");
    setCityFilter("");
    setJobRoleFilter("");
    setHiringMultipleFilter("");  // New
    setUrgentHiringFilter("");    // New
    setJobPriorityFilter("");     // New
    setActiveFiltersCount(0);     // Reset filter count
  };

  const handleApplyFilters = () => {
    // Calculate active filters count
    let count = 0;
    if (filterType) count++;
    if (filterExperience) count++;
    if (workLocation) count++;
    if (datePosted) count++;
    if (companySize) count++;
    if (minSalary) count++;
    if (maxSalary) count++;
    if (sortSalary) count++;
    if (skillsFilter) count++;
    if (cityFilter) count++;
    if (jobRoleFilter) count++;
    if (hiringMultipleFilter) count++;  // New
    if (urgentHiringFilter) count++;    // New
    if (jobPriorityFilter) count++;     // New
    setActiveFiltersCount(count);

    navigate("/jobs", {
      state: {
        filterType,
        filterExperience,
        workLocation,
        datePosted,
        companySize,
        minSalary,
        maxSalary,
        sortSalary,
        skillsFilter,
        cityFilter,
        jobRoleFilter,
        hiringMultipleFilter,  // New
        urgentHiringFilter,    // New
        jobPriorityFilter,     // New
      },
    });
  };

  return (
    <div className="h-screen bg-white font-inter p-4 sm:hidden flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/jobs")} aria-label="Go back">
              <BackArrowIcon />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-sm text-[#008080] font-medium hover:underline"
          >
            Clear All {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
          <FilterSection
            filterType={filterType}
            setFilterType={setFilterType}
            filterExperience={filterExperience}
            setFilterExperience={setFilterExperience}
            workLocation={workLocation}
            setWorkLocation={setWorkLocation}
            datePosted={datePosted}
            setDatePosted={setDatePosted}
            minSalary={minSalary}
            setMinSalary={setMinSalary}
            maxSalary={maxSalary}
            setMaxSalary={setMaxSalary}
            sortSalary={sortSalary}
            setSortSalary={setSortSalary}
            skillsFilter={skillsFilter}
            setSkillsFilter={setSkillsFilter}
            cityFilter={cityFilter}
            setCityFilter={setCityFilter}
            jobRoleFilter={jobRoleFilter}
            setJobRoleFilter={setJobRoleFilter}
            hiringMultipleFilter={hiringMultipleFilter}  // New
            setHiringMultipleFilter={setHiringMultipleFilter}  // New
            urgentHiringFilter={urgentHiringFilter}      // New
            setUrgentHiringFilter={setUrgentHiringFilter}      // New
            jobPriorityFilter={jobPriorityFilter}        // New
            setJobPriorityFilter={setJobPriorityFilter}        // New
            isCityOpen={isCityOpen}
            setIsCityOpen={setIsCityOpen}
            isJobRoleOpen={isJobRoleOpen}
            setIsJobRoleOpen={setIsJobRoleOpen}
            activeFiltersCount={activeFiltersCount}
            handleResetFilters={handleResetFilters}
            onApply={handleApplyFilters}  // Pass apply function
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleApplyFilters}
          style={{ zIndex: 10000 }}
          className="bg-[#008080] relative bottom-[50px] text-white px-6 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-[#006666] transition-colors">
          Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      </div>
    </div>
  );
};

export default FilterPage;