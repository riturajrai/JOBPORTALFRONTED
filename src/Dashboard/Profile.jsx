
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useLoader } from "../pages/LoaderContext";
import Loader from "../pages/Loader";

// Custom SVG Icons (unchanged)
const UserIcon = () => (
  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ResumeIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const GraduationCapIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01-.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LanguagesIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.5 14l2.5-2.5M21 5h-6m-2 14l-2.5-2.5m-5 2.5l2.5-2.5M3 19h12" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332-.477-4.5-1.253" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.027-3.063-1.867-3.063-1.872 0-2.159 1.462-2.159 2.971v5.696h-3v-11h2.879v1.495h.041c.401-.761 1.381-1.495 2.841-1.495 3.038 0 3.6 2 3.6 4.597v6.403z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const PortfolioIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);
// Reusable Edit Section Component
const EditSection = ({ section, formData, handleChange, handleArrayChange, addArrayItem, removeArrayItem, handleFileChange, cities, searchTerm, handleCitySearch, handleCitySelect }) => {
  const renderField = (field, placeholder, type = "text", isTextarea = false) => (
    isTextarea ? (
      <textarea
        name={field}
        value={formData[field]}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        rows="4"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        name={field}
        value={formData[field]}
        onChange={handleChange}
        className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder={placeholder}
      />
    )
  );

  const renderArrayField = (field, index, subField, placeholder) => (
    <input
      type="text"
      value={formData[field][index][subField]}
      onChange={(e) => handleArrayChange(e, field, index, subField)}
      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      placeholder={placeholder}
    />
  );

  switch (section) {
    case "header":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          {renderField("name", "Your Name")}
          <input
            type="text"
            value={searchTerm}
            onChange={handleCitySearch}
            className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Search for a city"
          />
          {cities.length > 0 && (
            <ul className="mt-2 bg-white border rounded-lg max-h-40 overflow-y-auto">
              {cities.map((city, index) => (
                <li
                  key={index}
                  onClick={() => handleCitySelect(city.name)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {city.name}
                </li>
              ))}
            </ul>
          )}
          {renderField("phone", "Your Phone", "tel")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "profile_pic")}
            className="mt-2"
          />
        </div>
      );
    case "preferred_job_type":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Job Type</h3>
          <select
            name="preferred_job_type"
            value={formData.preferred_job_type}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select job type</option>
            <option value="Field Sales">Field Sales</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      );
    case "resume":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Resume</h3>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileChange(e, "resume")}
            className="w-full mt-2"
          />
        </div>
      );
    case "experience":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Experience</h3>
          {formData.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              {renderArrayField("experience", index, "title", "Job Title")}
              {renderArrayField("experience", index, "institution", "Company")}
              {renderArrayField("experience", index, "year", "Duration")}
              <button
                onClick={() => removeArrayItem("experience", index)}
                className="text-red-500 mt-2 flex items-center gap-1"
              >
                <XIcon /> Remove
              </button>
            </div>
          ))}
          {formData.experience.length < 2 && (
            <button
              onClick={() => addArrayItem("experience")}
              className="text-teal-600 flex items-center gap-1"
            >
              <LinkIcon /> Add Experience
            </button>
          )}
          {formData.experience.length >= 2 && (
            <p className="text-sm text-gray-500 mt-2">Maximum of 2 experiences reached.</p>
          )}
        </div>
      );
    case "bio":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit About Me</h3>
          {renderField("bio", "Tell us about yourself", "text", true)}
        </div>
      );
    case "education":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="mb-4">
              {renderArrayField("education", index, "title", "Degree")}
              {renderArrayField("education", index, "institution", "Institution")}
              {renderArrayField("education", index, "year", "Year")}
              <button
                onClick={() => removeArrayItem("education", index)}
                className="text-red-500 mt-2 flex items-center gap-1"
              >
                <XIcon /> Remove
              </button>
            </div>
          ))}
          {formData.education.length < 2 && (
            <button
              onClick={() => addArrayItem("education")}
              className="text-teal-600 flex items-center gap-1"
            >
              <LinkIcon /> Add Education
            </button>
          )}
          {formData.education.length >= 2 && (
            <p className="text-sm text-gray-500 mt-2">Maximum of 2 educations reached.</p>
          )}
        </div>
      );
    case "skills":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Skills</h3>
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleArrayChange(e, "skills", index)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Skill"
              />
              <button
                onClick={() => removeArrayItem("skills", index)}
                className="text-red-500"
              >
                <XIcon />
              </button>
            </div>
          ))}
          {formData.skills.length < 2 && (
            <button
              onClick={() => addArrayItem("skills")}
              className="text-teal-600 flex items-center gap-1"
            >
              <LinkIcon /> Add Skill
            </button>
          )}
          {formData.skills.length >= 2 && (
            <p className="text-sm text-gray-500 mt-2">Maximum of 2 skills reached.</p>
          )}
        </div>
      );
    case "certifications":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Certifications</h3>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="mb-4">
              {renderArrayField("certifications", index, "title", "Certification")}
              {renderArrayField("certifications", index, "institution", "Issuer")}
              {renderArrayField("certifications", index, "year", "Year")}
              <button
                onClick={() => removeArrayItem("certifications", index)}
                className="text-red-500 mt-2 flex items-center gap-1"
              >
                <XIcon /> Remove
              </button>
            </div>
          ))}
          {formData.certifications.length < 2 && (
            <button
              onClick={() => addArrayItem("certifications")}
              className="text-teal-600 flex items-center gap-1"
            >
              <LinkIcon /> Add Certification
            </button>
          )}
          {formData.certifications.length >= 2 && (
            <p className="text-sm text-gray-500 mt-2">Maximum of 2 certifications reached.</p>
          )}
        </div>
      );
    case "languages":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Languages</h3>
          {formData.languages.map((language, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={language}
                onChange={(e) => handleArrayChange(e, "languages", index)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Language"
              />
              <button
                onClick={() => removeArrayItem("languages", index)}
                className="text-red-500"
              >
                <XIcon />
              </button>
            </div>
          ))}
          {formData.languages.length < 2 && (
            <button
              onClick={() => addArrayItem("languages")}
              className="text-teal-600 flex items-center gap-1"
            >
              <LinkIcon /> Add Language
            </button>
          )}
          {formData.languages.length >= 2 && (
            <p className="text-sm text-gray-500 mt-2">Maximum of 2 languages reached.</p>
          )}
        </div>
      );
    case "hobbies":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Hobbies</h3>
          {renderField("hobbies", "List your hobbies", "text", true)}
        </div>
      );
    case "contact":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Contact Info</h3>
          {renderField("email", "your@email.com", "email")}
          {renderField("phone", "+1 (123) 456-7890", "tel")}
        </div>
      );
    case "social":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Social Links</h3>
          <div className="flex items-center gap-2 mb-2">
            <LinkedInIcon />
            {renderField("linkedin", "https://linkedin.com/in/yourprofile", "url")}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <GitHubIcon />
            {renderField("github", "https://github.com/yourusername", "url")}
          </div>
          <div className="flex items-center gap-2">
            <PortfolioIcon />
            {renderField("portfolio", "https://yourportfolio.com", "url")}
          </div>
        </div>
      );
    case "preferences":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold">Edit Preferences</h3>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select availability</option>
            <option value="Immediately">Immediately</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="1 month">1 month</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>
      );
    default:
      return null;
  }
};

const Profile = () => {
  const storedUserId = localStorage.getItem("user_id");
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const { setIsLoading } = useLoader();

  const [user, setUser] = useState({
    user_id: storedUserId || "",
    name: "",
    location: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    bio: "",
    resume_link: "",
    profile_pic: "",
    role: storedRole || "",
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    languages: [],
    hobbies: "",
    availability: "",
    preferred_job_type: "",
  });

  const [formData, setFormData] = useState({ ...user });
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState([]);
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // Calculate profile completeness
  useEffect(() => {
    const fields = [
      "name", "location", "email", "phone", "bio", "resume_link", "profile_pic",
      "linkedin", "github", "portfolio", "preferred_job_type", "availability", "hobbies"
    ];
    const arrayFields = ["education", "experience", "skills", "certifications", "languages"];
    let completed = 0;
    let total = fields.length + arrayFields.length;

    fields.forEach(field => {
      if (user[field]) completed++;
    });
    arrayFields.forEach(field => {
      if (user[field]?.length > 0) completed++;
    });

    setProfileCompleteness(Math.round((completed / total) * 100));
  }, [user]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!storedUserId || !token) {
        setError("Please log in to view your profile.");
        return;
      }

      setIsLoading(true);

      try {
        const response = await axios.get(
          `https://jobporatl.onrender.com/api/users/${storedUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userData = {
          ...response.data,
          skills: response.data.skills ? response.data.skills.split(",").map((s) => s.trim()) : [],
          education: response.data.education || [],
          experience: response.data.experience || [],
          certifications: response.data.certifications || [],
          languages: response.data.languages || [],
        };
        setUser(userData);
        setFormData(userData);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [storedUserId, token, setIsLoading]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle array field changes
  const handleArrayChange = (e, field, index, subField) => {
    const newArray = [...formData[field]];
    if (field === "skills" || field === "languages") {
      newArray[index] = e.target.value;
    } else {
      newArray[index] = { ...newArray[index], [subField]: e.target.value };
    }
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  // Add new item to array fields
  const addArrayItem = (field) => {
    if (formData[field].length >= 2) {
      setPopup({
        show: true,
        message: `You can only add up to 2 ${field}.`,
        type: "error",
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "skills" || field === "languages"
          ? [...prev[field], ""]
          : [...prev[field], { title: "", institution: "", year: "" }],
    }));
  };

  // Remove item from array fields
  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Handle file uploads
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    const validTypes = {
      resume: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      profile_pic: ["image/jpeg", "image/png", "image/gif"],
    };
    if (file && !validTypes[type].includes(file.type)) {
      setError(
        `Please upload a valid ${
          type === "resume" ? "PDF/Word document" : "image (JPEG/PNG/GIF)"
        }`
      );
      return;
    }
    type === "resume" ? setSelectedFile(file) : setProfilePicFile(file);
  };

  // Save profile changes
  const handleSave = async () => {
    setIsLoading(true);
    const uploadData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "user_id" && key !== "profile_pic" && key !== "resume_link" && key !== "role") {
        uploadData.append(key, Array.isArray(value) ? JSON.stringify(value) : value || "");
      }
    });
    if (selectedFile) uploadData.append("resume", selectedFile);
    if (profilePicFile) uploadData.append("profile_pic", profilePicFile);

    try {
      const response = await axios.put(
        `https://jobporatl.onrender.com/api/users/${storedUserId}`,
        uploadData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      const updatedUser = {
        ...response.data.user,
        skills: response.data.user.skills
          ? response.data.user.skills.split(",").map((s) => s.trim())
          : [],
        education: response.data.user.education || [],
        experience: response.data.experience || [],
        certifications: response.data.user.certifications || [],
        languages: response.data.user.languages || [],
      };
      setUser(updatedUser);
      setFormData(updatedUser);
      setActiveSection(null);
      setPopup({ show: true, message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      setPopup({
        show: true,
        message: error.response?.data?.message || "Failed to save changes.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle city search
  const handleCitySearch = async (e) => {
    const name = e.target.value;
    setSearchTerm(name);
    setFormData((prev) => ({ ...prev, location: name }));
    if (name.length > 2) {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://jobporatl.onrender.com/api/cities?name=${name}`);
        setCities(response.data.data);
      } catch (error) {
        setError("Unable to fetch cities.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCities([]);
    }
  };

  // Select city from search results
  const handleCitySelect = (cityName) => {
    setSearchTerm(cityName);
    setFormData((prev) => ({ ...prev, location: cityName }));
    setCities([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 h-32 sm:h-40 lg:h-48 relative">
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex justify-between items-end">
            <div className="relative -mb-16 sm:-mb-20">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center">
                {user.profile_pic && !imageError ? (
                  <img
                    src={user.profile_pic}
                    alt={`${user.name}'s profile picture`}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-teal-600" />
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveSection("header")}
              className="bg-white text-teal-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-50 transition mb-4"
            >
              <EditIcon /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg shadow-sm mb-6">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Completeness */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Strength</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-teal-600 h-2.5 rounded-full"
                style={{ width: `${profileCompleteness}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Your profile is {profileCompleteness}% complete. Add more details to stand out!
            </p>
          </div>

          {/* User Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name || "Your Name"}</h1>
            <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-600" />
              {user.location || "Add your location"}
            </p>
            <p className="text-sm text-gray-600 mt-1">{user.email || "Add your email"}</p>
            <p className="text-sm text-gray-600 mt-1">{user.phone || "Add your phone"}</p>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* About Me */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpenIcon /> About Me
                  </h3>
                  <button
                    onClick={() => setActiveSection("bio")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {user.bio || "Add a short bio about yourself"}
                </p>
              </section>

              {/* Experience */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BriefcaseIcon /> Work Experience
                  </h3>
                  <button
                    onClick={() => setActiveSection("experience")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <ul className="space-y-4">
                  {user.experience.length > 0 ? (
                    user.experience.map((exp, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{exp.title}</span> at{" "}
                        {exp.institution}
                        <br />
                        <span className="text-gray-500">{exp.year}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No work experience added</p>
                  )}
                </ul>
              </section>

              {/* Education */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <GraduationCapIcon /> Education
                  </h3>
                  <button
                    onClick={() => setActiveSection("education")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <ul className="space-y-4">
                  {user.education.length > 0 ? (
                    user.education.map((edu, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{edu.title}</span> -{" "}
                        {edu.institution}
                        <br />
                        <span className="text-gray-500">{edu.year}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Add your education details</p>
                  )}
                </ul>
              </section>

              {/* Certifications */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AwardIcon /> Certifications
                  </h3>
                  <button
                    onClick={() => setActiveSection("certifications")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <ul className="space-y-4">
                  {user.certifications.length > 0 ? (
                    user.certifications.map((cert, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{cert.title}</span> -{" "}
                        {cert.institution}
                        <br />
                        <span className="text-gray-500">{cert.year}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Add your certifications</p>
                  )}
                </ul>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Preferred Job Type */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BriefcaseIcon /> Looking for Jobs
                  </h3>
                  <button
                    onClick={() => setActiveSection("preferred_job_type")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {user.preferred_job_type
                    ? `Looking for jobs in ${user.preferred_job_type}`
                    : "Add your preferred job type"}
                </p>
              </section>

              {/* Resume */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ResumeIcon /> Resume
                  </h3>
                  <button
                    onClick={() => setActiveSection("resume")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                {user.resume_link ? (
                  <div className="flex gap-2">
                    <a
                      href={`https://jobporatl.onrender.com${user.resume_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
                    >
                      <ResumeIcon className="text-white" /> View Resume
                    </a>
                    <a
                      href={`https://jobporatl.onrender.com${user.resume_link}`}
                      download
                      className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                    >
                      <UploadIcon className="text-gray-700" /> Download
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <ResumeIcon /> No resume uploaded
                  </p>
                )}
              </section>

              {/* Skills */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CodeIcon /> Skills
                  </h3>
                  <button
                    onClick={() => setActiveSection("skills")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Add your skills</p>
                  )}
                </div>
              </section>

              {/* Languages */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <LanguagesIcon /> Languages
                  </h3>
                  <button
                    onClick={() => setActiveSection("languages")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.languages.length > 0 ? (
                    user.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                      >
                        {language}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Add languages you speak</p>
                  )}
                </div>
              </section>

              {/* Social Links */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
                  <button
                    onClick={() => setActiveSection("social")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <div className="space-y-3">
                  {user.linkedin ? (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-teal-600 text-sm font-medium hover:text-teal-700"
                    >
                      <LinkedInIcon className="text-teal-600" /> LinkedIn
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600 flex items-center gap-3">
                      <LinkedInIcon /> Add LinkedIn
                    </p>
                  )}
                  {user.github ? (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-teal-600 text-sm font-medium hover:text-teal-700"
                    >
                      <GitHubIcon className="text-teal-600" /> GitHub
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600 flex items-center gap-3">
                      <GitHubIcon /> Add GitHub
                    </p>
                  )}
                  {user.portfolio ? (
                    <a
                      href={user.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-teal-600 text-sm font-medium hover:text-teal-700"
                    >
                      <PortfolioIcon className="text-teal-600" /> Portfolio
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600 flex items-center gap-3">
                      <PortfolioIcon /> Add Portfolio
                    </p>
                  )}
                </div>
              </section>

              {/* Preferences */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ClockIcon /> Preferences
                  </h3>
                  <button
                    onClick={() => setActiveSection("preferences")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Availability:</span>{" "}
                    {user.availability || "Add your availability"}
                  </p>
                </div>
              </section>

              {/* Hobbies */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HeartIcon /> Hobbies
                  </h3>
                  <button
                    onClick={() => setActiveSection("hobbies")}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <EditIcon />
                  </button>
                </div>
                <p className="text-sm text-gray-700">
                  {user.hobbies || "Add your hobbies"}
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sliding Edit Panel */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            className="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl p-6 z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <EditSection
              section={activeSection}
              formData={formData}
              handleChange={handleChange}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              handleFileChange={handleFileChange}
              cities={cities}
              searchTerm={searchTerm}
              handleCitySearch={handleCitySearch}
              handleCitySelect={handleCitySelect}
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setActiveSection(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Modal */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-6 rounded-lg shadow-xl w-11/12 max-w-md ${
                popup.type === "success" ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-800"
              }`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-lg font-semibold mb-3">
                {popup.type === "success" ? "Success!" : "Error"}
              </h3>
              <p className="text-sm mb-4">{popup.message}</p>
              <button
                onClick={() => setPopup({ show: false, message: "", type: "" })}
                className={`w-full py-2 rounded-lg font-medium text-sm ${
                  popup.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"
                } hover:bg-opacity-90`}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
