import { useState, useEffect } from "react";
import { User, MapPin, Edit, Linkedin, Github, FileText, Upload, X } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

const Profile = () => {
  const storedUserId = localStorage.getItem("user_id");
  const storedRole = localStorage.getItem("role");
  const token = storedRole === "employer" ? localStorage.getItem("employertoken") : localStorage.getItem("token");

  const [user, setUser] = useState({
    user_id: storedUserId || "",
    name: "",
    location: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    resume_link: "",
    profile_pic: "",
    role: storedRole || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!storedUserId || !token) {
        setError("Please log in to view your profile.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`https://jobportalapi.up.railway.app/api/user/${storedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data;
        setUser(userData);
        setFormData(userData);
        if (!userData.name || !userData.email || !userData.phone) {
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Unable to load your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [storedUserId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      setError(`Please upload a valid ${type === "resume" ? "PDF/Word document" : "image (JPEG/PNG/GIF)"}`);
      type === "resume" ? setSelectedFile(null) : setProfilePicFile(null);
      return;
    }
    type === "resume" ? setSelectedFile(file) : setProfilePicFile(file);
    setError(null);
    setImageError(false);
  };

  const handleSave = async () => {
    if (!storedUserId || !token) {
      setError("Please log in to save changes.");
      return;
    }

    setIsLoading(true);
    const uploadData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "user_id" && key !== "profile_pic" && key !== "resume_link" && key !== "role") {
        uploadData.append(key, value || "");
      }
    });
    if (selectedFile) uploadData.append("resume", selectedFile);
    if (profilePicFile) uploadData.append("profile_pic", profilePicFile);

    try {
      const response = await axios.put(`https://jobportalapi.up.railway.app/api/users/${storedUserId}`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data.user);
      setFormData(response.data.user);
      setIsEditing(false);
      setSelectedFile(null);
      setProfilePicFile(null);
      setImageError(false);
      setPopup({ show: true, message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating profile:", error.response || error);
      setError(error.response?.data?.message || "Failed to save changes. Please try again.");
      setPopup({
        show: true,
        message: error.response?.data?.message || "Failed to save changes.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
    setSelectedFile(null);
    setProfilePicFile(null);
    setError(null);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const closePopup = () => {
    setPopup({ show: false, message: "", type: "" });
  };

  const profileStrength = () => {
    let strength = 0;
    if (user.name) strength += 20;
    if (user.email) strength += 20;
    if (user.phone) strength += 20;
    if (user.location) strength += 10;
    if (user.linkedin) strength += 10;
    if (user.github) strength += 10;
    if (user.resume_link) strength += 10;
    return strength;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          className="flex items-center gap-3 text-indigo-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-semibold">Loading Profile...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              {isEditing ? (
                <div className="group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "profile_pic")}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    aria-label="Upload profile picture"
                  />
                  {profilePicFile || user.profile_pic ? (
                    <img
                      src={profilePicFile ? URL.createObjectURL(profilePicFile) : user.profile_pic}
                      alt="Profile"
                      onError={handleImageError}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-80 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md group-hover:opacity-80 transition-all duration-300">
                      <User size={48} className="text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Upload size={24} className="text-white drop-shadow-md" />
                  </div>
                </div>
              ) : (
                user.profile_pic && !imageError ? (
                  <img
                    src={user.profile_pic}
                    alt="Profile"
                    onError={handleImageError}
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
                    <User size={48} className="text-gray-500" />
                  </div>
                )
              )}
            </div>
            <div className="flex-1 text-white text-center sm:text-left">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="text-2xl font-bold bg-transparent border-b-2 border-white/50 w-full p-1 focus:outline-none focus:border-white placeholder-white/60 transition-all duration-300"
                  placeholder="Your Name"
                  required
                />
              ) : (
                <h1 className="text-2xl font-bold truncate">{user.name || "Your Name"}</h1>
              )}
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="text-sm bg-transparent border-b-2 border-white/50 w-full mt-2 p-1 focus:outline-none focus:border-white placeholder-white/60 transition-all duration-300"
                  placeholder="Your Location"
                />
              ) : (
                <p className="flex items-center gap-2 text-sm mt-1 justify-center sm:justify-start">
                  <MapPin size={16} /> {user.location || "Add your location"}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md font-semibold hover:bg-indigo-50 hover:shadow-md transition-all duration-300 flex items-center gap-2"
              aria-label={isEditing ? "Preview profile" : "Edit profile"}
            >
              <Edit size={18} /> {isEditing ? "Preview" : "Edit"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Strength */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Profile Strength</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileStrength()}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {profileStrength()}% Complete {profileStrength() < 100 && " - Add more details to improve!"}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Contact</h3>
              <div>
                <label className="text-xs font-medium text-gray-600">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300"
                    placeholder="your@email.com"
                    required
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-800 break-all">{user.email || "Add your email"}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300"
                    placeholder="Your phone number"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-800 break-all">{user.phone || "Add your phone"}</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Social Links</h3>
              {isEditing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Linkedin size={20} className="text-indigo-600" />
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github size={20} className="text-gray-800" />
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {user.linkedin ? (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm transition-colors duration-300"
                    >
                      <Linkedin size={20} /> LinkedIn
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <Linkedin size={20} /> Add LinkedIn
                    </p>
                  )}
                  {user.github ? (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-800 hover:text-gray-900 text-sm transition-colors duration-300"
                    >
                      <Github size={20} /> GitHub
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <Github size={20} /> Add GitHub
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <motion.div
                className="p-3 bg-red-100 text-red-700 rounded-md text-sm shadow-sm flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {/* Resume */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Resume</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "resume")}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-700 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 disabled:opacity-50 shadow-sm transition-all duration-300"
                      disabled={isLoading}
                    />
                    {selectedFile && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors duration-300"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-gray-600 truncate">Selected: {selectedFile.name}</p>
                  )}
                </div>
              ) : user.resume_link ? (
                <a
                  href={`http://localhost:5000${user.resume_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-300"
                >
                  <FileText size={20} /> View Resume
                </a>
              ) : (
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <FileText size={20} /> No resume uploaded
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 hover:shadow-md transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md font-medium transition-all duration-300 shadow-md ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700 hover:shadow-lg"
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Popup Modal */}
      {popup.show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`p-5 rounded-lg shadow-xl max-w-sm w-full ${
              popup.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-2">{popup.type === "success" ? "Success!" : "Error"}</h3>
            <p className="text-sm mb-3">{popup.message}</p>
            <button
              onClick={closePopup}
              className={`w-full py-2 rounded-md font-medium transition-all duration-300 ${
                popup.type === "success"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;