import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BriefcaseIcon, PencilIcon, SearchIcon, BellIcon } from "../assets/Icons";

const EmployerProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [employerData, setEmployerData] = useState({
    companyName: "TechCorp",
    logo: "https://via.placeholder.com/150",
    description: "A leading tech company innovating the future.",
    industry: "Technology",
    size: "500-1000 employees",
    location: "San Francisco, CA",
    website: "https://techcorp.com",
    banner: "https://via.placeholder.com/1200x300",
    socialLinks: {
      linkedin: "https://linkedin.com/company/techcorp",
      twitter: "https://twitter.com/techcorp",
    },
  });
  const [jobPostings, setJobPostings] = useState([
    { id: 1, title: "Software Engineer", status: "Active", applications: 25 },
    { id: 2, title: "Product Manager", status: "Draft", applications: 0 },
  ]);
  const [analytics, setAnalytics] = useState({
    profileViews: 120,
    applicationsReceived: 35,
    activeJobs: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    "New application received for Software Engineer",
    "Profile viewed by 5 candidates today",
  ]);

  useEffect(() => {
    const storedData = localStorage.getItem("employerData");
    if (storedData) {
      setEmployerData(JSON.parse(storedData));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("employerData", JSON.stringify(employerData));
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setEmployerData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const handleResumeSearch = () => {
    if (searchQuery.trim()) {
      alert(`Searching resumes for: ${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Banner */}
      <div className="relative">
        <img
          src={employerData.banner}
          alt="Company Banner"
          className="w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 object-cover"
        />
        <div className="absolute bottom-0 left-0 p-2 sm:p-4 md:p-6 flex items-end">
          <img
            src={employerData.logo}
            alt="Company Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
            {employerData.companyName}
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-[#008080] text-white text-sm sm:text-base rounded-md hover:bg-[#006666] transition-colors"
          >
            <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Company Details */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <input
                type="text"
                name="companyName"
                value={employerData.companyName}
                onChange={handleChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="Company Name"
              />
              <input
                type="text"
                name="description"
                value={employerData.description}
                onChange={handleChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="Description"
              />
              <input
                type="text"
                name="industry"
                value={employerData.industry}
                onChange={handleChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="Industry"
              />
              <input
                type="text"
                name="size"
                value={employerData.size}
                onChange={handleChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="Company Size"
              />
              <input
                type="text"
                name="location"
                value={employerData.location}
                onChange={handleChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="Location"
              />
              <input
                type="url"
                name="website"
                value={employerData.website}
                onChange={handleChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="Website"
              />
              <input
                type="url"
                name="linkedin"
                value={employerData.socialLinks.linkedin}
                onChange={handleSocialChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="LinkedIn URL"
              />
              <input
                type="url"
                name="twitter"
                value={employerData.socialLinks.twitter}
                onChange={handleSocialChange}
                className="p-2 border rounded-md text-sm sm:text-base"
                placeholder="Twitter URL"
              />
              <button
                onClick={handleSave}
                className="col-span-full px-4 py-2 bg-orange-500 text-white text-sm sm:text-base rounded-md hover:bg-orange-400 transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-2">{employerData.description}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                <strong>Industry:</strong> {employerData.industry}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                <strong>Size:</strong> {employerData.size}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                <strong>Location:</strong> {employerData.location}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                <strong>Website:</strong>{" "}
                <a
                  href={employerData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#008080] hover:underline"
                >
                  {employerData.website}
                </a>
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                <a
                  href={employerData.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#008080] text-xs sm:text-sm hover:underline"
                >
                  LinkedIn
                </a>
                <a
                  href={employerData.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#008080] text-xs sm:text-sm hover:underline"
                >
                  Twitter
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Job Postings */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Job Postings
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {jobPostings.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gray-50 rounded-md"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-sm sm:text-base md:text-lg">{job.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Status: {job.status}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Applications: {job.applications}</p>
                </div>
                <button
                  onClick={() => navigate(`/manage-jobs/${job.id}`)}
                  className="px-2 sm:px-3 py-1 bg-[#008080] text-white text-xs sm:text-sm rounded-md hover:bg-[#006666] transition-colors"
                >
                  Manage
                </button>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => navigate("/employer/post-job")}
            className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white text-sm sm:text-base rounded-md hover:bg-orange-400 transition-colors"
          >
            <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Post New Job
          </button>
        </div>

        {/* Analytics */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Analytics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">
                {analytics.profileViews}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Profile Views</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">
                {analytics.applicationsReceived}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Applications Received</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#008080]">
                {analytics.activeJobs}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Active Jobs</p>
            </div>
          </div>
        </div>

        {/* Resume Search */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Search Resumes
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm sm:text-base"
              placeholder="Enter keywords (e.g., skills, location)"
            />
            <button
              onClick={handleResumeSearch}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#008080] text-white text-sm sm:text-base rounded-md hover:bg-[#006666] transition-colors"
            >
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Notifications
          </h2>
          <div className="space-y-2">
            {notifications.map((note, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
              >
                <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#008080]" />
                <p className="text-xs sm:text-sm md:text-base text-gray-700">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;