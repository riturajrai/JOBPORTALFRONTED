import { memo, useState } from "react";

const DesktopFilters = ({
  filterType,
  setFilterType,
  sortSalary,
  setSortSalary,
  filterExperience,
  setFilterExperience,
  minSalary,
  setMinSalary,
  maxSalary,
  setMaxSalary,
  workLocation,
  setWorkLocation,
  datePosted,
  setDatePosted,
  companySize,
  setCompanySize,
  skillsFilter,
  setSkillsFilter,
  cityFilter,
  setCityFilter,
  jobRoleFilter,
  setJobRoleFilter,
  hiringMultipleFilter,
  setHiringMultipleFilter,
  urgentHiringFilter,
  setUrgentHiringFilter,
  jobPriorityFilter,
  setJobPriorityFilter,
  activeFiltersCount,
}) => {
  const SalaryRange = ({ minSalary, setMinSalary, maxSalary, setMaxSalary }) => {
    const minRange = 0;
    const maxRange = 150000;
    const step = 5000;

    const handleMinChange = (e) => {
      const value = Math.min(Number(e.target.value), maxSalary - step);
      setMinSalary(value);
    };

    const handleMaxChange = (e) => {
      const value = Math.max(Number(e.target.value), minSalary + step);
      setMaxSalary(value);
    };

    const minPercent = ((minSalary - minRange) / (maxRange - minRange)) * 100;
    const maxPercent = ((maxSalary - minRange) / (maxRange - minRange)) * 100;

    const formatSalary = (value) => {
      if (value >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
      }
      return `₹${(value / 1000).toFixed(0)}K`;
    };

    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>{formatSalary(minSalary)}</span>
          <span>{formatSalary(maxSalary)}</span>
        </div>

        <div className="relative h-2 mt-6">
          <div className="absolute w-full h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2" />
          <div
            className="absolute h-1 bg-[#008080] rounded-full top-1/2 -translate-y-1/2 transition-all duration-150 ease-out"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
          <input
            type="range"
            min={minRange}
            max={maxRange}
            step={step}
            value={minSalary}
            onChange={handleMinChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
            aria-label="Minimum salary range"
          />
          <input
            type="range"
            min={minRange}
            max={maxRange}
            step={step}
            value={maxSalary}
            onChange={handleMaxChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
            aria-label="Maximum salary range"
          />
        </div>

        <div className="flex justify-between text-xs text-gray-600">
          <span>₹0</span>
          <span>₹1.5L</span>
        </div>

        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #008080;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.1s ease-out;
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }

          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #008080;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.1s ease-out;
          }

          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
          }

          input[type="range"]::-webkit-slider-runnable-track {
            background: transparent;
          }

          input[type="range"]::-moz-range-track {
            background: transparent;
          }
        `}</style>
      </div>
    );
  };

  const DownArrow = () => (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );

  const UpArrow = () => (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
    </svg>
  );

  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    date: true,
    distance: true,
    salary: true,
    workType: true,
    workShift: true,
    hiringMultiple: true,
    urgentHiring: true,
    jobPriority: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="hidden lg:block h-[1350px] lg:col-span-3 bg-white p-4 sm:p-6 rounded-lg shadow-sm sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">
          Filters {activeFiltersCount > 0 && <span>({activeFiltersCount})</span>}
        </h3>
      </div>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("sort")}
          >
            Sort By {expandedSections.sort ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.sort && (
            <div className="space-y-2">
              {[
                { value: "", label: "Relevant" },
                { value: "new", label: "Date posted - New to Old" },
                { value: "desc", label: "Salary - High to low" },
                { value: "distance", label: "Distance - Near to far" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortSalary === option.value}
                    onChange={() => setSortSalary(option.value)}
                    className="form-radio text-[#008080] focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("date")}
          >
            Date Posted {expandedSections.date ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.date && (
            <div className="space-y-2">
              {[
                { value: "", label: "All" },
                { value: "24h", label: "Last 24 hours" },
                { value: "3d", label: "Last 3 days" },
                { value: "7d", label: "Last 7 days" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="datePosted"
                    checked={datePosted === option.value}
                    onChange={() => setDatePosted(option.value)}
                    className="form-radio text-[#008080] focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("distance")}
          >
            Distance {expandedSections.distance ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.distance && (
            <div className="space-y-2">
              {[
                { value: "", label: "All" },
                { value: "5km", label: "Within 5 km" },
                { value: "10km", label: "Within 10 km" },
                { value: "20km", label: "Within 20 km" },
                { value: "50km", label: "Within 50 km" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="distance"
                    checked={workLocation === option.value}
                    onChange={() => setWorkLocation(option.value)}
                    className="form-radio text-[#008080] focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("salary")}
          >
            Salary {expandedSections.salary ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.salary && (
            <SalaryRange
              minSalary={minSalary}
              setMinSalary={setMinSalary}
              maxSalary={maxSalary}
              setMaxSalary={setMaxSalary}
            />
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("workType")}
          >
            Work Type {expandedSections.workType ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.workType && (
            <div className="space-y-2">
              {[
                { value: "", label: "All" },
                { value: "Full time", label: "Full time" },
                { value: "Part time", label: "Part time" },
                { value: "Internship", label: "Internship" },
              ].map((type) => (
                <label key={type.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="workType"
                    checked={filterType === type.value}
                    onChange={() => setFilterType(type.value)}
                    className="form-radio text-[#008080] focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("workShift")}
          >
            Work Shift {expandedSections.workShift ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.workShift && (
            <div className="space-y-2">
              {[
                { value: "", label: "All" },
                { value: "Day shift", label: "Day shift" },
                { value: "Night shift", label: "Night shift" },
              ].map((shift) => (
                <label key={shift.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="workShift"
                    checked={workLocation === shift.value}
                    onChange={() => setWorkLocation(shift.value)}
                    className="form-radio text-[#008080] focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">{shift.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("hiringMultiple")}
          >
            Hiring Multiple {expandedSections.hiringMultiple ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.hiringMultiple && (
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hiringMultipleFilter === "yes"}
                  onChange={(e) => setHiringMultipleFilter(e.target.checked ? "yes" : "")}
                  className="form-checkbox text-[#008080] focus:ring-[#008080]"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("urgentHiring")}
          >
            Urgent Hiring {expandedSections.urgentHiring ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.urgentHiring && (
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={urgentHiringFilter === "yes"}
                  onChange={(e) => setUrgentHiringFilter(e.target.checked ? "yes" : "")}
                  className="form-checkbox text-[#008080] focus:ring-[#008080]"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h4
            className="text-sm font-semibold text-gray-900 uppercase mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("jobPriority")}
          >
            Job Priority {expandedSections.jobPriority ? <UpArrow /> : <DownArrow />}
          </h4>
          {expandedSections.jobPriority && (
            <div className="space-y-2">
              {[
                { value: "", label: "All" },
                { value: "Normal", label: "Normal" },
                { value: "High", label: "High" },
                { value: "Urgent", label: "Urgent" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="jobPriority"
                    checked={jobPriorityFilter === option.value}
                    onChange={() => setJobPriorityFilter(option.value)}
                    className="form-radio text-[#008080] focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default memo(DesktopFilters);