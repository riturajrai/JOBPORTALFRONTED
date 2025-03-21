import React from "react";
import { Link } from "react-router-dom";

function Employers() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12 mt-[-90px]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Hire with JobLeAaye
        </h2>

        {/* Content */}
        <div className="space-y-4 text-gray-600 text-base leading-relaxed">
          <p>
            Looking to hire skilled professionals? JobLeAaye connects you with a vast pool of talented candidates across
            various industries. With an employer account, you’ll access powerful tools to streamline your hiring process.
          </p>

          <p className="font-medium">
            Start building your dream team today. Sign up as an employer and reach top talent now!
          </p>
        </div>

        {/* Call-to-Action */}
        <Link to="/employer-login">
          <button className="mt-6 w-full bg-indigo-600 text-white py-2.5 px-6 rounded-md hover:bg-indigo-700 transition-all duration-300 font-semibold shadow-md">
            Sign Up as Employer
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Employers;