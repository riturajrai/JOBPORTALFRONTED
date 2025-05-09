import { memo, useState } from "react";
import { ChevronDownIcon } from "../assets/Icons"; // Adjust import path as needed

const FilterSection = memo(
  ({
    filterType,
    setFilterType,
    filterExperience,
    setFilterExperience,
    workLocation,
    setWorkLocation,
    datePosted,
    setDatePosted,
    minSalary,
    setMinSalary,
    maxSalary,
    setMaxSalary,
    sortSalary,
    setSortSalary,
    skillsFilter,
    setSkillsFilter,
    cityFilter,
    setCityFilter,
    jobRoleFilter,
    setJobRoleFilter,
    hiringMultipleFilter,        // New
    setHiringMultipleFilter,     // New
    urgentHiringFilter,          // New
    setUrgentHiringFilter,       // New
    jobPriorityFilter,           // New
    setJobPriorityFilter,        // New
    isCityOpen,
    setIsCityOpen,
    isJobRoleOpen,
    setIsJobRoleOpen,
    activeFiltersCount,
    handleResetFilters,
    onApply,
  }) => {
    const [activeTab, setActiveTab] = useState("City"); // State to manage active tab

    // Tab content for City
    const cityOptions = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Chennai",
      "Kolkata",
      "Pune",
      "Ahmedabad",
      "Bhopal",
    ];

    // Tab content for Job Role
    const jobRoleOptions = [
      "Field Sales",
      "Telesales / Telemarketing",
      "Customer Support / TeleCaller",
      "Sales / Business Development",
      "Digital Marketing",
      "Marketing",
    ];

    return (
      <div className="space-y-10 border-t border-[#f2f2f2]">
        {/* Mobile Filter Section (Tabs on Left, Content on Right) */}
        <div className="sm:hidden h-screen grid grid-cols-2 gap-x-5 absolute left-0">
          <div className="flex flex-col gap-y-6 w-[110px] bg-gray-100 border-b border-black border-r border-gray-200 p-2 ml-0 text-left">
            {[
              "Sort By",
              "Date Posted",
              "Distance",
              "Salary",
              "Work Type",
              "Work Shift",
              "Hiring Multiple",  // New
              "Urgent Hiring",    // New
              "Job Priority",     // New
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full py-2 text-sm text-left whitespace-nowrap ${
                  activeTab === tab
                    ? "text-[#008080] border-b-2 border-[#008080]"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="py-5 relative left-0 bg-white">
           
            {activeTab === "Sort By" && (
              <div className="space-y-10">
                {[
                  { value: "", label: "Relevant" },
                  { value: "new", label: "Date posted - New to Old" },
                  { value: "desc", label: "Salary - High to low" },
                  { value: "distance", label: "Distance - Near to far" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 relative left-[-70px]">
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

            {activeTab === "Date Posted" && (
              <div className="space-y-10">
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

            {activeTab === "Distance" && (
              <div className="space-y-10">
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

            {activeTab === "Salary" && (
              <div className="space-y-10">
                {[
                  { value: "5000", label: "More than ₹5000" },
                  { value: "10000", label: "More than ₹10000" },
                  { value: "20000", label: "More than ₹20000" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 relative left-[-30px]">
                    <input
                      type="radio"
                      name="minSalary"
                      checked={minSalary === option.value}
                      onChange={() => setMinSalary(option.value)}
                      className="form-radio text-[#008080] focus:ring-[#008080]"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {activeTab === "Work Type" && (
              <div className="space-y-10">
                {["Full time", "Part time", "Internship"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterType === type}
                      onChange={() =>
                        setFilterType(filterType === type ? "" : type)
                      }
                      className="form-checkbox text-[#008080] rounded focus:ring-[#008080]"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            )}

            {activeTab === "Work Shift" && (
              <div className="space-y-10">
                {["Day shift", "Night shift"].map((shift) => (
                  <label key={shift} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={workLocation === shift}
                      onChange={() =>
                        setWorkLocation(workLocation === shift ? "" : shift)
                      }
                      className="form-checkbox text-[#008080] rounded focus:ring-[#008080]"
                    />
                    <span className="text-sm text-gray-700">{shift}</span>
                  </label>
                ))}
              </div>
            )}

            {/* New Case 5 Filters */}
            {activeTab === "Hiring Multiple" && (
              <div className="space-y-10">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hiringMultipleFilter === "yes"}
                    onChange={(e) => setHiringMultipleFilter(e.target.checked ? "yes" : "")}
                    className="form-checkbox text-[#008080] rounded focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
              </div>
            )}

            {activeTab === "Urgent Hiring" && (
              <div className="space-y-10">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={urgentHiringFilter === "yes"}
                    onChange={(e) => setUrgentHiringFilter(e.target.checked ? "yes" : "")}
                    className="form-checkbox text-[#008080] rounded focus:ring-[#008080]"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
              </div>
            )}

            {activeTab === "Job Priority" && (
              <div className="space-y-10">
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
      </div>
    );
  }
);

export default FilterSection;