import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Star, 
  MapPin, 
  Users, 
  Globe, 
  Briefcase, 
  Mail, 
  Building2, 
  Calendar, 
  DollarSign, 
  Clock 
} from "lucide-react";

const CompanyProfile = () => {
  const { name } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [visibleReviews, setVisibleReviews] = useState(5); // Limit initial reviews
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000/api/companies";

  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_BASE_URL, {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        });
        console.log("Companies API response:", response.data);

        const companiesArray = Array.isArray(response.data) ? response.data : [response.data];
        const companyData = companiesArray.find(
          (c) => c.company_name?.toLowerCase() === decodeURIComponent(name).toLowerCase()
        );

        if (!companyData) {
          throw new Error("Company not found");
        }

        setCompany({
          id: companyData.id,
          name: companyData.company_name,
          logo: companyData.logo || null,
          about: companyData.about || "Explore opportunities with this company.",
          industry: companyData.industry || "Other",
          headquarters: companyData.headquarters || "Not specified",
          employees: companyData.company_size || "Not specified",
          founded: companyData.founded || null,
          website: companyData.website || `https://${companyData.company_name.toLowerCase().replace(/\s+/g, "")}.com`,
          rating: Number(companyData.rating) || 0,
          reviewsCount: Number(companyData.reviewsCount) || 0,
          jobs: Array.isArray(companyData.jobs) ? companyData.jobs : [],
          reviews: Array.isArray(companyData.reviews) ? companyData.reviews : [],
          email: companyData.email || "N/A",
          contact_name: companyData.contact_name || "Unknown",
        });
      } catch (error) {
        setError(error.message || "Failed to load company profile. Please try again.");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [name]);

  // Handle sorting jobs
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const sortedJobs = company?.jobs
    ? [...company.jobs].sort((a, b) => {
        if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
        if (sortBy === "posted") return new Date(b.posted || 0) - new Date(a.posted || 0);
        return 0;
      })
    : [];

  // Handle review input changes
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  // Submit review
  const submitReview = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0 || !newReview.text.trim()) {
      setSubmitStatus({ type: "error", message: "Please provide a rating and review text." });
      return;
    }

    const reviewData = {
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const updatedCompany = {
        ...company,
        reviews: [...company.reviews, reviewData],
        reviewsCount: company.reviewsCount + 1,
        rating: Number(((company.rating * company.reviewsCount + newReview.rating) / (company.reviewsCount + 1)).toFixed(1)),
      };
      setCompany(updatedCompany);

      await axios.put(`${API_BASE_URL}/${company.id}`, {
        ...updatedCompany,
        jobs: JSON.stringify(updatedCompany.jobs),
        reviews: JSON.stringify(updatedCompany.reviews),
      }, {
        headers: { "Content-Type": "application/json" },
      });

      setSubmitStatus({ type: "success", message: "Review submitted successfully!" });
      setNewReview({ rating: 0, text: "" });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus({ type: "error", message: "Failed to submit review. Please try again." });
      console.error("Review submit error:", error);
    }
  };

  // Render company logo
  const renderLogo = () => {
    if (company?.logo) {
      return (
        <img
          src={company.logo}
          alt={`${company.name} logo`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gray-200 object-contain bg-white p-2"
          loading="lazy"
          onError={(e) => (e.target.style.display = "none")}
        />
      );
    }
    return (
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
        <Building2 className="w-10 h-10 text-gray-400" aria-hidden="true" />
      </div>
    );
  };

  // Render reviews with "View More" functionality
  const renderReviews = () => {
    if (company.reviews.length === 0) {
      return <p className="text-gray-600 text-sm mb-6">No reviews available yet.</p>;
    }

    const reviewsToShow = company.reviews.slice(0, visibleReviews);

    return (
      <div className="space-y-4 mb-6">
        {reviewsToShow.map((review, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 italic leading-relaxed line-clamp-3">"{review.text}"</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
              <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
              <span className="ml-2 text-xs text-gray-500">
                - {review.date || "Unknown date"}
              </span>
            </div>
          </div>
        ))}
        {company.reviews.length > visibleReviews && (
          <button
            onClick={() => setVisibleReviews((prev) => prev + 5)}
            className="mt-4 w-full bg-blue-100 text-blue-600 py-2 rounded-full hover:bg-blue-200 transition-all text-sm font-medium"
          >
            View More Reviews
          </button>
        )}
      </div>
    );
  };

  // Render sticky review form
  const renderReviewForm = () => {
    return (
      <div className="sticky top-20 bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Your Review</h3>
        <form onSubmit={submitReview} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${
                    star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => handleStarClick(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Your Review</label>
            <textarea
              name="text"
              value={newReview.text}
              onChange={handleReviewChange}
              placeholder="Share your experience with this company..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
              maxLength={500}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition-all text-sm font-medium disabled:bg-gray-400"
            disabled={submitStatus?.type === "success"}
          >
            Submit Review
          </button>
        </form>
        {submitStatus && (
          <p
            className={`mt-4 text-sm text-center ${
              submitStatus.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {submitStatus.message}
          </p>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mr-4"></div>
      <p className="text-lg font-semibold text-gray-700">Loading Company Profile...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-12 bg-gray-50 min-h-screen">
      <p className="text-red-600 text-xl font-semibold mb-4">❌ {error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all"
      >
        Retry
      </button>
    </div>
  );

  if (!company) return (
    <div className="text-center py-12 bg-gray-50 min-h-screen">
      <p className="text-gray-600 text-xl">Company not found.</p>
      <Link to="/companies" className="mt-4 text-blue-600 hover:underline">
        Back to Companies
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {renderLogo()}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-base text-gray-600 mt-1 font-medium">{company.industry}</p>
              <div className="flex items-center justify-center sm:justify-start mt-2">
                <span className="text-yellow-400">{'★'.repeat(Math.floor(company.rating))}</span>
                <span className="text-gray-300">{'★'.repeat(5 - Math.floor(company.rating))}</span>
                <span className="ml-2 text-sm text-gray-600">
                  ({company.rating.toFixed(1)} - {company.reviewsCount} reviews)
                </span>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline text-sm font-medium"
                >
                  <Globe className="w-4 h-4 mr-1" /> Visit Website
                </a>
                <span className="flex items-center text-gray-600 text-sm">
                  <Mail className="w-4 h-4 mr-1" /> {company.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/companies")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-all text-sm font-medium"
            >
              Back to Companies
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> About {company.name}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{company.about}</p>
              <p className="mt-3 text-sm text-gray-600">
                <strong>Contact:</strong> {company.contact_name}
              </p>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Company Details</h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span><strong>Headquarters:</strong> {company.headquarters}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span><strong>Size:</strong> {company.employees}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span><strong>Founded:</strong> {company.founded || "N/A"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Jobs Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" /> Open Jobs ({sortedJobs.length})
                </h2>
                {sortedJobs.length > 0 && (
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="p-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  >
                    <option value="title">Sort by: Title</option>
                    <option value="posted">Sort by: Date Posted</option>
                  </select>
                )}
              </div>
              {sortedJobs.length > 0 ? (
                <div className="space-y-4">
                  {sortedJobs.map((job) => (
                    <Link
                      key={job.id || job.title}
                      to={`/job/${job.id || encodeURIComponent(job.title)}`}
                      className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{job.title || "Untitled Job"}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1 truncate">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {job.location || "Not specified"}
                              {job.work_location && ` • ${job.work_location}`}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1 truncate">
                            <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="truncate">{job.salary || "Competitive Pay"}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1 truncate">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>
                              Posted: {job.posted 
                                ? new Date(job.posted).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
                                : "Recently"}
                            </span>
                          </p>
                        </div>
                        <span className="text-blue-600 text-sm font-medium self-center flex-shrink-0">View Job</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No open positions currently.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Employee Reviews ({company.reviews.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reviews List */}
                <div className="md:col-span-2">{renderReviews()}</div>
                {/* Sticky Review Form */}
                <div className="md:col-span-1">{renderReviewForm()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;