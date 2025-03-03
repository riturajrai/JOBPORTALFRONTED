import { useState, useEffect } from "react";
import { User, MapPin, Edit } from "lucide-react";
import axios from "axios";

const Profile = () => {
  const storedUserId = localStorage.getItem("user_id");

  const [user, setUser] = useState({
    user_id: storedUserId || "",
    name: "",
    location: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    resume: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    if (storedUserId) {
      axios
        .get(`http://localhost:5000/api/users/${storedUserId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setUser(response.data);
          setFormData(response.data);
        })
        .catch((error) => console.error("Error fetching profile:", error));
    }
  }, [storedUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    if (!storedUserId) {
      alert("User not authenticated.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/users/${storedUserId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUser(formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white p-4">
      <div className="relative bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg text-center text-black border border-gray-300">
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full hover:bg-yellow-500 transition-all flex items-center gap-2"
          >
            <Edit size={16} />
          </button>
        </div>

        <div className="mb-6">
          <div className="w-28 h-28 mx-auto bg-gray-100 flex items-center justify-center rounded-full shadow-md border-4 border-gray-300">
            <User size={60} className="text-gray-700" />
          </div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-3 text-center border border-gray-300 p-2 w-full rounded-md text-black"
            />
          ) : (
            <h2 className="text-3xl font-bold mt-3">{user.name || "Your Name"}</h2>
          )}
          {isEditing ? (
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-2 text-center border border-gray-300 p-2 w-full rounded-md text-black"
            />
          ) : (
            <p className="flex justify-center items-center gap-1 text-gray-600">
              <MapPin size={16} /> {user.location || "Your Location"}
            </p>
          )}
        </div>

        <div className="text-left space-y-3">
          <p>
            <strong>Email:</strong>{" "}
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md text-black"
              />
            ) : (
              user.email || "your@email.com"
            )}
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md text-black"
              />
            ) : (
              user.phone || "Your Phone Number"
            )}
          </p>
        </div>

        <div className="mt-4">
          <p className="font-semibold text-lg">Social Links</p>
          {isEditing ? (
            <>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md mt-1 text-black"
                placeholder="LinkedIn URL"
              />
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md mt-1 text-black"
                placeholder="GitHub URL"
              />
            </>
          ) : (
            <div className="flex justify-center gap-4 mt-2">
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 font-medium hover:underline transition-all"
                >
                  LinkedIn
                </a>
              )}
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 font-medium hover:underline transition-all"
                >
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-5 flex justify-center gap-4">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(user);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
