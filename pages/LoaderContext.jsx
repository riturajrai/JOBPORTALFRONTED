import { createContext, useContext, useState } from "react";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(true); // Timer ke liye

  return (
    <LoaderContext.Provider value={{ isLoading, setIsLoading, manualLoading, setManualLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);

  