import { Link } from "react-router-dom";
import { FaBriefcase, FaRocket, FaUsers, FaSignInAlt, FaArrowLeft } from "react-icons/fa";

const PostJob = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-inter">
    

      {/* Hero Section */}
      <section className="bg-teal-600 text-white py-16 sm:py-24 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Post a Job with JobLeaaye
          </h3>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
            Attract top talent by posting your job openings on our platform. It’s simple, fast, and designed to connect you with the right candidates.
          </p>
          <Link
            to="/employer-login"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-md text-base sm:text-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <FaBriefcase className="mr-2 w-5 h-5" />
            Post a Job Now
          </Link>
        </div>
      </section>

      {/* About Post a Job Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10 sm:mb-12">
            Why Choose JobLeaaye for Job Posting?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <FaRocket className="text-teal-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Fast & Easy Process
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                List your job in just a few steps with our intuitive and streamlined posting process.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <FaUsers className="text-teal-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Reach Top Talent
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Tap into a vast network of skilled professionals actively looking for their next role.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <FaBriefcase className="text-teal-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Customizable Listings
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Add detailed job specs to ensure you attract candidates who match your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-teal-50 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Hire?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
            Sign in to your employer account and start posting your job openings today.
          </p>
          <Link
            to="/employer-login"
            className="inline-flex items-center px-6 py-3 bg-[#008080] text-white rounded-md text-base sm:text-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <FaSignInAlt className="mr-2 w-5 h-5" />
            Sign In to Post
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base text-gray-300">
            © {new Date().getFullYear()} JobLeaaye. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PostJob;