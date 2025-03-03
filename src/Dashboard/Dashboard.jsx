import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <header className="w-full bg-blue-600 py-4 shadow-md">
        <h1 className="text-white text-2xl text-center font-bold">Admin Dashboard</h1>
      </header>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-11/12 max-w-4xl">
        {/* Post Job */}
        <Link to="/postjob" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Post Job</h2>
          <p className="text-gray-600">Create a new job listing.</p>
        </Link>

        {/* Manage Jobs */}
        <Link to="/manage-jobs" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
          <h2 className="text-xl font-bold text-blue-600 mb-2">Manage Jobs</h2>
          <p className="text-gray-600">Edit or delete existing jobs.</p>
        </Link>

        {/* View Applications */}
        <Link to="/view-applications" className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
          <h2 className="text-xl font-bold text-blue-600 mb-2">View Applications</h2>
          <p className="text-gray-600">See job applications from candidates.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
