import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Briefcase, MapPin, DollarSign, FileText, ArrowLeft, Send } from "lucide-react"; 

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to fetch job details and related jobs
  const fetchJobDetails = async (jobId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
      setJob(response.data);
      console.log("Job Data:", response.data); 

      // Fetch related jobs by jobType
      if (response.data?.jobType) {
        const relatedResponse = await axios.get(
          `http://localhost:5000/api/jobs?jobType=${response.data.jobType}&limit=10`
        );
        console.log("Related Jobs:", relatedResponse.data); 
        setRelatedJobs(relatedResponse.data);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      setError("Error fetching job details");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  // Use useMemo to compute 6 random related jobs from the relatedJobs array
  const randomRelatedJobs = useMemo(() => {
    if (relatedJobs.length > 6) {
      // Create a shallow copy, shuffle and slice first 6 elements
      return [...relatedJobs].sort(() => 0.5 - Math.random()).slice(0, 6);
    }
    return relatedJobs;
  }, [relatedJobs]);

  if (loading) return <p className="text-center text-lg font-semibold">⌛ Loading...</p>;
  if (error) return <p className="text-center text-red-500">❌ {error}</p>;
  if (!job) return <p className="text-center text-gray-500">⚠️ Job not found</p>;

  return (
    <div className="container mx-auto p-6">
      {/* Main Job Details */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-3xl mx-auto border border-gray-200">
        {/* Job Header with Logo */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img src={job.logo} alt="Company Logo" className="w-24 h-24 md:w-28 md:h-28 rounded-lg shadow-md border border-gray-300" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" /> {job.title}
            </h2>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <MapPin className="w-5 h-5 text-gray-500" /> {job.company} - {job.location}
            </p>
          </div>
        </div>

        {/* Salary */}
        <p className="text-blue-600 font-semibold text-xl mt-5 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-500" /> Salary: {job.salary}
        </p>

        {/* Description */}
        <p className="text-gray-700 mt-3 flex items-start gap-2">
          <FileText className="w-6 h-6 text-gray-600" /> Description: {job.description}
        </p>
        
        {/* Job Type */}
        <p className="text-gray-700 mt-3 flex items-start gap-2 bg-green-400 w-[150px] rounded-md p-2">
          <FileText className="w-6 h-6 text-gray-600" /> Job: {job.jobType}
        </p>

        {/* Post Date */}
        <p className="text-gray-700 mt-3 flex items-start gap-2">
          <FileText className="w-6 h-6 text-gray-600" /> Post-Date: {job.created_at}
        </p>

        {/* Apply Button */}
        <a
          href={job.apply_link} 
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all w-full md:w-auto"
        >
          <Send className="w-5 h-5" /> Apply Now
        </a>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all w-full md:w-auto"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Jobs
        </button>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">🔗 Related Jobs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomRelatedJobs.map((relatedJob) => (
              <button
                key={relatedJob._id || relatedJob.id} // Ensure unique key
                onClick={() => navigate(`/job/${relatedJob._id || relatedJob.id}`)}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg hover:scale-105 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={relatedJob.logo} alt={relatedJob.company} className="w-14 h-14 rounded-md shadow-md border" />
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-500" /> {relatedJob.title}
                    </h4>
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" /> {relatedJob.company} - {relatedJob.location}
                    </p>
                  </div>
                </div>
                <p className="text-blue-600 font-medium mt-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" /> {relatedJob.salary}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
