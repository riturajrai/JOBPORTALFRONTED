import { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("user_id")); // ✅ सही key

  // ✅ Jobs Fetching Function
  useEffect(() => {
    const fetchUserJobs = async () => {
      if (!userId) {
        setLoading(false);
        setError("❌ User not logged in");
        return;
      }

      try {
        console.log("Fetching jobs for User ID:", userId);
        const response = await axios.get(`http://localhost:5000/api/jobs/user/${userId}`);
        setJobs(response.data);
      } catch (error) {
        console.error("API Error:", error);
        setError(error.response?.data?.error || "Failed to fetch jobs");
      }
      setLoading(false);
    };

    fetchUserJobs();
  }, [userId]);

  // ✅ Local Storage Change Detection
  useEffect(() => {
    const handleStorageChange = () => {
      setUserId(localStorage.getItem("user_id"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Job Delete Function
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
      setError("Failed to delete job");
    }
  };

  // ✅ Loading & Error Handling
  if (loading) return <p className="text-center text-lg font-semibold">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">🛠 Manage Your Jobs</h2>

      {jobs.length === 0 ? (
        <p className="text-center text-gray-500">You haven't posted any jobs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-2xl transition-all">
              <h3 className="text-xl font-bold">{job.title}</h3>
              <p className="text-gray-600">{job.company} - {job.location}</p>
              <p className="text-blue-600 font-semibold text-lg mt-2">💰 {job.salary}</p>
              <div className="flex gap-4 mt-4">
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all">
                  <Pencil className="w-5 h-5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-all"
                >
                  <Trash2 className="w-5 h-5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
