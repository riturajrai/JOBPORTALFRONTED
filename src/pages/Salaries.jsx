import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { saveAs } from "file-saver";
import debounce from "lodash/debounce"; // Install: npm install lodash
import { DollarSign, Filter, Download, X, Info } from "lucide-react"; // Added Info for tooltips

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

  const API_BASE_URL = "http://localhost:5000/api/jobs";

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL, {
        headers: { "Content-Type": "application/json" },
      });
      setJobs(response.data);
    } catch (error) {
      setError("Error fetching salary data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const parseSalaryRange = (salary) => {
    if (!salary || typeof salary !== "string") return { min: 0, max: 0 };
    if (!salary.includes("-")) return { min: parseFloat(salary) || 0, max: parseFloat(salary) || 0 };
    const [min, max] = salary.split("-").map((s) => parseFloat(s.trim().replace(/[^0-9.]/g, "")) || 0);
    return { min, max };
  };

  const getSalaryInsights = () => {
    const filteredJobs = jobs.filter((job) => {
      const { min, max } = parseSalaryRange(job.salary);
      return (
        (!filters.jobRole || job.title.toLowerCase().includes(filters.jobRole.toLowerCase())) &&
        (!filters.experience || job.experience === filters.experience) &&
        (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
        (!filters.companySize || job.company_size === filters.companySize) &&
        (!filters.employmentType || job.employmentType === filters.employmentType) &&
        (!filters.minSalary || min >= parseFloat(filters.minSalary)) &&
        (!filters.maxSalary || max <= parseFloat(filters.maxSalary))
      );
    });

    const salaryData = filteredJobs.map((job) => {
      const { min, max } = parseSalaryRange(job.salary);
      return { ...job, minSalary: min, maxSalary: max, medianSalary: (min + max) / 2 };
    });

    salaryData.sort((a, b) => {
      if (filters.sortBy === "highest") return b.maxSalary - a.maxSalary;
      if (filters.sortBy === "lowest") return a.minSalary - b.minSalary;
      return b.medianSalary - a.medianSalary; // Default: median
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
          label: "Median Salary ($)",
          data: medianSalaries,
          backgroundColor: "rgba(99, 102, 241, 0.6)", // Indigo shade
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 1,
        },
        ...(compareRoles.length > 0
          ? [
              {
                label: "Comparison Salary ($)",
                data: compareRoles.slice(0, 10).map((role) => role.medianSalary),
                backgroundColor: "rgba(236, 72, 153, 0.6)", // Pink shade
                borderColor: "rgba(236, 72, 153, 1)",
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
      legend: { position: "top", labels: { font: { size: 14 } } },
      title: { display: true, text: "Salary Trends by Job Role", font: { size: 20, weight: "bold" } },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: { label: (context) => `$${context.raw.toLocaleString()}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Salary ($)", font: { size: 14 } },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      x: {
        title: { display: true, text: "Job Role", font: { size: 14 } },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  const calculateSalary = () => {
    const relevantJobs = jobs.filter((job) => {
      const { min, max } = parseSalaryRange(job.salary);
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
      const { min, max } = parseSalaryRange(job.salary);
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
        `"${job.title.replace(/"/g, '""')}",${job.experience || "N/A"},${job.location || "N/A"},${job.company_size || "N/A"},${job.employmentType || "N/A"},${job.salary},${job.medianSalary.toLocaleString()}`
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600"></div>
          <p className="text-lg font-medium text-gray-700">Loading Salary Insights...</p>
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
          className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-md"
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
          <DollarSign className="w-4 h-4 text-indigo-600" /> Job Role
        </label>
        <input
          type="text"
          name="jobRole"
          value={filters.jobRole}
          onChange={handleFilterChange}
          placeholder="e.g., Software Engineer"
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Experience</label>
        <select
          name="experience"
          value={filters.experience}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
        >
          <option value="">All Levels</option>
          <option value="Entry">Entry</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          placeholder="e.g., New York"
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Company Size</label>
        <select
          name="companySize"
          value={filters.companySize}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
        >
          <option value="">All Sizes</option>
          <option value="1-50">1-50</option>
          <option value="51-200">51-200</option>
          <option value="201+">201+</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Employment Type</label>
        <select
          name="employmentType"
          value={filters.employmentType}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
        >
          <option value="">All Types</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Min Salary ($)</label>
          <input
            type="number"
            name="minSalary"
            value={filters.minSalary}
            onChange={handleFilterChange}
            placeholder="e.g., 50000"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Max Salary ($)</label>
          <input
            type="number"
            name="maxSalary"
            value={filters.maxSalary}
            onChange={handleFilterChange}
            placeholder="e.g., 150000"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">Sort By</label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
        >
          <option value="median">Median Salary</option>
          <option value="highest">Highest Salary</option>
          <option value="lowest">Lowest Salary</option>
        </select>
      </div>
      <button
        onClick={resetFilters}
        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Salary Insights & Calculator
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover salary trends, compare roles, and estimate your earning potential with real-time data.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start w-full lg:w-1/3">
            <div className="hidden lg:block bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" /> Filters
              </h2>
              <FilterSection />
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-2/3 space-y-8">
            {/* Salary Insights */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-600" /> Salary Data ({salaryInsights.length})
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden bg-indigo-600 text-white py-2 px-4 rounded-full flex items-center gap-2 hover:bg-indigo-700 transition-all duration-200 shadow-md"
                  >
                    <Filter className="w-5 h-5" /> Filters
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 text-white py-2 px-4 rounded-full flex items-center gap-2 hover:bg-green-700 transition-all duration-200 shadow-md"
                  >
                    <Download className="w-5 h-5" /> Export CSV
                  </button>
                </div>
              </div>
              {salaryInsights.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Range</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Median</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salaryInsights.slice(0, 10).map((job, index) => (
                        <tr key={job.id} className={`transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-xs" title={job.title}>{job.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{job.experience || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{job.location || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">${job.salary}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">${job.medianSalary.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => addToComparison(job)}
                              className={`${
                                compareRoles.some((r) => r.id === job.id)
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-indigo-600 hover:text-indigo-800"
                              } font-medium transition-colors duration-200`}
                              disabled={compareRoles.some((r) => r.id === job.id)}
                            >
                              {compareRoles.some((r) => r.id === job.id) ? "Added" : "Compare"}
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
              <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">Compared Roles ({compareRoles.length})</h2>
                <div className="space-y-4">
                  {compareRoles.map((role) => (
                    <div
                      key={role.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{role.title}</p>
                        <p className="text-sm text-gray-600">${role.medianSalary.toLocaleString()} (Median)</p>
                      </div>
                      <button
                        onClick={() => removeFromComparison(role.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chart */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-[400px]">
              <Bar data={getChartData()} options={chartOptions} />
            </section>

            {/* Salary Calculator */}
            <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" /> Salary Calculator
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Job Role</label>
                  <input
                    type="text"
                    name="jobRole"
                    value={calculator.jobRole}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., Software Engineer"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
                  <select
                    name="experience"
                    value={calculator.experience}
                    onChange={handleCalculatorChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
                  >
                    <option value="">Select Experience</option>
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={calculator.location}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., New York"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
                  />
                </div>
              </div>
              <button
                onClick={calculateSalary}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-md"
              >
                Calculate Salary
              </button>
              {estimatedSalary && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  {typeof estimatedSalary === "string" ? (
                    <p className="text-gray-600">{estimatedSalary}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg text-gray-800">
                        <strong>Average:</strong> ${estimatedSalary.average}
                      </p>
                      <p className="text-lg text-gray-800">
                        <strong>25th-75th Percentile:</strong> ${estimatedSalary.range}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Based on:</strong> {estimatedSalary.count} jobs
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>

        {/* Mobile Filter Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 lg:hidden bg-gray-800 bg-opacity-75 z-50 flex items-end">
            <div className="w-full bg-white rounded-t-xl p-6 max-h-[80vh] overflow-y-auto shadow-lg">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" /> Filters
                </h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterSection />
              <button
                onClick={() => setIsFilterOpen(false)}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-md"
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