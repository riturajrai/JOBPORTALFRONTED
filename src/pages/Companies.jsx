import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Filter, X, Star, Search, Building2, MapPin, Briefcase, Users } from "lucide-react";
import debounce from "lodash/debounce";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    industry: "",
    company_size: "",
    rating: "",
    search: "",
    founded: "",
    job_type: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const companiesPerPage = 12;
  const navigate = useNavigate();

  const API_BASE_URL = "https://jobportalapi.up.railway.app/api/companies";

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });
      console.log("API response:", response.data);

      const companiesArray = Array.isArray(response.data) ? response.data : [response.data];
      const formattedCompanies = companiesArray.map((company) => ({
        id: company.id,
        name: company.company_name || "Unknown Company",
        logo: company.logo || null,
        industry: company.industry || "Other",
        company_size: company.company_size || "Not specified",
        jobs: Array.isArray(company.jobs) ? company.jobs : [],
        rating: Number(company.rating) || Math.floor(Math.random() * 5) + 1,
        reviewsCount: Number(company.reviewsCount) || Math.floor(Math.random() * 500),
        reviews: Array.isArray(company.reviews) ? company.reviews : [],
        email: company.email || "N/A",
        contact_name: company.contact_name || "Unknown",
        about: company.about || "Explore opportunities with this company.",
        headquarters: company.headquarters || "Location Not Specified",
        founded: company.founded || null,
        website: company.website || `https://${(company.company_name || "company").toLowerCase().replace(/\s+/g, "")}.com`,
        verified: Math.random() > 0.3,
      }));
      setCompanies(formattedCompanies);
    } catch (error) {
      setError("Failed to load companies. Please try again later.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const debouncedSearch = debounce((value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, 300);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      debouncedSearch(value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
      setCurrentPage(1);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      industry: "",
      company_size: "",
      rating: "",
      search: "",
      founded: "",
      job_type: "",
    });
    setCurrentPage(1);
  };

  const filteredCompanies = companies
    .filter((company) => {
      return (
        (!filters.industry || company.industry === filters.industry) &&
        (!filters.company_size || company.company_size === filters.company_size) &&
        (!filters.rating || company.rating >= parseInt(filters.rating)) &&
        (!filters.search || company.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.founded || (company.founded && company.founded >= parseInt(filters.founded))) &&
        (!filters.job_type || company.jobs.some((job) => (job.type || job.job_type) === filters.job_type))
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "jobs") return b.jobs.length - a.jobs.length;
      if (sortBy === "founded") return (b.founded || 0) - (a.founded || 0);
      return 0;
    });

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderLogo = (company) => {
    if (company.logo) {
      return (
        <img
          src={company.logo}
          alt={`${company.name} logo`}
          className="w-12 h-12 rounded-full border border-gray-200 object-contain bg-white p-1"
          loading="lazy"
          onError={(e) => (e.target.style.display = "none")}
        />
      );
    }
    return (
      <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
        <Building2 className="w-6 h-6 text-gray-400" aria-hidden="true" />
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mr-4"></div>
      <p className="text-xl font-semibold text-gray-700">Loading Companies...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-12 bg-gray-50 min-h-screen">
      <p className="text-red-600 text-xl font-semibold mb-4">❌ {error}</p>
      <button
        onClick={() => fetchCompanies()} // Fixed assignment error
        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all"
      >
        Retry
      </button>
    </div>
  );

  const FilterSection = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" /> Industry
        </label>
        <select
          name="industry"
          value={filters.industry}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Industries</option>
          {[...new Set(companies.map((c) => c.industry))].map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" /> Company Size
        </label>
        <select
          name="company_size"
          value={filters.company_size}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sizes</option>
          <option value="1-10">1-10</option>
          <option value="11-50">11-50</option>
          <option value="51-200">51-200</option>
          <option value="201+">201+</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" /> Minimum Rating
        </label>
        <select
          name="rating"
          value={filters.rating}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Any Rating</option>
          {[1, 2, 3, 4].map((r) => (
            <option key={r} value={r}>
              {r}+ Stars
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-600" /> Job Type
        </label>
        <select
          name="job_type"
          value={filters.job_type}
          onChange={handleFilterChange}
          className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" /> Founded After
        </label>
        <input
          type="number"
          name="founded"
          value={filters.founded}
          onChange={handleFilterChange}
          placeholder="e.g., 2010"
          className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={resetFilters}
        className="w-full py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Discover Top Companies Hiring Now
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse {filteredCompanies.length} companies with exciting opportunities
          </p>
          <div className="mt-4 flex justify-center">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search companies by name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-full lg:w-1/4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" /> Refine Your Search
            </h2>
            <FilterSection />
          </div>

          {/* Companies List */}
          <div className="w-full lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
              >
                <Filter className="w-5 h-5" /> Filters
              </button>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full sm:w-auto p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="name">Sort by: Name</option>
                <option value="rating">Sort by: Rating</option>
                <option value="jobs">Sort by: Open Jobs</option>
                <option value="founded">Sort by: Founded</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCompanies.length > 0 ? (
                currentCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col"
                  >
                    <div className="flex items-start gap-4">
                      {renderLogo(company)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{company.name}</h3>
                          {company.verified && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                              <Star className="w-3 h-3 mr-1" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium truncate">{company.industry}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-gray-600 flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" /> {company.headquarters}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 truncate">
                        <Users className="w-4 h-4 text-gray-500 flex-shrink-0" /> {company.company_size}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 truncate">
                        <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" /> {company.jobs.length} Open Job
                        {company.jobs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">{'★'.repeat(Math.floor(company.rating))}</span>
                        <span className="text-gray-300">{'★'.repeat(5 - Math.floor(company.rating))}</span>
                        <span className="text-gray-600 text-sm ml-1 truncate">
                          ({company.rating.toFixed(1)} • {company.reviewsCount} reviews)
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{company.about}</p>
                    </div>
                    <Link
                      to={`/company/${encodeURIComponent(company.name)}`}
                      className="mt-4 w-full text-center bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition-all text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Company
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No companies found matching your criteria.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm disabled:opacity-50 hover:bg-gray-100 transition-all"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    return (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`px-4 py-2 border rounded-full text-sm ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm disabled:opacity-50 hover:bg-gray-100 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        {isFilterOpen && (
          <div className="fixed inset-0 lg:hidden bg-gray-800 bg-opacity-75 z-50 flex items-end">
            <div className="w-full bg-white rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" /> Filters
                </h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <FilterSection />
              <button
                onClick={() => setIsFilterOpen(false)}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-all"
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

export default Companies;