import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditJob = () => {
  const { id } = useParams();
  console.log("Job ID from URL:", id);
  const navigate = useNavigate();
  const API_BASE_URL = "https://jobportalapi.up.railway.app/api/jobs";

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] = useState("");

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        console.log(`Fetching job with ID: ${id}`);
        const token = localStorage.getItem("employertoken");
        const response = await axios.get(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        console.log("API Response Data:", response.data);
        setJob({
          ...response.data,
          skills: response.data.skills || [], // Ensure skills is an array
        });
      } catch (err) {
        console.error("Fetch job error:", err.response || err.message);
        setError(err.response?.data?.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  // Handle skill input
  const handleSkillInput = (e) => {
    setSkillInput(e.target.value);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !job.skills.includes(trimmedSkill)) {
      setJob((prev) => ({ ...prev, skills: [...prev.skills, trimmedSkill] }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setJob((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!job) return;

    // Basic validation
    if (!job.title || !job.company || !job.location || !job.job_type) {
      setError("Please fill in all required fields (Title, Company, Location, Job Type).");
      return;
    }

    if (!window.confirm("Are you sure you want to save these changes?")) return;

    try {
      setLoading(true);
      console.log("Submitting updated job:", job);
      const token = localStorage.getItem("employertoken");
      await axios.put(`${API_BASE_URL}/${id}`, job, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setMessage("✅ Job updated successfully!");
      setTimeout(() => {
        navigate(`/job/${id}`, { state: { success: "Job updated successfully!" } });
      }, 1000);
    } catch (err) {
      console.error("Update job error:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to update job.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          </svg>
          <span className="text-gray-600 text-lg">Loading job details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center border border-red-200 max-w-md">
          <p className="text-red-600 mb-4 text-lg font-semibold">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Job not found state
  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-gray-600 text-lg border border-gray-200">
          Job not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit Job Posting</h2>
        {message && (
          <p
            className={`text-center mb-6 font-medium text-lg ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Job Title */}
            <InputField
              label="Job Title *"
              name="title"
              value={job.title || ""}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              required
              disabled={loading}
            />

            {/* Job Type */}
            <SelectField
              label="Job Type *"
              name="job_type"
              value={job.job_type || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Job Type" },
                { value: "Full-time", label: "Full-time" },
                { value: "Part-time", label: "Part-time" },
                { value: "Contract", label: "Contract" },
                { value: "Temporary", label: "Temporary" },
                { value: "Internship", label: "Internship" },
              ]}
              disabled={loading}
              required
            />

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                value={job.description || ""}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="Describe the job responsibilities and requirements..."
                disabled={loading}
              />
            </div>

            {/* Salary */}
            <InputField
              label="Salary (Minimum)"
              name="salary_min"
              type="number"
              value={job.salary_min || ""}
              onChange={handleChange}
              placeholder="e.g., 65000"
              disabled={loading}
            />
            <InputField
              label="Salary (Maximum)"
              name="salary_max"
              type="number"
              value={job.salary_max || ""}
              onChange={handleChange}
              placeholder="e.g., 85000"
              disabled={loading}
            />
            <SelectField
              label="Salary Type"
              name="salary_type"
              value={job.salary_type || "Yearly"}
              onChange={handleChange}
              options={[
                { value: "Hourly", label: "Hourly" },
                { value: "Monthly", label: "Monthly" },
                { value: "Yearly", label: "Yearly" },
              ]}
              disabled={loading}
            />

            {/* Company */}
            <InputField
              label="Company Name *"
              name="company"
              value={job.company || ""}
              onChange={handleChange}
              placeholder="e.g., VocaleheartTech"
              required
              disabled={loading}
            />

            {/* Location */}
            <InputField
              label="Location *"
              name="location"
              value={job.location || ""}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
              required
              disabled={loading}
            />

            {/* Experience */}
            <SelectField
              label="Experience Level"
              name="experience"
              value={job.experience || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Experience" },
                { value: "Entry", label: "Entry" },
                { value: "Mid-level", label: "Mid-level" },
                { value: "Senior", label: "Senior" },
                { value: "Executive", label: "Executive" },
              ]}
              disabled={loading}
            />

            {/* Wor  Location */}
            <SelectField
              label="Work Location"
              name="workLocation"
              value={job.workLocation || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Work Location" },
                { value: "Remote", label: "Remote" },
                { value: "On-site", label: "On-site" },
                { value: "Hybrid", label: "Hybrid" },
              ]}
              disabled={loading}
            />

            {/* Application Deadline */}
            <InputField
              label="Application Deadline"
              name="applicationDeadline"
              type="date"
              value={job.applicationDeadline || ""}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              disabled={loading}
            />

            {/* Skills */}
            <div className="sm:col-span-2">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="skills"
                  value={skillInput}
                  onChange={handleSkillInput}
                  placeholder="e.g., JavaScript"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-red-600 hover:text-red-800 focus:outline-none"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Company Size */}
            <SelectField
              label="Company Size"
              name="companySize"
              value={job.companySize || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Company Size" },
                { value: "Small", label: "Small" },
                { value: "Medium", label: "Medium" },
                { value: "Large", label: "Large" },
                { value: "Enterprise", label: "Enterprise" },
              ]}
              disabled={loading}
            />

            {/* Benefits */}
            <div className="sm:col-span-2">
              <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
                Benefits
              </label>
              <textarea
                id="benefits"
                name="benefits"
                value={job.benefits || ""}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="e.g., Health insurance, Paid time off"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <SelectField
              label="Category"
              name="category"
              value={job.category || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Category" },
                { value: "Technology", label: "Technology" },
                { value: "Healthcare", label: "Healthcare" },
                { value: "Finance", label: "Finance" },
                { value: "Education", label: "Education" },
                { value: "Marketing", label: "Marketing" },
              ]}
              disabled={loading}
            />

            {/* Requirements */}
            <div className="sm:col-span-2">
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={job.requirements || ""}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                placeholder="e.g., Bachelor’s degree, 5+ years experience"
                disabled={loading}
              />
            </div>

            {/* Apply URL */}
            <div className="sm:col-span-2">
              <InputField
                label="Application URL (Optional)"
                name="apply_url"
                type="url"
                value={job.apply_url || ""}
                onChange={handleChange}
                placeholder="e.g., https://company.com/apply"
                disabled={loading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/job/${id}`)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Components
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required, disabled }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 transition-all duration-200"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, disabled, required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 transition-all duration-200"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default EditJob;