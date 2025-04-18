import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const PostJob = () => {
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [jobData, setJobData] = useState(() => {
    const savedDraft = localStorage.getItem("jobDraft");
    const defaultData = {
      title: "",
      job_type: [],
      description: "",
      salary_min: "",
      salary_max: "",
      salary_type: "Yearly",
      company: "",
      location: "",
      experience: [],
      work_location: [],
      application_deadline: "",
      skills: [],
      company_size: "",
      benefits: "",
      category: [],
      requirements: "",
      apply_url: "",
      preferred_languages: [],
      certifications: [],
      questions: [],
      hiring_multiple: false,
      urgent_hiring: false,
      job_priority: "Normal",
      hiring_timeline: "Flexible",
      remote_work_allowance: "No Remote",
      interview_rounds: "1",
      candidate_availability: "Flexible",
    };

    if (!savedDraft) return defaultData;

    const parsedDraft = JSON.parse(savedDraft);
    return {
      ...defaultData,
      ...parsedDraft,
      job_type: Array.isArray(parsedDraft.job_type) ? parsedDraft.job_type : [],
      experience: Array.isArray(parsedDraft.experience) ? parsedDraft.experience : [],
      work_location: Array.isArray(parsedDraft.work_location) ? parsedDraft.work_location : [],
      skills: Array.isArray(parsedDraft.skills) ? parsedDraft.skills : [],
      category: Array.isArray(parsedDraft.category) ? parsedDraft.category : [],
      preferred_languages: Array.isArray(parsedDraft.preferred_languages) ? parsedDraft.preferred_languages : [],
      certifications: Array.isArray(parsedDraft.certifications) ? parsedDraft.certifications : [],
      questions: Array.isArray(parsedDraft.questions) ? parsedDraft.questions : [],
    };
  });

  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  // New state for job title search
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const requiredFields = {
    1: ["company"],
    2: ["title", "job_type", "description", "location"],
    3: ["application_deadline"],
    4: ["category", "skills"],
    5: [],
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("jobDraft", JSON.stringify(jobData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [jobData]);

  // Fetch job title suggestions
  useEffect(() => {
    const fetchJobTitles = async () => {
      if (!jobData.title.trim()) {
        setJobTitleSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(`https://jobporatl.onrender.com/api/jobtitle?job_title=${encodeURIComponent(jobData.title)}`);
        setJobTitleSuggestions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching job titles:", error);
        setMessage({ text: "Error fetching job titles", type: "error" });
        setJobTitleSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };
    const debounce = setTimeout(fetchJobTitles, 300);
    return () => clearTimeout(debounce);
  }, [jobData.title]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMessage({ text: "", type: "" });
  };

  const handleMultiSelect = (field, value) => {
    setJobData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
    setMessage({ text: "", type: "" });
  };

  const handleDescriptionChange = (value) => {
    const strippedValue = value.replace(/<p><br><\/p>/g, "").trim();
    setJobData((prev) => ({ ...prev, description: strippedValue || value }));
    setMessage({ text: "", type: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setMessage({ text: "Please upload a valid image (JPEG, PNG, or GIF)", type: "error" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: "File size must be less than 2MB", type: "error" });
        return;
      }
      setLogoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddItem = (e, field, input, setInput) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput && !jobData[field].includes(trimmedInput)) {
      setJobData((prev) => ({ ...prev, [field]: [...prev[field], trimmedInput] }));
      setInput("");
    }
  };

  const handleRemoveItem = (item, field) => {
    setJobData((prev) => ({ ...prev, [field]: prev[field].filter((i) => i !== item) }));
  };

  // Handle selecting a job title suggestion
  const handleSelectJobTitle = (title) => {
    setJobData((prev) => ({ ...prev, title }));
    setJobTitleSuggestions([]);
  };

  const API_BASE_URL = " http://localhost:5000";

  const validateStep = () => {
    const currentFields = requiredFields[step];
    const missingFields = currentFields.filter((field) =>
      Array.isArray(jobData[field]) ? jobData[field].length === 0 : !jobData[field]?.trim()
    );
    if (missingFields.length > 0) {
      setMessage({ text: `Please fill in: ${missingFields.join(", ")}`, type: "error" });
      return false;
    }
    if (step === 3) {
      if (jobData.salary_min && jobData.salary_max && Number(jobData.salary_min) > Number(jobData.salary_max)) {
        setMessage({ text: "Minimum salary cannot exceed maximum salary", type: "error" });
        return false;
      }
      if (!jobData.application_deadline || new Date(jobData.application_deadline) < new Date()) {
        setMessage({ text: "Valid application deadline is required", type: "error" });
        return false;
      }
    }
    return true;
  };

  const validateAllSteps = () => {
    const allRequiredFields = ["title", "job_type", "description", "company", "location", "application_deadline"];
    const missingFields = allRequiredFields.filter((field) =>
      Array.isArray(jobData[field]) ? jobData[field].length === 0 : !jobData[field]?.trim()
    );
    if (missingFields.length > 0) {
      setMessage({ text: `Please fill in all required fields: ${missingFields.join(", ")}`, type: "error" });
      return false;
    }
    if (jobData.salary_min && jobData.salary_max && Number(jobData.salary_min) > Number(jobData.salary_max)) {
      setMessage({ text: "Minimum salary cannot exceed maximum salary", type: "error" });
      return false;
    }
    if (!jobData.application_deadline || new Date(jobData.application_deadline) < new Date()) {
      setMessage({ text: "Valid application deadline is required", type: "error" });
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
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
    if (!validateAllSteps()) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ text: "Please log in first", type: "error" });
      setLoading(false);
      navigate("/login");
      return;
    }

    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
    Object.entries(jobData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else {
        formData.append(key, value || "");
      }
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/jobs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage({ text: response.data.message || "Job posted successfully!", type: "success" });
      localStorage.removeItem("jobDraft");
      setTimeout(() => navigate("/", { state: { refresh: true } }), 2000);
    } catch (error) {
      console.error("Error posting job:", error);
      let errorMsg = "Error posting job. Please try again.";
      if (error.response) {
        errorMsg = error.response.data.message || `Server error: ${error.response.status}`;
        if (error.response.status === 400 && error.response.data.errors) {
          errorMsg += " - " + error.response.data.errors.map((e) => e.msg).join(", ");
        }
      } else if (error.request) {
        errorMsg = "Network error: No response from server.";
      }
      setMessage({ text: errorMsg, type: "error" });
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMultiSelect = (field, options, label) => (
    <div className="transition-all duration-300">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {requiredFields[step]?.includes(field) && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        {jobData[field].map((item, index) => (
          <span
            key={index}
            className="bg-[#008080] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemoveItem(item, field)}
              className="text-red-200 hover:text-red-100 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 mt-2 sm:mt-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleMultiSelect(field, option)}
            className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg shadow-md transition-all duration-200 ${
              jobData[field].includes(option)
                ? "bg-[#008080] text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Company Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={jobData.company}
                  onChange={handleChange}
                  placeholder="e.g., Indeed"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Company Logo (Optional)</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs sm:text-sm text-gray-500 file:py-2 file:px-4 sm:file:py-3 sm:file:px-5 file:rounded-lg file:border-0 file:bg-[#008080] file:text-white file:shadow-md"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-2 sm:mt-3 w-20 sm:w-28 h-20 sm:h-28 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Company Size (Optional)</label>
                <select
                  name="company_size"
                  value={jobData.company_size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
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
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Job Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={jobData.title}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  required
                />
                {isSearching && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-2 z-10">
                    <p className="text-xs sm:text-sm text-gray-500">Searching...</p>
                  </div>
                )}
                {jobTitleSuggestions.length > 0 && !isSearching && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                    {jobTitleSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-[#008080]/10 cursor-pointer flex justify-between items-center"
                        onClick={() => handleSelectJobTitle(suggestion.job_title)}
                      >
                        {suggestion.job_title}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectJobTitle(suggestion.job_title);
                          }}
                          className="text-[#008080] text-xs font-semibold"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {renderMultiSelect("job_type", ["Full-time", "Part-time", "Contract", "Temporary", "Internship"], "Job Type")}
              {renderMultiSelect("experience", ["Entry", "Mid-level", "Senior", "Executive"], "Experience Level")}
              {renderMultiSelect("work_location", ["Remote", "On-site", "Hybrid"], "Work Location")}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <ReactQuill
                  ref={quillRef}
                  value={jobData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the role, responsibilities, and qualifications..."
                  className="border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm"
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
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Compensation & Deadline</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Salary (Min)</label>
                <input
                  type="number"
                  name="salary_min"
                  value={jobData.salary_min}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Salary (Max)</label>
                <input
                  type="number"
                  name="salary_max"
                  value={jobData.salary_max}
                  onChange={handleChange}
                  placeholder="e.g., 75000"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Salary Type</label>
                <select
                  name="salary_type"
                  value={jobData.salary_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="application_deadline"
                  value={jobData.application_deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Skills & Additional Info</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-2 sm:mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g., JavaScript"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddItem(e, "skills", skillInput, setSkillInput)}
                    className="px-4 py-2 sm:px-5 sm:py-3 bg-[#008080] text-white rounded-lg text-xs sm:text-sm shadow-md hover:bg-[#006666] transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#008080] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(skill, "skills")}
                        className="text-red-200 hover:text-red-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              {renderMultiSelect(
                "category",
                ["Technology", "Healthcare", "Finance", "Education", "Marketing", "Other"],
                "Job Category"
              )}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Preferred Languages (Optional)</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-2 sm:mb-3">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="e.g., English"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddItem(e, "preferred_languages", languageInput, setLanguageInput)}
                    className="px-4 py-2 sm:px-5 sm:py-3 bg-[#008080] text-white rounded-lg text-xs sm:text-sm shadow-md hover:bg-[#006666] transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobData.preferred_languages.map((lang, index) => (
                    <span
                      key={index}
                      className="bg-[#008080] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(lang, "preferred_languages")}
                        className="text-red-200 hover:text-red-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Certifications (Optional)</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-2 sm:mb-3">
                  <input
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g., AWS Certified"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddItem(e, "certifications", certInput, setCertInput)}
                    className="px-4 py-2 sm:px-5 sm:py-3 bg-[#008080] text-white rounded-lg text-xs sm:text-sm shadow-md hover:bg-[#006666] transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobData.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="bg-[#008080] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(cert, "certifications")}
                        className="text-red-200 hover:text-red-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Questions for Candidates (Optional)</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-2 sm:mb-3">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="e.g., What is your experience with React?"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddItem(e, "questions", questionInput, setQuestionInput)}
                    className="px-4 py-2 sm:px-5 sm:py-3 bg-[#008080] text-white rounded-lg text-xs sm:text-sm shadow-md hover:bg-[#006666] transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobData.questions.map((question, index) => (
                    <span
                      key={index}
                      className="bg-[#008080] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-md"
                    >
                      {question}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(question, "questions")}
                        className="text-red-200 hover:text-red-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Requirements (Optional)</label>
                <textarea
                  name="requirements"
                  value={jobData.requirements}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor’s degree, 3+ years experience"
                  rows="3"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Benefits (Optional)</label>
                <textarea
                  name="benefits"
                  value={jobData.benefits}
                  onChange={handleChange}
                  placeholder="e.g., Health insurance, Flexible hours"
                  rows="3"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Application URL (Optional)</label>
                <input
                  type="url"
                  name="apply_url"
                  value={jobData.apply_url}
                  onChange={handleChange}
                  placeholder="e.g., https://company.com/apply"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Hiring Preferences</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Hiring Multiple Candidates</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hiring_multiple"
                    checked={jobData.hiring_multiple}
                    onChange={handleChange}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-[#008080] border-gray-300 rounded focus:ring-[#008080]"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-600">Yes, I want to hire multiple candidates</span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Urgent Hiring</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="urgent_hiring"
                    checked={jobData.urgent_hiring}
                    onChange={handleChange}
                    className="h-4 w-4 sm:h-5 sm:w-5 text-[#008080] border-gray-300 rounded focus:ring-[#008080]"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-gray-600">Yes, this is an urgent hiring need</span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Job Priority</label>
                <select
                  name="job_priority"
                  value={jobData.job_priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Hiring Timeline</label>
                <select
                  name="hiring_timeline"
                  value={jobData.hiring_timeline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="1-2 Weeks">1-2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Remote Work Allowance</label>
                <select
                  name="remote_work_allowance"
                  value={jobData.remote_work_allowance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                >
                  <option value="Fully Remote">Fully Remote</option>
                  <option value="Partially Remote">Partially Remote</option>
                  <option value="No Remote">No Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Interview Rounds</label>
                <select
                  name="interview_rounds"
                  value={jobData.interview_rounds}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                >
                  <option value="1">1 Round</option>
                  <option value="2">2 Rounds</option>
                  <option value="3+">3+ Rounds</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Candidate Availability</label>
                <select
                  name="candidate_availability"
                  value={jobData.candidate_availability}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-[#008080] text-xs sm:text-sm shadow-sm"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-pulse">
          <div className="h-6 sm:h-8 w-1/3 bg-[#008080] rounded-lg mb-6 sm:mb-8"></div>
          <div className="space-y-4 sm:space-y-6">
            <div className="h-4 sm:h-5 w-1/4 bg-[#008080] rounded-lg"></div>
            <div className="space-y-3 sm:space-y-4">
              <div className="h-4 sm:h-5 w-1/3 bg-[#008080] rounded-lg"></div>
              <div className="h-10 sm:h-12 w-full bg-[#008080] rounded-lg"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="h-10 sm:h-12 w-full sm:w-24 bg-[#008080] rounded-lg"></div>
              <div className="h-10 sm:h-12 w-full sm:w-24 bg-[#008080] rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Post a Job</h1>
          <button
            onClick={() => navigate("/employer-dashboard")}
            className="mt-2 sm:mt-0 text-[#008080] text-xs sm:text-sm font-semibold hover:text-[#006666] transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8 sm:mb-10">
          <div className="flex flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-4 overflow-x-auto">
            {["Company", "Job", "Compensation", "Skills", "Preferences"].map((label, index) => (
              <div key={index} className="flex-none text-center min-w-[60px] sm:min-w-[80px]">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 ${
                    step > index + 1
                      ? "bg-[#008080] text-white shadow-md"
                      : step === index + 1
                      ? "bg-[#008080]/20 text-[#008080] border-2 border-[#008080]"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
            <div
              className="bg-[#008080] h-2 sm:h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {message.text && (
          <div
            className={`p-3 sm:p-4 rounded-lg text-xs sm:text-sm mb-6 sm:mb-8 shadow-md transition transition-all duration-300 ${
              message.type === "success"
                ? "bg-[#008080]/10 text-[#008080] border border-[#008080]/20"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          {renderStep()}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-3 bg-[#008080]/10 text-[#008080] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#008080]/20 transition-all duration-200 shadow-md"
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-3 bg-[#008080] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#006666] transition-all duration-200 shadow-md"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-3 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080] hover:bg-[#006666]"
                }`}
              >
                Post Job
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;