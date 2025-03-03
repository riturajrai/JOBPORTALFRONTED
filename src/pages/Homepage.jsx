import { useState } from "react";
import { Briefcase, Building, Bell, User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import LiveChat from "./LiveChat";


const JobPortalHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobAlertEmail, setJobAlertEmail] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ✅ Search Bar */}
      <div className="flex items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <Search size={20} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search for jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border-none outline-none"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
          Search
        </button>
      </div>

      {/* ✅ Icons Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/jobs" className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center hover:shadow-lg transition-all">
          <Briefcase size={40} className="text-blue-500" />
          <p className="mt-2 font-semibold">Job Search</p>
        </Link>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center hover:shadow-lg transition-all">
          <Building size={40} className="text-green-500" />
          <p className="mt-2 font-semibold">Companies</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center hover:shadow-lg transition-all">
          <Bell size={40} className="text-yellow-500" />
          <p className="mt-2 font-semibold">Job Alerts</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center hover:shadow-lg transition-all">
          <User size={40} className="text-purple-500" />
          <p className="mt-2 font-semibold">Profile</p>
        </div>
      </div>

      {/* ✅ Top Companies Hiring Now */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Top Companies Hiring</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Google", "Amazon", "Microsoft", "Tesla"].map((company) => (
            <div key={company} className="bg-gray-200 p-4 rounded-lg text-center font-semibold">
              {company}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Latest Job Listings */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Latest Job Listings</h2>
        <ul className="space-y-2">
          {["Software Engineer at Google", "Data Analyst at Amazon", "UI/UX Designer at Microsoft"].map((job) => (
            <li key={job} className="border-b pb-2">{job}</li>
          ))}
        </ul>
      </div>

      {/* ✅ Job Alerts Subscription */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-semibold mb-2">Get Job Alerts</h2>
        <p className="text-gray-600 mb-4">Subscribe to receive job updates in your inbox.</p>
        <div className="flex">
          <input
            type="email"
            placeholder="Enter your email"
            value={jobAlertEmail}
            onChange={(e) => setJobAlertEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-l-lg outline-none"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-all">
            Subscribe
          </button>
        </div>
      </div>

      {/* ✅ Testimonials */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">What Our Users Say</h2>
        <p className="italic">"This job portal helped me land my dream job!" - John Doe</p>
      </div>
        {/* ✅ Live Chat */}
         <LiveChat />



      {/* ✅ Call-to-Action (CTA) */}
      <div className="mt-6 text-center">
        <Link to="/post-job" className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all">
          Post a Job
        </Link>
      </div>
    </div>
  );
};

export default JobPortalHome;