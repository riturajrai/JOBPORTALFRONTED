// ../assets/Icons.jsx
// ../assets/Icons.jsx
import logo from './WhatsApp Image 2025-05-09 at 11.32.20_172e588f.jpg';

export { logo };


// SearchIcon (for searching, e.g., resume search)
export const SearchIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5 text-[#008080]"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// FilterIcon (for filtering options)
export const FilterIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5 text-[#008080]"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

// XIcon (for closing or canceling)
export const XIcon = ({ className }) => (
  <svg
    className={className || "w-6 h-6 text-gray-600"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// ChevronDownIcon (for dropdowns)
export const ChevronDownIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5 text-gray-400"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// BookmarkIcon (for saving jobs)
export const BookmarkIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5 text-gray-600"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

// BriefcaseIcon (for jobs, used in EmployerProfile)
export const BriefcaseIcon = ({ className }) => (
  <svg
    className={className || "w-4 h-4 text-gray-600"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 6h18M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m-6 5h6m-9 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

// ClockIcon (for time-related info)
export const ClockIcon = ({ className }) => (
  <svg
    className={className || "w-4 h-4 text-gray-500"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// MapPinIcon (for location, fixed incomplete path)
export const MapPinIcon = ({ className }) => (
  <svg
    className={className || "w-4 h-4 text-gray-500"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// CalendarIcon (for dates)
export const CalendarIcon = ({ className }) => (
  <svg
    className={className || "w-4 h-4 text-gray-500"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// UsersIcon (for team or people)
export const UsersIcon = ({ className }) => (
  <svg
    className={className || "w-4 h-4 text-gray-500"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

// BuildingIcon (for company or office)
export const BuildingIcon = ({ className }) => (
  <svg
    className={className || "w-4 h-4 text-[#008080]"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

// CheckCircleIcon (for verification or completion)
export const CheckCircleIcon = ({ className }) => (
  <svg
    className={className || "w-4 h-4 text-blue-500"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// BackArrowIcon (for navigation back)
export const BackArrowIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5 text-[#008080]"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

// TechIcon (for technology category)
export const TechIcon = ({ className }) => (
  <svg
    className={className || "w-12 h-12"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

// SalesIcon (for sales category)
export const SalesIcon = ({ className }) => (
  <svg
    className={className || "w-12 h-12"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// MarketingIcon (for marketing category)
export const MarketingIcon = ({ className }) => (
  <svg
    className={className || "w-12 h-12"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
  </svg>
);

// SupportIcon (for support category)
export const SupportIcon = ({ className }) => (
  <svg
    className={className || "w-12 h-12"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

// ApplyIcon (for job applications)
export const ApplyIcon = ({ className }) => (
  <svg
    className={className || "w-10 h-10"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

// TrustedIcon (for trust/verification)
export const TrustedIcon = ({ className }) => (
  <svg
    className={className || "w-10 h-10"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

// SocialIcon (for social media links)
export const SocialIcon = ({ className }) => (
  <svg
    className={className || "w-6 h-6"}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
  </svg>
);

// ArrowRightIcon (for navigation or actions)
export const ArrowRightIcon = ({ className }) => (
  <svg
    className={className || "w-6 h-6"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 17l5-5-5-5"
    />
  </svg>
);

// PencilIcon (for editing, used in EmployerProfile)
export const PencilIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

// BellIcon (for notifications, used in EmployerProfile)
export const BellIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 00-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.052-.595 1.436L4 17h5m6 0a2 2 0 01-4 0m6 0H9"
    />
  </svg>
);

export const DownloadIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5 text-[#008080]"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v4a2 2 0 002 2h12a2 2 0 002-2v-4M16 12l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

export const EyeIcon = ({ className }) => (
  <svg
    className={className || "w-5 h-5 text-[#008080]"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.4 0c-1.5 2.6-4.4 4-9.4 4s-7.9-1.4-9.4-4c1.5-2.6 4.4-4 9.4-4s7.9 1.4 9.4 4z"
    />
  </svg>
)


// pencel
export function ReadingEbook(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="#2196F3" d="M33.5 27c-2.2-3-5.2-5-9.5-5s-7.3 2-9.5 5z"></path>
      <path
        fill="#546E7A"
        d="M34.1 43H13.9c-1.1 0-1.9-.8-2-1.9l-.8-13c0-1.1.9-2.1 2-2.1h21.8c1.2 0 2.1 1 2 2.1l-.8 13c-.1 1.1-.9 1.9-2 1.9"
      ></path>
      <circle cx="34" cy="29" r="1" fill="#B0BEC5"></circle>
      <g fill="#FFB74D">
        <circle cx="24" cy="12" r="8"></circle>
        <path d="M16.1 42.4L15 43.5c-.6.6-1.6.6-2.2 0l-3.3-3.3c-.6-.6-.6-1.6 0-2.2l1.1-1.1c1.3-1.3 3.1-1.3 4.4 0l1.1 1.1c1.2 1.3 1.2 3.2 0 4.4M31.9 38l1.1-1.1c1.3-1.3 3.1-1.3 4.4 0l1.1 1.1c.6.6.6 1.6 0 2.2l-3.3 3.3c-.6.6-1.6.6-2.2 0l-1.1-1.1c-1.2-1.2-1.2-3.1 0-4.4"></path>
      </g>
    </svg>
  )
}

// lowerleftpencel
export function Lowerleftpencil(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="#2B2622"
        d="m75.702 480.187l-55.765 23.617a8.207 8.207 0 0 1-10.758-4.357a8.24 8.24 0 0 1 0-6.401l23.617-55.765c7.05-16.646 26.259-24.426 42.906-17.376s24.426 26.259 17.376 42.906c-3.441 8.124-9.855 14.169-17.376 17.376"
      ></path>
      <path
        fill="#E5AA6E"
        d="M153.573 449.535L46.981 492.678l-26.676-26.676L63.449 359.41z"
      ></path>
      <path
        fill="#FFD469"
        d="m352.023 90.77l70.191 70.191c6.025 6.025 6.025 15.794 0 21.819L157.73 447.263a7.2 7.2 0 0 1-10.182 0l-81.827-81.827a7.2 7.2 0 0 1 0-10.182L330.204 90.77c6.025-6.026 15.794-6.026 21.819 0"
      ></path>
      <path
        fill="#FF6E83"
        d="m450.433 23.129l39.421 39.421c14.522 14.522 14.522 38.066 0 52.588l-33.615 33.615a7.2 7.2 0 0 1-10.182 0L364.23 66.926a7.2 7.2 0 0 1 0-10.182l33.615-33.615c14.522-14.522 38.066-14.522 52.588 0"
      ></path>
      <path
        fill="#B9C5C6"
        d="m366.373 54.6l92.009 92.009l-62.809 62.809l-92.009-92.009z"
      ></path>
      <path
        fill="#96A9B2"
        d="m435.29 169.702l-92.009-92.009l8.33-8.33l92.009 92.009zm-14.781 14.781L328.5 92.474l-8.33 8.33l92.009 92.009z"
      ></path>
    </svg>
  )
}

export function PeopleManGraduateOutline(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="m7.899 19.111l4.063 4.374l4.081-4.393M11.829 4.455q.171.03.342 0l9.913-1.724a.25.25 0 0 0 0-.492L12.171.515a1 1 0 0 0-.342 0L1.916 2.239a.25.25 0 0 0 0 .492zM2 8.485a10.9 10.9 0 0 0-1.482 4.5a.47.47 0 0 0 .468.5h2a.5.5 0 0 0 .5-.538A10.95 10.95 0 0 0 2 8.485m0-5.739v5.74m4 1.999V3.442m12 0v7.043m-12-3a18.98 18.98 0 0 0 12 0m-7.52 7.4a2.175 2.175 0 0 0 3 0m-2.48-3.9a1.09 1.09 0 0 0-1-.5a1.09 1.09 0 0 0-1 .5m6 0a1.09 1.09 0 0 0-1-.5a1.09 1.09 0 0 0-1 .5"></path>
        <path d="M5.98 10.485c-.874.437-.6 2.4.479 2.89a1 1 0 0 1 .574.745c.443 2.644 3.555 4.365 4.947 4.365s4.5-1.72 4.947-4.365a1 1 0 0 1 .574-.746c1.081-.49 1.352-2.452.479-2.889m-1.937 8.607L21 20.737l.018.006a4 4 0 0 1 2.482 2.742M7.9 19.111L3 20.737l-.018.006A4 4 0 0 0 .5 23.485"></path>
      </g>
    </svg>
  )
}

export function UserGraduate(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 448"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M319.4 320.6L224 416l-95.4-95.4C57.1 323.7 0 382.2 0 454.4v9.6c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-9.6c0-72.2-57.1-130.7-128.6-133.8M13.6 79.8l6.4 1.5v58.4c-7 4.2-12 11.5-12 20.3c0 8.4 4.6 15.4 11.1 19.7L3.5 242c-1.7 6.9 2.1 14 7.6 14h41.8c5.5 0 9.3-7.1 7.6-14l-15.6-62.3C51.4 175.4 56 168.4 56 160c0-8.8-5-16.1-12-20.3V87.1l66 15.9c-8.6 17.2-14 36.4-14 57c0 70.7 57.3 128 128 128s128-57.3 128-128c0-20.6-5.3-39.8-14-57l96.3-23.2c18.2-4.4 18.2-27.1 0-31.5l-190.4-46c-13-3.1-26.7-3.1-39.7 0L13.6 48.2c-18.1 4.4-18.1 27.2 0 31.6"
      ></path>
    </svg>
  )
}

export function BookOpen(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="#2F88FF" stroke="#000" strokeLinejoin="round" strokeWidth="4">
        <path d="M5 7H16C20.4183 7 24 10.5817 24 15V42C24 38.6863 21.3137 36 18 36H5V7Z"></path>
        <path d="M43 7H32C27.5817 7 24 10.5817 24 15V42C24 38.6863 26.6863 36 30 36H43V7Z"></path>
      </g>
    </svg>
  )
}

export function Diploma1(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 26"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5 0C3.908 0 3 .908 3 2v19c0 1.092.908 2 2 2h2v3l3-2l3 2v-7.156a2 2 0 0 1-.438.187a1.92 1.92 0 0 1-1.093 1a1.9 1.9 0 0 1-.656.094c-.28 0-.56-.036-.813-.156a1.9 1.9 0 0 1-.813.156c-.224 0-.443-.017-.656-.094a1.94 1.94 0 0 1-1.094-1A2 2 0 0 1 7 18.844V21H5V2h16v19h-5a1 1 0 1 0 0 2h5c1.092 0 2-.908 2-2V2c0-1.092-.908-2-2-2zm2.813 5A1.001 1.001 0 0 0 8 7h10a1 1 0 1 0 0-2H8a1 1 0 0 0-.094 0a1 1 0 0 0-.093 0m0 4A1.001 1.001 0 0 0 8 11h7a1 1 0 1 0 0-2H8a1 1 0 0 0-.094 0a1 1 0 0 0-.093 0M10 12.656a.955.955 0 0 0-.906.656c-.041.014-.086.016-.125.032a.94.94 0 0 0-1.094.094a.95.95 0 0 0-.281 1.062c-.027.041-.038.082-.063.125a.95.95 0 0 0-.781.781a.93.93 0 0 0 .469.969c.007.063-.013.127 0 .188a.945.945 0 0 0-.094 1.062c.194.337.58.525.969.469c.05.047.101.082.156.125c.01.387.257.74.625.875c.364.133.776.005 1.031-.282c.037.002.056.032.094.032c.041 0 .084-.03.125-.032a.93.93 0 0 0 .688.313c.108 0 .206.007.312-.031a.96.96 0 0 0 .625-.875c.053-.042.105-.078.156-.125a.965.965 0 0 0 .969-.469a.945.945 0 0 0-.094-1.063c.014-.06-.009-.126 0-.187a.92.92 0 0 0 .469-.969a.95.95 0 0 0-.781-.781c-.024-.044-.036-.083-.063-.125a.95.95 0 0 0-.281-1.063a.935.935 0 0 0-1.094-.093c-.04-.016-.084-.018-.125-.031a.955.955 0 0 0-.906-.657m0 1.75c.886 0 1.594.708 1.594 1.594c0 .888-.707 1.594-1.594 1.594A1.585 1.585 0 0 1 8.406 16c0-.887.708-1.594 1.594-1.594"
      ></path>
    </svg>
  )
}

export function HomeTwo(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" stroke="#000" strokeLinejoin="round" strokeWidth="4">
        <path
          fill="#2F88FF"
          d="M44 44V20L24 4L4 20L4 44H16V26H32V44H44Z"
        ></path>
        <path strokeLinecap="round" d="M24 44V34"></path>
      </g>
    </svg>
  )
}


export function Clock(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      {...props}
    >
      <circle cx="24" cy="24" r="20" fill="#00ACC1"></circle>
      <circle cx="24" cy="24" r="16" fill="#eee"></circle>
      <path d="M23 11h2v13h-2z"></path>
      <path d="M31.285 29.654L29.66 31.28l-6.504-6.504l1.626-1.627z"></path>
      <circle cx="24" cy="24" r="2"></circle>
      <circle cx="24" cy="24" r="1" fill="#00ACC1"></circle>
    </svg>
  )
}

export function Students(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        color="currentColor"
      >
        <path d="M2.5 6L8 4l5.5 2L11 7.5V9s-.667-.5-3-.5S5 9 5 9V7.5zm0 0v4"></path>
        <path d="M11 8.5v.889c0 1.718-1.343 3.111-3 3.111s-3-1.393-3-3.111V8.5m10.318 2.53s.485-.353 2.182-.353s2.182.352 2.182.352m-4.364 0V10L13.5 9l4-1.5l4 1.5l-1.818 1v1.03m-4.364 0v.288a2.182 2.182 0 1 0 4.364 0v-.289M4.385 15.926c-.943.527-3.416 1.602-1.91 2.947C3.211 19.53 4.03 20 5.061 20h5.878c1.03 0 1.85-.47 2.586-1.127c1.506-1.345-.967-2.42-1.91-2.947c-2.212-1.235-5.018-1.235-7.23 0M16 20h3.705c.773 0 1.387-.376 1.939-.902c1.13-1.076-.725-1.936-1.432-2.357A5.34 5.34 0 0 0 16 16.214"></path>
      </g>
    </svg>
  )
}

export function Logo(){

}
