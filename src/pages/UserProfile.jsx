import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const EmployerDashboard = () => {
  const { id } = useParams(); // Get ID from URL
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axios.get(` http://localhost:5000/api/apply/${id}`);
        setApplication(response.data);
      } catch (err) {
        console.error("❌ Error fetching application:", err);
        setError("Application not found!");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Employer Dashboard</h2>
      <p><strong>Application ID:</strong> {application.id}</p>
      <p><strong>User ID:</strong> {application.user_id}</p>
      <p><strong>Job ID:</strong> {application.job_id}</p>
      <p><strong>Resume:</strong> <a href={application.resume_link} target="_blank">View Resume</a></p>
      <p><strong>Applied At:</strong> {new Date(application.applied_at).toLocaleString()}</p>
    </div>
  );
};

export default EmployerDashboard;
