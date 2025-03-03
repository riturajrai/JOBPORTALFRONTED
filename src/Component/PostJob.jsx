import { useState } from "react";
import axios from "axios";

const JobPostForm = () => {
  const [jobData, setJobData] = useState({
    title: "",
    jobType: "",
    description: "",
    salary: "",
    company: "",
    location: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    Object.entries(jobData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await axios.post("http://localhost:5000/api/jobs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Job Posted:", response.data);
      setMessage("✅ Job Posted Successfully!");
    } catch (error) {
      console.error("❌ Error posting job:", error.response?.data || error);
      setMessage("❌ Error posting job");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xl mt-10 border border-gray-200">
      <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-4">🚀 Post a Job</h2>

      {message && <p className={`text-center mt-2 font-semibold ${message.includes("✅") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Upload Logo */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700">Upload Company Logo</label>
          <input 
            type="file" 
            name="logo" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="border border-gray-300 rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            name="title" 
            placeholder="Job Title" 
            value={jobData.title} 
            onChange={handleChange}
            className="input-field"
          />
          <input 
            type="text" 
            name="jobType" 
            placeholder="Job Type" 
            value={jobData.jobType} 
            onChange={handleChange}
            className="input-field"
          />
          <input 
            type="text" 
            name="salary" 
            placeholder="Salary" 
            value={jobData.salary} 
            onChange={handleChange}
            className="input-field"
          />
          <input 
            type="text" 
            name="company" 
            placeholder="Company Name" 
            value={jobData.company} 
            onChange={handleChange}
            className="input-field"
          />
          <input 
            type="text" 
            name="location" 
            placeholder="Job Location" 
            value={jobData.location} 
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Description */}
        <textarea 
          name="description" 
          placeholder="Job Description" 
          value={jobData.description} 
          onChange={handleChange} 
          rows="4"
          className="w-full border border-gray-300 rounded-md p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300">
          🚀 Post Job
        </button>

      </form>
    </div>
  );
};

export default JobPostForm;
