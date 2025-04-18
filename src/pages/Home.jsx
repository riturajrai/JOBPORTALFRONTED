import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

// SVG Icons (unchanged)
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v6H3V3zm4 8h10v10H7V11z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Mock Data (removed locationSuggestions)
const suggestions = [
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "Marketing Specialist",
  "Customer Support",
];

const featuredJobs = [
  { id: 1, title: "Senior Software Engineer", company: "TechCorp", location: "Remote", salary: "$120k-$150k", type: "Full-time" },
  { id: 2, title: "Marketing Manager", company: "GrowEasy", location: "New York, NY", salary: "$90k-$110k", type: "Full-time" },
  { id: 3, title: "Data Analyst", company: "DataWorks", location: "San Francisco, CA", salary: "$80k-$100k", type: "Contract" },
];

const categories = [
  { name: "Technology", count: "1,200+" },
  { name: "Sales", count: "900+" },
  { name: "Marketing", count: "750+" },
  { name: "Customer Support", count: "600+" },
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cities, setCities] = useState([]); // State for city suggestions
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const [error, setError] = useState(null); // State for errors
  const [formData, setFormData] = useState({ location: "" }); // State for form data
  const navigate = useNavigate();

  // Handle scroll for navbar (unchanged)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle city search
  const handleCitySearch = async (e) => {
    const name = e.target.value;
    setLocationQuery(name); // Update location query
    setFormData((prev) => ({ ...prev, location: name }));
    if (name.length > 0) {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://jobporatl.onrender.com/api/cities?name=${name}`);
        setCities(response.data.data);
        setShowLocationSuggestions(true);
      } catch (error) {
        setError("Unable to fetch cities.");
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCities([]);
      setShowLocationSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() || locationQuery.trim()) {
      navigate("/jobs", { state: { searchQuery, locationQuery } });
      setShowSuggestions(false);
      setShowLocationSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar (unchanged) */}
      <nav
        className={`bg-white shadow-sm fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "py-2" : "py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="/" className="flex items-center" aria-label="Home">
            <span className="text-xl font-bold text-[#008080]">JobLeAaye</span>
          </a>
          <div className="hidden md:flex items-center gap-4">
            <a href="/jobs" className="text-gray-600 hover:text-[#008080] text-sm">Browse Jobs</a>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-[#008080] text-white rounded-md text-sm font-medium"
            >
              Candidate Login
            </button>
            <button
              onClick={() => navigate("/employer-login")}
              className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium"
            >
              Employer Login
            </button>
          </div>
          <button
  className="md:hidden"
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  aria-label="Toggle menu"
>
  <MenuIcon />
</button>

        </div>
        {/* Mobile Menu (unchanged) */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <div className="px-4 py-3 flex flex-col gap-3">
              <a href="/jobs" className="text-gray-600 text-sm">Browse Jobs</a>
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 bg-[#008080] text-white rounded-md text-sm font-medium"
              >
                Candidate Login
              </button>
              <button
                onClick={() => {
                  navigate("/employer-login");
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium"
              >
                Employer Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-[#f2f2f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Your Next Career Opportunity
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Search thousands of jobs from top companies and take the next step in your career.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Job title, skills, or company"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                aria-label="Search jobs"
              />
              {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto z-10">
                  {filteredSuggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-[#f2f2f2]"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch();
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Location (e.g., Remote, New York)"
                value={locationQuery}
                onChange={handleCitySearch} // Use handleCitySearch
                onKeyPress={handleKeyPress}
                onFocus={() => setShowLocationSuggestions(true)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                aria-label="Search location"
              />
              {isLoading && (
                <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 p-2 text-sm text-gray-600 z-10">
                  Loading...
                </div>
              )}
              {error && (
                <div className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 p-2 text-sm text-red-600 z-10">
                  {error}
                </div>
              )}
              {showLocationSuggestions && cities.length > 0 && !isLoading && !error && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto z-10">
                  {cities.map((city) => (
                    <li
                      key={city.id || city.name} // Use a unique key, adjust based on API response
                      className="px-4 py-2 text-gray-700 text-sm cursor-pointer hover:bg-[#f2f2f2]"
                      onClick={() => {
                        setLocationQuery(city.name); // Adjust based on API response structure
                        setFormData((prev) => ({ ...prev, location: city.name }));
                        setShowLocationSuggestions(false);
                        handleSearch();
                      }}
                    >
                      {city.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[#008080] text-white rounded-md flex items-center gap-2"
              aria-label="Search"
            >
              <SearchIcon />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section (unchanged) */}
      <section className="py-12 bg-[#f2f2f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Featured Jobs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-md border border-gray-200 cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm mb-1">{job.company}</p>
                <p className="text-gray-500 text-sm mb-2">{job.location}</p>
                <div className="flex justify-between items-center">
                  <p className="text-[#008080] text-sm font-medium">{job.salary}</p>
                  <p className="text-gray-500 text-sm">{job.type}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="/jobs"
              className="px-6 py-3 bg-[#008080] text-white rounded-md text-sm font-medium"
            >
              View All Jobs
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section (unchanged) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Popular Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-[#f2f2f2] p-6 rounded-md border border-gray-200 cursor-pointer"
                onClick={() => navigate("/jobs", { state: { jobRoleFilter: category.name } })}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.count} Jobs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section (unchanged) */}
      <section className="py-12 bg-[#f2f2f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Why JobLeAaye?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Wide Range of Jobs",
                desc: "Explore opportunities across industries and locations.",
                icon: <BriefcaseIcon className="w-8 h-8 text-[#008080]" />,
              },
              {
                title: "Easy Applications",
                desc: "Apply quickly and track your applications seamlessly.",
                icon: <BriefcaseIcon className="w-8 h-8 text-[#008080]" />,
              },
              {
                title: "Trusted Employers",
                desc: "Connect with verified companies and recruiters.",
                icon: <BriefcaseIcon className="w-8 h-8 text-[#008080]" />,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-md border border-gray-200 text-center"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section (unchanged) */}
      <section className="py-12 bg-[#008080] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
          <p className="text-lg mb-6 max-w-xl mx-auto">Join JobLeAaye and start exploring opportunities today.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 bg-white text-[#008080] rounded-md text-sm font-medium"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-orange-600 text-white rounded-md text-sm font-medium"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Footer (unchanged) */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">JobLeAaye</h3>
              <p className="text-gray-400 text-sm">Your platform for finding and posting jobs worldwide.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/jobs" className="hover:text-white">Browse Jobs</a></li>
                <li><a href="/signup" className="hover:text-white">Sign Up</a></li>
                <li><a href="/login" className="hover:text-white">Log In</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/postjob" className="hover:text-white">Post a Job</a></li>
                <li><a href="/employer-login" className="hover:text-white">Employer Login</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Subscribed!");
                }}
                className="flex"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-md text-gray-900 text-sm focus:outline-none"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008080] text-white rounded-r-md text-sm"
                  aria-label="Subscribe"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} JobLeAaye. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
