import { memo, useEffect, useState } from "react";
import MobileJobs from "./MobileJobs"; // Adjust path if needed
import DesktopJobs from "./DesktopJobs"; // Adjust path if needed

const Job = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      {isDesktop ? <DesktopJobs /> : <MobileJobs />}
    </div>
  );
};

export default memo(Job);
