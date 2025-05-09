import { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId] = useState(localStorage.getItem("user_id"));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // Fetch jobs from API
  const fetchUserJobs = async () => {
    if (!userId) {
      setLoading(false);
      setError("User not logged in");
      return;
    }
    try {
      const response = await axios.get(` https://jobporatl.onrender.com/api/jobs/user/${userId}`);
      setJobs(response.data);
    } catch (error) {
      console.error("API Error:", error);
      setError(error.response?.data?.error || "Failed to fetch jobs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserJobs();
  }, [userId]);

  // Handle delete job
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(` https://jobporatl.onrender.com/api/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
      setError("Failed to delete job");
    }
  };

  // Handle edit job
  const handleEdit = (job) => {
    setJobToEdit(job);
    setIsEditModalOpen(true);
  };

  // Auto-update job list after editing
  const handleJobUpdate = async () => {
    await fetchUserJobs();
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Manage Jobs</h2>
          <p className="text-indigo-100 text-sm mt-1 font-medium">
            View, edit, or delete your job postings
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <p className="text-center text-red-600 font-medium mb-6">{error}</p>
        )}

        {jobs.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 text-lg font-medium">
              You haven’t posted any jobs yet.
            </p>
            <a
              href="/postjob"
              className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-all font-semibold"
            >
              Post a Job
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  {job.title}
                </h3>
                <div className="space-y-2 text-gray-600 text-sm">
                  <p className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {job.company}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    {job.salary}
                  </p>
                  {job.created_at && (
                    <p className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Posted on {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from triggering
                      handleEdit(job);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from triggering
                      handleDelete(job.id);
                    }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isEditModalOpen && (
          <EditJobForm
            job={jobToEdit}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleJobUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ManageJobs;