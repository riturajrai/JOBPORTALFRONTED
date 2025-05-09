import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-[10000] w-screen h-screen">
      <motion.div
        className="w-10 h-10 border-4 border-t-transparent border-[#008080] rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default Loader;

