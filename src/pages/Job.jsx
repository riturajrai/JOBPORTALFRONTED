import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Briefcase, DollarSign, Eye, Search, Filter, X } from "lucide-react";

const Job = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortSalary, setSortSalary] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/jobs");
        setJobs(response.data);
        setFilteredJobs(response.data);
      } catch (error) {
        setError("Error fetching jobs");
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleFilterAndSort = () => {
    let filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
        job.location.toLowerCase().includes(searchLocation.toLowerCase()) &&
        (filterType ? job.jobType.toLowerCase() === filterType.toLowerCase() : true)
    );

    if (sortSalary === "asc") {
      filtered.sort((a, b) => parseFloat(a.salary) - parseFloat(b.salary));
    } else if (sortSalary === "desc") {
      filtered.sort((a, b) => parseFloat(b.salary) - parseFloat(a.salary));
    }

    setFilteredJobs(filtered);
  };

  if (loading) return <p className="text-center text-lg font-semibold">Loading...</p>;
  if (error) return <p className="text-center text-red-500">❌ {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">🎯 Available Jobs</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Search Job Title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="border p-3 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Search Location..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="border p-3 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Search & Filter Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handleFilterAndSort}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 justify-center"
        >
          <Search className="w-5 h-5" /> Search
        </button>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-all flex items-center gap-2"
        >
          <Filter className="w-5 h-5" /> Filters
        </button>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg p-6 z-50 transform transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Filters</h3>
            <button onClick={() => setIsFilterOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>

          <select
            value={sortSalary}
            onChange={(e) => setSortSalary(e.target.value)}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="">Sort by Salary</option>
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
          
          <button
            onClick={() => {
              handleFilterAndSort();
              setIsFilterOpen(false);
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all w-full"
          >
            Apply Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <img src={job.logo} alt="Company Logo" className="w-16 h-16 rounded-lg border border-gray-300" />
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2"><Briefcase className="w-5 h-5" /> {job.title}</h3>
                  <p className="text-gray-600 flex items-center gap-2"><MapPin className="w-5 h-5" /> {job.company} - {job.location}</p>
                </div>
              </div>
              <p className="text-blue-600 font-semibold text-lg mt-3 flex items-center gap-2"><DollarSign className="w-5 h-5" /> {job.salary}</p>
              <p className="text-gray-700 mt-2 line-clamp-2">{job.description}</p>
              {isAuthenticated ? (
                <Link to={`/job/${job.id}`} className="block text-center mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:scale-105 transition-all">View Details</Link>
              ) : (
                <button onClick={() => navigate("/login")} className="block text-center mt-4 bg-yellow-500 text-white py-2 px-4 rounded-lg">Sign Up or Login</button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-red-500 col-span-3">❌ No jobs found!</p>
        )}
      </div>
    </div>
  );
};

export default Job;
