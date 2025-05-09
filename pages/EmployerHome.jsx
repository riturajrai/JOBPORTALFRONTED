import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

// SVG Icons
const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v6H3V3zm4 8h10v10H7V11z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// Mock Data
const dashboardStats = [
  { title: "Active Jobs", value: 12, icon: <BriefcaseIcon />, change: "+2 this week" },
  { title: "Applications", value: 45, icon: <UserIcon />, change: "+12 today" },
  { title: "Shortlisted", value: 8, icon: <ChartIcon />, change: "3 pending review" },
];

const recentApplications = [
  {
    id: 1,
    candidate: "John Doe",
    jobTitle: "Software Engineer",
    status: "Under Review",
    date: "2025-05-01",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    candidate: "Jane Smith",
    jobTitle: "Marketing Manager",
    status: "Interview Scheduled",
    date: "2025-04-30",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: 3,
    candidate: "Robert Johnson",
    jobTitle: "UX Designer",
    status: "New Application",
    date: "2025-05-02",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: 4,
    candidate: "Emily Davis",
    jobTitle: "Data Analyst",
    status: "Offer Sent",
    date: "2025-04-28",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
];

const EmployerHome = () => {
  const navigate = useNavigate();

  const handleAction = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-16">
      {/* Hero Section */}
      <section className=" mt-[-59px]  py-8 sm:py-12 bg-gradient-to-r from-teal-600 to-teal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Welcome back, Employer!
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-100 mb-6 max-w-2xl mx-auto">
              Streamline your hiring process with our powerful recruitment tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => handleAction("/employer/post-job")}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-orange-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-600 transition shadow-md"
              >
                Post a Job
              </button>
              <button
                onClick={() => handleAction("/employer/resume-search")}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-teal-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition shadow-md"
              >
                Search Resumes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8 flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h2>
            <span className="text-xs sm:text-sm text-gray-500">Last updated today</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dashboardStats.map((stat) => (
              <div
                key={stat.title}
                className="bg-gray-50 p-4 sm:p-5 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-teal-50 text-teal-600 mr-3">
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-700">{stat.title}</h3>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 ml-11">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Applications */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8 flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Recent Applications
            </h2>
            <button
              onClick={() => handleAction("/employer/applications")}
              className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Position
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAction(`/employer/applications/${app.id}`)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img className="h-8 w-8 rounded-full" src={app.avatar} alt={app.candidate} />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{app.candidate}</div>
                            <div className="text-xs text-gray-500 sm:hidden">{app.jobTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900">{app.jobTitle}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          app.status === "New Application" ? "bg-blue-100 text-blue-800" :
                          app.status === "Under Review" ? "bg-yellow-100 text-yellow-800" :
                          app.status === "Interview Scheduled" ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-500">{app.date}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "Manage Jobs",
                desc: "View and edit your job postings",
                icon: <BriefcaseIcon />,
                path: "/employer/manage-jobs",
                color: "bg-blue-50 text-blue-600"
              },
              {
                title: "View Analytics",
                desc: "Track your hiring metrics",
                icon: <ChartIcon />,
                path: "/employer/analytics",
                color: "bg-purple-50 text-purple-600"
              },
              {
                title: "Company Profile",
                desc: "Enhance your employer brand",
                icon: <UserIcon />,
                path: "/employer/profile",
                color: "bg-teal-50 text-teal-600"
              },
            ].map((action) => (
              <div
                key={action.title}
                className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 cursor-pointer"
                onClick={() => handleAction(action.path)}
              >
                <div className={`flex items-center justify-center h-10 w-10 rounded-full ${action.color} mb-3`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Need help with your hiring?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-5">
            Our recruitment experts can help you find the perfect candidates faster.
          </p>
          <button className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition shadow-sm">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
};

export default EmployerHome;