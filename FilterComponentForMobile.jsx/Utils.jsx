// utils.js
export const formatField = (field) => {
    if (!field) return "Not specified"; // Return a default string if the field is null/undefined
    if (Array.isArray(field)) return field.join(", "); // Join array items with a comma and space
    if (typeof field === "string") {
      // Handle cases where the string might be a JSON array or comma-separated list
      if (field.startsWith("[")) {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed.join(", ") : field;
        } catch {
          // If parsing fails, treat it as a comma-separated string
          return field
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .join(", ");
        }
      }
      // Split by comma, trim whitespace, remove empty items, and join back
      return field
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .join(", ");
    }
    // Convert non-string, non-array values to string (e.g., numbers)
    return String(field);
  };