import { Helmet } from "react-helmet-async";

const SEO = () => {
  return (
    <Helmet>
      <title>JobleAAye - Find Your Dream Job Fast</title>
      <meta name="description" content="Find the best jobs in IT, finance, and marketing. Apply now at JobleAAye and get hired by top companies. Your dream job is just a click away!" />
      <meta name="keywords" content="job search, job portal, career opportunities, IT jobs, finance jobs, remote jobs, hiring now" />
      <meta name="author" content="JobleAAye Team" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.jobleaaye.com" />

      {/* Open Graph Meta Tags (Social Media) */}
      <meta property="og:title" content="JobleAAye - Your Career Starts Here" />
      <meta property="og:description" content="Explore high-paying job opportunities tailored for you at JobleAAye!" />
      <meta property="og:image" content="https://www.jobleaaye.com/images/job-portal-preview.jpg" />
      <meta property="og:image:alt" content="JobleAAye Job Portal Preview" />
      <meta property="og:url" content="https://www.jobleaaye.com" />
      <meta property="og:type" content="website" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="JobleAAye - Find Jobs Easily" />
      <meta name="twitter:description" content="Search and apply for top jobs now on JobleAAye!" />
      <meta name="twitter:image" content="https://www.jobleaaye.com/images/twitter-preview.jpg" />
      <meta name="twitter:image:alt" content="JobleAAye Job Search" />
      <meta name="twitter:site" content="@JobleAAye" />

      {/* Security Headers */}
      <meta http-equiv="X-Content-Type-Options" content="nosniff" />
      <meta http-equiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload" />

      {/* Google Verification */}
      <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
      <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />

      {/* Structured Data (Schema.org) for Jobs */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": "Software Engineer",
          "description": "We are looking for a skilled Software Engineer to join our dynamic team at JobleAAye.",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "JobleAAye",
            "sameAs": "https://www.jobleaaye.com"
          },
          "industry": "Information Technology",
          "employmentType": "FULL_TIME",
          "datePosted": "2025-03-29",
          "validThrough": "2025-06-30",
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Main Street",
              "addressLocality": "New York",
              "addressRegion": "NY",
              "postalCode": "10001",
              "addressCountry": "US"
            }
          },
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": {
              "@type": "QuantitativeValue",
              "value": 85000,
              "unitText": "YEAR"
            }
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
