import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { saveAs } from "file-saver";
import debounce from "lodash/debounce";
import { DollarSign, Filter, Download, X, Info, ChevronDown, Plus, Minus } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Salaries = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    jobRole: "",
    experience: "",
    location: "",
    companySize: "",
    employmentType: "",
    minSalary: "",
    maxSalary: "",
    sortBy: "median",
  });
  const [calculator, setCalculator] = useState({ jobRole: "", experience: "", location: "" });
  const [estimatedSalary, setEstimatedSalary] = useState(null);
  const [compareRoles, setCompareRoles] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const API_BASE_URL = "https://jobporatl.onrender.com/api/jobs";

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL, {
        headers: { "Content-Type": "application/json" },
      });
      setJobs(response.data);
    } catch (error) {
      setError("Error fetching salary data. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const parseSalaryRange = (minSalary, maxSalary) => {
    const min = parseFloat(minSalary) || 0;
    const max = parseFloat(maxSalary) || min;
    return { min, max };
  };

  const getSalaryInsights = () => {
    const filteredJobs = jobs.filter((job) => {
      const { min, max } = parseSalaryRange(job.salary_min, job.salary_max);
      return (
        (!filters.jobRole || job.title.toLowerCase().includes(filters.jobRole.toLowerCase())) &&
        (!filters.experience || job.experience === filters.experience) &&
        (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
        (!filters.companySize || job.company_size === filters.companySize) &&
        (!filters.employmentType || job.job_type === filters.employmentType) &&
        (!filters.minSalary || min >= parseFloat(filters.minSalary)) &&
        (!filters.maxSalary || max <= parseFloat(filters.maxSalary))
      );
    });

    const salaryData = filteredJobs.map((job) => {
      const { min, max } = parseSalaryRange(job.salary_min, job.salary_max);
      return { ...job, minSalary: min, maxSalary: max, medianSalary: (min + max) / 2 };
    });

    salaryData.sort((a, b) => {
      if (filters.sortBy === "highest") return b.maxSalary - a.maxSalary;
      if (filters.sortBy === "lowest") return a.minSalary - b.minSalary;
      return b.medianSalary - a.medianSalary;
    });

    return salaryData;
  };

  const getChartData = () => {
    const insights = getSalaryInsights().slice(0, 10);
    const labels = insights.map((job) => job.title.slice(0, 20) + (job.title.length > 20 ? "..." : ""));
    const medianSalaries = insights.map((job) => job.medianSalary);

    return {
      labels,
      datasets: [
        {
          label: "Median Salary (₹)",
          data: medianSalaries,
          backgroundColor: "rgba(45, 212, 191, 0.6)", // Teal-300
          borderColor: "rgba(45, 212, 191, 1)",
          borderWidth: 1,
        },
        ...(compareRoles.length > 0
          ? [
              {
                label: "Comparison Salary (₹)",
                data: compareRoles.slice(0, 10).map((role) => role.medianSalary),
                backgroundColor: "rgba(6, 182, 212, 0.6)", // Cyan-500
                borderColor: "rgba(6, 182, 212, 1)",
                borderWidth: 1,
              },
            ]
          : []),
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 14, family: "Inter" } } },
      title: { display: true, text: "Salary Trends by Job Role", font: { size: 20, weight: "bold", family: "Inter" } },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14, family: "Inter" },
        bodyFont: { size: 12, family: "Inter" },
        callbacks: { label: (context) => `₹${context.raw.toLocaleString()}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Salary (₹)", font: { size: 14, family: "Inter" } },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      x: {
        title: { display: true, text: "Job Role", font: { size: 14, family: "Inter" } },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, font: { size: 12, family: "Inter" } },
        grid: { display: false },
      },
    },
  };

  const calculateSalary = () => {
    const relevantJobs = jobs.filter((job) => {
      const { min, max } = parseSalaryRange(job.salary_min, job.salary_max);
      return (
        (!calculator.jobRole || job.title.toLowerCase().includes(calculator.jobRole.toLowerCase())) &&
        (!calculator.experience || job.experience === calculator.experience) &&
        (!calculator.location || job.location.toLowerCase().includes(calculator.location.toLowerCase()))
      );
    });

    if (relevantJobs.length === 0) {
      setEstimatedSalary("No data available for this combination.");
      return;
    }

    const salaries = relevantJobs.map((job) => {
      const { min, max } = parseSalaryRange(job.salary_min, job.salary_max);
      return (min + max) / 2;
    });
    const average = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    const percentile25 = salaries.sort((a, b) => a - b)[Math.floor(salaries.length * 0.25)] || average;
    const percentile75 = salaries.sort((a, b) => a - b)[Math.floor(salaries.length * 0.75)] || average;

    setEstimatedSalary({
      average: average.toLocaleString(),
      range: `${percentile25.toLocaleString()} - ${percentile75.toLocaleString()}`,
      count: relevantJobs.length,
    });
  };

  const debouncedFilterChange = debounce((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, 300);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    debouncedFilterChange(name, value);
  };

  const handleCalculatorChange = (e) => {
    const { name, value } = e.target;
    setCalculator((prev) => ({ ...prev, [name]: value }));
  };

  const addToComparison = (job) => {
    if (!compareRoles.some((r) => r.id === job.id)) {
      setCompareRoles([...compareRoles, { ...job, medianSalary: (job.minSalary + job.maxSalary) / 2 }]);
    }
  };

  const removeFromComparison = (jobId) => {
    setCompareRoles(compareRoles.filter((role) => role.id !== jobId));
  };

  const exportToCSV = () => {
    const insights = getSalaryInsights();
    const csv = [
      "Job Role,Experience,Location,Company Size,Employment Type,Salary Range,Median Salary",
      ...insights.map((job) =>
        `"${job.title.replace(/"/g, '""')}",${job.experience || "N/A"},${job.location || "N/A"},${job.company_size || "N/A"},${job.job_type || "N/A"},${job.salary_min} - ${job.salary_max},${job.medianSalary.toLocaleString()}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "salary_insights.csv");
  };

  const resetFilters = () => {
    setFilters({
      jobRole: "",
      experience: "",
      location: "",
      companySize: "",
      employmentType: "",
      minSalary: "",
      maxSalary: "",
      sortBy: "median",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Shimmer Header */}
          <div className="text-center mb-12 animate-pulse">
            <div className="h-10 sm:h-12 w-3/4 mx-auto bg-gray-200 rounded"></div>
            <div className="mt-4 h-5 w-1/2 mx-auto bg-gray-200 rounded"></div>
          </div>

          <div className="space-y-8">
            {/* Shimmer Filters Section */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 rounded mb-5"></div>
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shimmer Salary Insights */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-pulse">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="h-5 w-1/4 bg-gray-200 rounded"></div>
                    <div className="h-5 w-1/6 bg-gray-200 rounded"></div>
                    <div className="h-5 w-1/6 bg-gray-200 rounded"></div>
                    <div className="h-5 w-1/6 bg-gray-200 rounded"></div>
                    <div className="h-5 w-1/6 bg-gray-200 rounded"></div>
                    <div className="h-5 w-1/12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shimmer Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-[400px] animate-pulse">
              <div className="h-full w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-gray-50 min-h-screen">
        <p className="text-red-600 text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
          <Info className="w-6 h-6" /> {error}
        </p>
        <button
          onClick={fetchJobs}
          className="bg-gradient-to-r from-teal-300 to-cyan-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition-all duration-200 shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  const salaryInsights = getSalaryInsights();

  const FilterSection = () => (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-teal-600" /> Job Role
        </label>
        <input
          type="text"
          name="jobRole"
          value={filters.jobRole}
          onChange={handleFilterChange}
          placeholder="e.g., Software Engineer"
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Experience</label>
        <div className="relative">
          <select
            name="experience"
            value={filters.experience}
            onChange={handleFilterChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200 appearance-none"
          >
            <option value="">All Levels</option>
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          placeholder="e.g., New York"
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Company Size</label>
        <div className="relative">
          <select
            name="companySize"
            value={filters.companySize}
            onChange={handleFilterChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200 appearance-none"
          >
            <option value="">All Sizes</option>
            <option value="1-50">1-50</option>
            <option value="51-200">51-200</option>
            <option value="201+">201+</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Employment Type</label>
        <div className="relative">
          <select
            name="employmentType"
            value={filters.employmentType}
            onChange={handleFilterChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200 appearance-none"
          >
            <option value="">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Min Salary (₹)</label>
          <input
            type="number"
            name="minSalary"
            value={filters.minSalary}
            onChange={handleFilterChange}
            placeholder="e.g., 500000"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Max Salary (₹)</label>
          <input
            type="number"
            name="maxSalary"
            value={filters.maxSalary}
            onChange={handleFilterChange}
            placeholder="e.g., 1500000"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Sort By</label>
        <div className="relative">
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200 appearance-none"
          >
            <option value="median">Median Salary</option>
            <option value="highest">Highest Salary</option>
            <option value="lowest">Lowest Salary</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      <button
        onClick={resetFilters}
        className="w-full py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-all duration-200 shadow-sm"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">Salary Insights</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore salary trends, compare roles, and estimate your earning potential with real-time data.
          </p>
        </div>

        {/* Filters Section */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-teal-600" /> Filter Salary Data
            </h2>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden bg-teal-50 text-teal-700 border border-teal-200 py-2 px-4 rounded-full flex items-center gap-2 hover:bg-teal-100 transition-all duration-200 shadow-md"
            >
              <Filter className="w-5 h-5" /> Filters
            </button>
          </div>
          <div className="hidden lg:block">
            <FilterSection />
          </div>
        </section>

        {/* Salary Insights */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" /> Salary Insights ({salaryInsights.length})
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={exportToCSV}
                className="bg-teal-50 text-teal-700 border border-teal-200 py-2 px-4 rounded-full flex items-center gap-2 hover:bg-teal-100 transition-all duration-200 shadow-md"
              >
                <Download className="w-5 h-5" /> Export CSV
              </button>
            </div>
          </div>
          {salaryInsights.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Job Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Salary Range (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Median (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salaryInsights.slice(0, 10).map((job, index) => (
                    <tr key={job.id} className={`transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-teal-50`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-xs" title={job.title}>{job.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.experience || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.location || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">₹{job.medianSalary.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => addToComparison(job)}
                          className={`${
                            compareRoles.some((r) => r.id === job.id)
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-teal-600 hover:text-teal-800"
                          } font-medium transition-colors duration-200 flex items-center gap-1`}
                          disabled={compareRoles.some((r) => r.id === job.id)}
                        >
                          <Plus size={16} /> {compareRoles.some((r) => r.id === job.id) ? "Added" : "Compare"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-6">No data matches your filters.</p>
          )}
        </section>

        {/* Comparison Section */}
        {compareRoles.length > 0 && (
          <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Compared Roles ({compareRoles.length})</h2>
            <div className="space-y-4">
              {compareRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex justify-between items-center p-4 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition-all duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{role.title}</p>
                    <p className="text-sm text-gray-600">₹{role.medianSalary.toLocaleString()} (Median)</p>
                  </div>
                  <button
                    onClick={() => removeFromComparison(role.id)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Chart */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 h-[400px]">
          <Bar data={getChartData()} options={chartOptions} />
        </section>

        {/* Salary Calculator */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" /> Salary Calculator
            </h2>
            <button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className="lg:hidden text-teal-600 hover:text-teal-800 transition-colors duration-200"
            >
              {isCalculatorOpen ? <ChevronDown size={24} /> : <ChevronDown size={24} className="rotate-180" />}
            </button>
          </div>
          <div className={`${isCalculatorOpen || "hidden lg:block"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Job Role</label>
                <input
                  type="text"
                  name="jobRole"
                  value={calculator.jobRole}
                  onChange={handleCalculatorChange}
                  placeholder="e.g., Software Engineer"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
                <div className="relative">
                  <select
                    name="experience"
                    value={calculator.experience}
                    onChange={handleCalculatorChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200 appearance-none"
                  >
                    <option value="">Select Experience</option>
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <input
                  type="text"
                  name="location"
                  value={calculator.location}
                  onChange={handleCalculatorChange}
                  placeholder="e.g., New York"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all duration-200"
                />
              </div>
            </div>
            <button
              onClick={calculateSalary}
              className="mt-6 w-full bg-gradient-to-r from-teal-300 to-cyan-500 text-white py-3 rounded-full hover:bg-teal-600 transition-all duration-200 shadow-md"
            >
              Calculate Salary
            </button>
            {estimatedSalary && (
              <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                {typeof estimatedSalary === "string" ? (
                  <p className="text-gray-600">{estimatedSalary}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg text-gray-800">
                      <strong>Average:</strong> ₹{estimatedSalary.average}
                    </p>
                    <p className="text-lg text-gray-800">
                      <strong>25th-75th Percentile:</strong> ₹{estimatedSalary.range}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Based on:</strong> {estimatedSalary.count} jobs
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Mobile Filter Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 lg:hidden bg-gray-800 bg-opacity-75 z-50 flex items-end">
            <div className="w-full bg-white rounded-t-xl p-6 max-h-[80vh] overflow-y-auto shadow-lg">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-teal-600" /> Filters
                </h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterSection />
              <button
                onClick={() => setIsFilterOpen(false)}
                className="mt-6 w-full bg-gradient-to-r from-teal-300 to-cyan-500 text-white py-3 rounded-full hover:bg-teal-600 transition-all duration-200 shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salaries;