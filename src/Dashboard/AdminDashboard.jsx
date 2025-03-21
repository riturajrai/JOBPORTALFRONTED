import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Menu, X, ChevronDown, ChevronUp, Users, Briefcase, Mail } from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Constants
const API_BASE_URL = "https://jobportalapi.up.railway.app/api";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState({ users: "", jobs: "", contacts: "" });
  const [openSections, setOpenSections] = useState({
    stats: true,
    users: true,
    jobs: true,
    payments: true,
    analytics: true,
    support: true,
    contacts: true,
  });
  const [activeContactTab, setActiveContactTab] = useState("candidates");
  const [currentPage, setCurrentPage] = useState({ users: 1, jobs: 1 });
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    setLoading(true);

    try {
      let validatedJobs = [];
      let validatedUsers = [];

      if (token) {
        const [jobsResponse, usersResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        validatedJobs = jobsResponse.data.map(job => ({
          ...job,
          id: job.id || Date.now() + Math.random(),
          title: job.title || "Untitled",
          company: job.company || "Unknown",
          status: job.status || "pending",
          applications: job.applications || 0,
          created_at: job.created_at || new Date().toISOString(),
        }));

        validatedUsers = usersResponse.data.map(user => ({
          ...user,
          id: user.id || Date.now() + Math.random(),
          name: user.name || "Unnamed User",
          role: user.role || "Unknown",
          status: user.status || "Active",
          email: user.email || "N/A",
        }));
      } else {
        validatedJobs = [
          { id: 1, title: "Software Engineer", company: "Google", status: "active", applications: 10, created_at: "2024-03-08" },
          { id: 2, title: "Backend Developer", company: "Amazon", status: "pending", applications: 5, created_at: "2024-03-07" },
        ];

        validatedUsers = [
          { id: 1, name: "John Doe", role: "candidate", status: "Active", email: "johndoe@example.com" },
          { id: 2, name: "Jane Employer", role: "employer", status: "Active", email: "jane@example.com" },
        ];
      }

      setJobs(validatedJobs);
      setUsers(validatedUsers);

      const uniqueCompanies = new Map();
      validatedJobs.forEach(job => {
        if (!uniqueCompanies.has(job.company)) {
          uniqueCompanies.set(job.company, { 
            name: job.company, 
            jobs: 1,
            activeJobs: job.status === "active" ? 1 : 0,
            applications: job.applications 
          });
        } else {
          const company = uniqueCompanies.get(job.company);
          company.jobs++;
          if (job.status === "active") company.activeJobs++;
          company.applications += job.applications;
        }
      });
      setCompanies([...uniqueCompanies.values()].sort((a, b) => b.jobs - a.jobs));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized Calculations
  const platformStats = useMemo(() => ({
    totalUsers: users.length,
    totalCandidates: users.filter(u => u.role.toLowerCase() === "candidate").length,
    totalEmployers: users.filter(u => u.role.toLowerCase() === "employer").length,
    totalCompanies: companies.length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === "active").length,
    totalApplications: jobs.reduce((sum, job) => sum + (job.applications || 0), 0),
  }), [jobs, users, companies]);

  const chartData = useMemo(() => {
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    return {
      labels: lastSixMonths,
      datasets: [
        {
          label: "Candidate Growth",
          data: lastSixMonths.map((_, i) => users.filter(u => u.role === "candidate" && new Date(u.created_at || Date.now()).getMonth() === new Date().getMonth() - 5 + i).length),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Employer Growth",
          data: lastSixMonths.map((_, i) => users.filter(u => u.role === "employer" && new Date(u.created_at || Date.now()).getMonth() === new Date().getMonth() - 5 + i).length),
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
        {
          label: "Job Postings",
          data: lastSixMonths.map((_, i) => jobs.filter(j => new Date(j.created_at).getMonth() === new Date().getMonth() - 5 + i).length),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [jobs, users]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 12 } } },
      title: { display: true, text: "Platform Activity", font: { size: 16 }, padding: { top: 10, bottom: 10 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { font: { size: 10 } } },
      y: { beginAtZero: true, ticks: { font: { size: 10 }, stepSize: 1 } }
    }
  };

  const filteredUsers = useMemo(() => users.filter(user =>
    (user.name.toLowerCase().includes(search.users.toLowerCase()) ||
    user.role.toLowerCase().includes(search.users.toLowerCase()) ||
    user.email.toLowerCase().includes(search.users.toLowerCase()))
  ), [users, search.users]);

  const filteredJobs = useMemo(() => jobs.filter(job =>
    (job.title.toLowerCase().includes(search.jobs.toLowerCase()) ||
    job.company.toLowerCase().includes(search.jobs.toLowerCase()))
  ), [jobs, search.jobs]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage.users - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage.users]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage.jobs - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage.jobs]);

  const handleUserAction = useCallback(async (userId, action) => {
    const token = localStorage.getItem("admin_token");
    try {
      if (action === "delete" && !window.confirm("Are you sure you want to delete this user?")) return;
      
      await axios.post(`${API_BASE_URL}/users/${userId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { 
          ...user, 
          status: action === "block" ? "Blocked" : action === "approve" ? "Active" : user.status 
        } : user
      ).filter(user => action !== "delete" || user.id !== userId));
    } catch (error) {
      setError(`Failed to ${action} user`);
      console.error(error);
    }
  }, []);

  const handleJobAction = useCallback(async (jobId, action) => {
    const token = localStorage.getItem("admin_token");
    try {
      if (action === "delete" && !window.confirm("Are you sure you want to delete this job?")) return;

      await axios.post(`${API_BASE_URL}/jobs/${jobId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (action === "delete") {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { 
            ...job, 
            status: action === "approve" ? "active" : action === "flag" ? "pending" : "inactive" 
          } : job
        ));
      }
    } catch (error) {
      setError(`Failed to ${action} job`);
      console.error(error);
    }
  }, []);

  const toggleSection = useCallback((section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("admin_token");
      window.location.reload();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mr-4"></div>
      <div className="text-lg font-semibold text-gray-700">Loading Dashboard...</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <p className="text-center text-red-600 text-lg font-semibold mb-4">❌ {error}</p>
      <button 
        onClick={fetchData}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-2">
          {["stats", "users", "jobs", "payments", "analytics", "support", "contacts"].map(section => (
            <a 
              key={section} 
              href={`#${section}`} 
              className="block px-3 py-2 hover:bg-indigo-700 rounded-lg text-sm"
              onClick={() => setSidebarOpen(false)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </a>
          ))}
          <button 
            className="w-full text-left px-3 py-2 hover:bg-indigo-700 rounded-lg text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-900 bg-white p-2 rounded-lg shadow-md">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">Manage platform operations</p>
          </div>

          {/* Platform Statistics */}
          <section id="stats" className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => toggleSection('stats')}>
              <h2 className="text-xl font-semibold text-gray-800">Platform Overview</h2>
              <div className="md:hidden">
                {openSections.stats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            <div className={`${openSections.stats ? 'block' : 'hidden'} md:block mt-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Candidates", value: platformStats.totalCandidates, color: "indigo" },
                  { label: "Total Employers", value: platformStats.totalEmployers, color: "green" },
                  { label: "Total Companies", value: platformStats.totalCompanies, color: "teal" },
                  { label: "Active Jobs", value: platformStats.activeJobs, color: "blue" },
                ].map(stat => (
                  <div key={stat.label} className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className={`text-xl font-bold text-${stat.color}-600`}>{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* User Management */}
          <section id="users" className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => toggleSection('users')}>
              <h2 className="text-xl font-semibold text-gray-800">Manage Users</h2>
              <div className="md:hidden">
                {openSections.users ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            <div className={`${openSections.users ? 'block' : 'hidden'} md:block mt-4`}>
              <input
                type="text"
                value={search.users}
                onChange={(e) => setSearch(prev => ({ ...prev, users: e.target.value }))}
                placeholder="Search by name, role, or email"
                className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 hidden md:table-header-group">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                      <tr key={user.id} className="flex flex-col md:table-row border-b md:border-b-0 p-3 md:p-0">
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Name:</span>
                          <span className="text-sm text-gray-900 truncate max-w-[200px]">{user.name}</span>
                        </td>
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Email:</span>
                          <span className="text-sm text-gray-500 truncate max-w-[200px]">{user.email}</span>
                        </td>
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Role:</span>
                          <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                        </td>
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="md:px-3 md:py-2 flex flex-wrap gap-2 md:table-cell">
                          <span className="md:hidden font-medium text-sm">Actions:</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleUserAction(user.id, "approve")} className="text-green-600 hover:underline text-sm">Approve</button>
                            <button onClick={() => handleUserAction(user.id, "block")} className="text-yellow-600 hover:underline text-sm">Block</button>
                            <button onClick={() => handleUserAction(user.id, "delete")} className="text-red-600 hover:underline text-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="px-3 py-2 text-center text-gray-500 text-sm">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination totalItems={filteredUsers.length} currentPage={currentPage.users} setCurrentPage={page => setCurrentPage(prev => ({ ...prev, users: page }))} itemsPerPage={itemsPerPage} />
            </div>
          </section>

          {/* Job Moderation */}
          <section id="jobs" className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => toggleSection('jobs')}>
              <h2 className="text-xl font-semibold text-gray-800">Moderate Jobs</h2>
              <div className="md:hidden">
                {openSections.jobs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            <div className={`${openSections.jobs ? 'block' : 'hidden'} md:block mt-4`}>
              <input
                type="text"
                value={search.jobs}
                onChange={(e) => setSearch(prev => ({ ...prev, jobs: e.target.value }))}
                placeholder="Search by title or company"
                className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 hidden md:table-header-group">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedJobs.length > 0 ? paginatedJobs.map((job) => (
                      <tr key={job.id} className="flex flex-col md:table-row border-b md:border-b-0 p-3 md:p-0">
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Title:</span>
                          <span className="text-sm text-gray-900 truncate max-w-[200px]" title={job.title}>{job.title}</span>
                        </td>
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Company:</span>
                          <span className="text-sm text-gray-500">{job.company}</span>
                        </td>
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === "active" ? "bg-green-100 text-green-800" :
                            job.status === "inactive" ? "bg-gray-100 text-gray-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                          <span className="md:hidden font-medium text-sm">Applications:</span>
                          <span className="text-sm text-gray-500">{job.applications}</span>
                        </td>
                        <td className="md:px-3 md:py-2 flex flex-wrap gap-2 md:table-cell">
                          <span className="md:hidden font-medium text-sm">Actions:</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleJobAction(job.id, "approve")} className="text-green-600 hover:underline text-sm">Approve</button>
                            <button onClick={() => handleJobAction(job.id, "flag")} className="text-yellow-600 hover:underline text-sm">Flag</button>
                            <button onClick={() => handleJobAction(job.id, "delete")} className="text-red-600 hover:underline text-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="px-3 py-2 text-center text-gray-500 text-sm">No jobs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination totalItems={filteredJobs.length} currentPage={currentPage.jobs} setCurrentPage={page => setCurrentPage(prev => ({ ...prev, jobs: page }))} itemsPerPage={itemsPerPage} />
            </div>
          </section>

          {/* Payments & Subscriptions */}
          <section id="payments" className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => toggleSection('payments')}>
              <h2 className="text-xl font-semibold text-gray-800">Payments & Subscriptions</h2>
              <div className="md:hidden">
                {openSections.payments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            <div className={`${openSections.payments ? 'block' : 'hidden'} md:block mt-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">$5,000</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Active Subscriptions</p>
                  <p className="text-xl font-bold text-blue-600">10</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-gray-600">Pending Payments</p>
                  <p className="text-xl font-bold text-indigo-600">2</p>
                </div>
              </div>
              <button className="mt-4 w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 text-sm">
                View Detailed Reports
              </button>
            </div>
          </section>

          {/* Analytics */}
          <section id="analytics" className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => toggleSection('analytics')}>
              <h2 className="text-xl font-semibold text-gray-800">Analytics Insights</h2>
              <div className="md:hidden">
                {openSections.analytics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            <div className={`${openSections.analytics ? 'block' : 'hidden'} md:block mt-4`}>
              <div className="h-[250px] sm:h-[300px] md:h-[400px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p className="text-gray-600">
                  <strong>Top Industries:</strong> {companies.slice(0, 2).map(c => c.name).join(", ") || "N/A"}
                </p>
                <p className="text-gray-600">
                  <strong>Most Applied Job:</strong> {jobs.sort((a, b) => b.applications - a.applications)[0]?.title || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section id="support" className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => toggleSection('support')}>
              <h2 className="text-xl font-semibold text-gray-800">Support Tickets</h2>
              <div className="md:hidden">
                {openSections.support ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            <div className={`${openSections.support ? 'block' : 'hidden'} md:block mt-4`}>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 1, user: "John Doe", issue: "Login trouble", date: "2025-03-07", status: "Open" },
                ].map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-gray-50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-700">
                        <strong>{ticket.user}</strong>: {ticket.issue}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(ticket.date).toLocaleDateString()}</p>
                      <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${ticket.status === "Open" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <button className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 text-sm">
                      Respond
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Management */}
          <section id="contacts" className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center cursor-pointer md:cursor-default" onClick={() => toggleSection('contacts')}>
              <h2 className="text-xl font-semibold text-gray-800">Contact Management</h2>
              <div className="md:hidden">
                {openSections.contacts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            <div className={`${openSections.contacts ? 'block' : 'hidden'} md:block mt-4`}>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                  onClick={() => setActiveContactTab("candidates")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${activeContactTab === "candidates" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Users className="w-5 h-5" /> Candidates
                </button>
                <button
                  onClick={() => setActiveContactTab("employers")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${activeContactTab === "employers" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Briefcase className="w-5 h-5" /> Employers
                </button>
              </div>
              <input
                type="text"
                value={search.contacts}
                onChange={(e) => setSearch(prev => ({ ...prev, contacts: e.target.value }))}
                placeholder={`Search ${activeContactTab} by name or email`}
                className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 hidden md:table-header-group">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeContactTab === "candidates" ? (
                      users.filter(u => u.role.toLowerCase() === "candidate" && (u.name.toLowerCase().includes(search.contacts.toLowerCase()) || u.email.toLowerCase().includes(search.contacts.toLowerCase()))).length > 0 ? (
                        users.filter(u => u.role.toLowerCase() === "candidate" && (u.name.toLowerCase().includes(search.contacts.toLowerCase()) || u.email.toLowerCase().includes(search.contacts.toLowerCase()))).map(user => (
                          <tr key={user.id} className="flex flex-col md:table-row border-b md:border-b-0 p-3 md:p-0">
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Name:</span>
                              <span className="text-sm text-gray-900 truncate max-w-[200px]">{user.name}</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Email:</span>
                              <span className="text-sm text-gray-500 truncate max-w-[200px]">{user.email}</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Message:</span>
                              <span className="text-sm text-gray-500 truncate max-w-[200px]">Sample inquiry</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Date:</span>
                              <span className="text-sm text-gray-500">{new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Action:</span>
                              <button className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                                <Mail className="w-4 h-4" /> Reply
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="px-3 py-2 text-center text-gray-500 text-sm">No candidate contacts found</td></tr>
                      )
                    ) : (
                      users.filter(u => u.role.toLowerCase() === "employer" && (u.name.toLowerCase().includes(search.contacts.toLowerCase()) || u.email.toLowerCase().includes(search.contacts.toLowerCase()))).length > 0 ? (
                        users.filter(u => u.role.toLowerCase() === "employer" && (u.name.toLowerCase().includes(search.contacts.toLowerCase()) || u.email.toLowerCase().includes(search.contacts.toLowerCase()))).map(user => (
                          <tr key={user.id} className="flex flex-col md:table-row border-b md:border-b-0 p-3 md:p-0">
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Name:</span>
                              <span className="text-sm text-gray-900 truncate max-w-[200px]">{user.name}</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Email:</span>
                              <span className="text-sm text-gray-500 truncate max-w-[200px]">{user.email}</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Message:</span>
                              <span className="text-sm text-gray-500 truncate max-w-[200px]">Sample inquiry</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Date:</span>
                              <span className="text-sm text-gray-500">{new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                            </td>
                            <td className="md:px-3 md:py-2 flex justify-between md:table-cell">
                              <span className="md:hidden font-medium text-sm">Action:</span>
                              <button className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                                <Mail className="w-4 h-4" /> Reply
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="px-3 py-2 text-center text-gray-500 text-sm">No employer contacts found</td></tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ totalItems, currentPage, setCurrentPage, itemsPerPage }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex justify-between items-center mt-4 text-sm">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
      >
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default AdminDashboard;