import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Mail, Building, Factory, Ruler, Calendar } from "lucide-react";

export default function EmployersCompanyProfile() {
  const [employer, setEmployer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    industry: "",
    company_size: "",
  });
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    axios
      .get(`https://jobporatl.onrender.com/api/companyprofile/${userId}`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setEmployer(response.data[0]);
          setFormData(response.data[0]); // Initialize form data with fetched data
        } else {
          console.error("No employer data found");
        }
      })
      .catch((error) => {
        console.error("Error fetching employer profile:", error);
      });
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `https://jobportalapi.up.railway.app/api/companyprofile/${userId}`,
        formData
      );
      setEmployer(response.data); // Update employer data with the response
      setIsEditModalOpen(false); // Close the modal
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  if (!employer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 mt-[-40px]">
      {/* Header */}
      <header className="bg-indigo-700 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Company Profile</h2>
          <p className="text-indigo-100 text-sm mt-1 font-medium">
            View and manage your company details
          </p>
        </div>
      </header>

      {/* Profile Card */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-4 mt-1">
                    <User className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Name
                    </p>
                    <p className="text-gray-800 text-base font-medium">{employer.company_name}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-4 mt-1">
                    <Mail className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-gray-800 text-base font-medium">{employer.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-4 mt-1">
                    <Building className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Company Name
                    </p>
                    <p className="text-gray-800 text-base font-medium">{employer.company_name}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-4 mt-1">
                    <Factory className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Industry
                    </p>
                    <p className="text-gray-800 text-base font-medium">{employer.industry}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-4 mt-1">
                    <Ruler className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Company Size
                    </p>
                    <p className="text-gray-800 text-base font-medium">{employer.company_size}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-600 mr-4 mt-1">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Created At
                    </p>
                    <p className="text-gray-800 text-base font-medium">
                      {new Date(employer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-10 text-center">
              <button
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-md hover:bg-indigo-700 transition-all duration-300 font-semibold text-base shadow-md flex items-center justify-center gap-2 mx-auto"
                onClick={() => setIsEditModalOpen(true)}
              >
                <User className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Edit Company Profile</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Size</label>
                <input
                  type="text"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
