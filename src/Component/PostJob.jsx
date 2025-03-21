import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const PostJob = () => {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(() => {
    const savedDraft = localStorage.getItem("jobDraft");
    return savedDraft
      ? JSON.parse(savedDraft)
      : {
          title: "",
          job_type: "",
          description: "",
          salary_min: "",
          salary_max: "",
          salary_type: "Yearly",
          company: "",
          location: "",
          experience: "",
          work_location: "",
          application_deadline: "",
          skills: [],
          company_size: "",
          benefits: "",
          category: "",
          requirements: "",
          apply_url: "",
        };
  });

  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("jobDraft", JSON.stringify(jobData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [jobData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
    setMessage({ text: "", type: "" });
  };

  const handleDescriptionChange = (value) => {
    setJobData((prev) => ({ ...prev, description: value }));
    setMessage({ text: "", type: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setMessage({ text: "❌ Please upload a valid image (JPEG, PNG, or GIF)", type: "error" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: "❌ File size must be less than 2MB", type: "error" });
        return;
      }
      setLogoFile(file);
      setMessage({ text: "", type: "" });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSkillInput = (e) => setSkillInput(e.target.value);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !jobData.skills.includes(trimmedSkill)) {
      setJobData((prev) => ({ ...prev, skills: [...prev.skills, trimmedSkill] }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setJobData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const API_BASE_URL = "https://jobportalapi.up.railway.app";

  const validateStep = () => {
    const requiredFields = {
      1: ["company"],
      2: ["title", "job_type", "description", "location", "work_location", "experience"],
      3: ["application_deadline"],
      4: ["category"],
    };
    const currentFields = requiredFields[step];
    const missingFields = currentFields.filter((field) => !jobData[field]);
    if (missingFields.length > 0) {
      setMessage({
        text: `❌ Please fill in all required fields: ${missingFields.join(", ")}`,
        type: "error",
      });
      return false;
    }
    if (step === 3 && jobData.salary_min && jobData.salary_max && Number(jobData.salary_min) > Number(jobData.salary_max)) {
      setMessage({ text: "❌ Minimum salary cannot exceed maximum salary", type: "error" });
      return false;
    }
    if (step === 3 && new Date(jobData.application_deadline) < new Date()) {
      setMessage({ text: "❌ Application deadline cannot be in the past", type: "error" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep() && step < totalSteps) {
      setStep(step + 1);
      setMessage({ text: "", type: "" });
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    const token = localStorage.getItem("employertoken");

    if (!token) {
      setMessage({ text: "❌ Unauthorized. Please log in first.", type: "error" });
      setLoading(false);
      navigate("/login");
      return;
    }

    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
    Object.entries(jobData).forEach(([key, value]) => {
      if (key === "skills") {
        formData.append(key, value.join(",")); // Backend expects comma-separated string
      } else {
        formData.append(key, value || "");
      }
    });
    // Note: No need to append posted_by here; backend uses req.user.id

    try {
      const response = await axios.post(`${API_BASE_URL}/api/jobs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ text: "✅ Job Posted Successfully!", type: "success" });
      localStorage.removeItem("jobDraft");
      setTimeout(() => navigate("/employer-dashboard", { state: { refresh: true } }), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ text: `❌ Error posting job: ${errorMsg}`, type: "error" });
      console.error("Job posting error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    alert("Preview feature: Imagine seeing a formatted job listing here!");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">1. Company Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1.1 Company Name <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(e.g., Indeed)</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={jobData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1.2 Company Logo (Optional)
                  <span className="text-xs text-gray-500 ml-2">(JPEG, PNG, GIF, max 2MB)</span>
                </label>
                <div className="flex items-center gap-4">
                  {preview && (
                    <img
                      src={preview}
                      alt="Logo Preview"
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                  )}
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1.3 Company Size (Optional)
                  <span className="text-xs text-gray-500 ml-2">(Select size range)</span>
                </label>
                <select
                  name="company_size"
                  value={jobData.company_size}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Size</option>
                  <option value="Small">Small (1-50)</option>
                  <option value="Medium">Medium (51-250)</option>
                  <option value="Large">Large (251-1000)</option>
                  <option value="Enterprise">Enterprise (1000+)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">2. Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2.1 Job Title <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(e.g., Senior Software Engineer)</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={jobData.title}
                  onChange={handleChange}
                  placeholder="Enter job title"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2.2 Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="job_type"
                  value={jobData.job_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2.3 Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="experience"
                  value={jobData.experience}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2.4 Work Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="work_location"
                  value={jobData.work_location}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2.5 Location <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(e.g., San Francisco, CA or Remote)</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  placeholder="Enter job location"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2.6 Job Description <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Use bold, lists, etc.)</span>
                </label>
                <ReactQuill
                  value={jobData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the role, responsibilities, and qualifications..."
                  className="border border-gray-300 rounded-md"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">3. Compensation & Deadline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  3.1 Salary (Min)
                  <span className="text-xs text-gray-500 ml-2">(e.g., 50000)</span>
                </label>
                <input
                  type="number"
                  name="salary_min"
                  value={jobData.salary_min}
                  onChange={handleChange}
                  placeholder="Enter min salary"
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  3.2 Salary (Max)
                  <span className="text-xs text-gray-500 ml-2">(e.g., 75000)</span>
                </label>
                <input
                  type="number"
                  name="salary_max"
                  value={jobData.salary_max}
                  onChange={handleChange}
                  placeholder="Enter max salary"
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  3.3 Salary Type
                </label>
                <select
                  name="salary_type"
                  value={jobData.salary_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  3.4 Application Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="application_deadline"
                  value={jobData.application_deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">4. Skills & Additional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4.1 Skills (Add at least one)
                  <span className="text-xs text-gray-500 ml-2">(e.g., JavaScript, Project Management)</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={handleSkillInput}
                    placeholder="Type a skill and press Add"
                    className="w-full sm:flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Add Skill
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4.2 Job Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={jobData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4.3 Requirements (Optional)
                  <span className="text-xs text-gray-500 ml-2">(e.g., Bachelor’s degree, 3+ years)</span>
                </label>
                <textarea
                  name="requirements"
                  value={jobData.requirements}
                  onChange={handleChange}
                  placeholder="List job requirements"
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4.4 Benefits (Optional)
                  <span className="text-xs text-gray-500 ml-2">(e.g., Health insurance, Flexible hours)</span>
                </label>
                <textarea
                  name="benefits"
                  value={jobData.benefits}
                  onChange={handleChange}
                  placeholder="List job benefits"
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4.5 Application URL (Optional)
                  <span className="text-xs text-gray-500 ml-2">(e.g., https://company.com/apply)</span>
                </label>
                <input
                  type="url"
                  name="apply_url"
                  value={jobData.apply_url}
                  onChange={handleChange}
                  placeholder="Enter application URL"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Post a Job</h1>
          <button
            onClick={() => navigate("/employer-dashboard")}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {["Company Details", "Job Details", "Compensation", "Skills & Info"].map((label, index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                    step > index + 1
                      ? "bg-blue-600 text-white"
                      : step === index + 1
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-md mb-6 text-center text-sm sm:text-base ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 py-3 px-6 rounded-md bg-gray-600 text-white font-medium hover:bg-gray-700 transition"
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 px-6 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Next
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1 py-3 px-6 rounded-md bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 px-6 rounded-md text-white font-medium transition ${
                    loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  } flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                        />
                      </svg>
                      Posting...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;