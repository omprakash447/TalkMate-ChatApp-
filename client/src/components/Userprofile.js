import { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa'; // Importing Font Awesome User Icon
import { Link, useNavigate } from 'react-router-dom';

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [, setTheme] = useState('indigo'); // Dynamic theme state
  const [rotate, setRotate] = useState(false);
  const [profilePic, setProfilePic] = useState(user.profilePic || null); // Add profilePic state
  const [phone, setPhone] = useState(user.phone || ''); // Manage phone number state
  const [isPhoneEditing, setIsPhoneEditing] = useState(false); // To toggle between view and edit mode for phone number

  useEffect(() => {
    // Set a random theme color every time the component loads (for demo purposes)
    const themes = ['indigo', 'green', 'blue', 'purple', 'red'];
    setTheme(themes[Math.floor(Math.random() * themes.length)]);

    // Add rotation effect when component mounts
    setRotate(true);
  }, []);

  const handleLogout = () => {
    // Clear authentication data (e.g., tokens)
    localStorage.removeItem('authToken'); // Replace with your actual token key
    // Redirect to the login page
    navigate('/login');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a URL for the uploaded image
      const imageURL = URL.createObjectURL(file);
      setProfilePic(imageURL); // Update profilePic state with the uploaded image
    }
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value); // Update phone number state on change
  };

  const savePhoneNumber = () => {
    // Save phone number to localStorage or handle it via API
    localStorage.setItem('userPhone', phone); // Example of saving phone number
    setIsPhoneEditing(false); // Exit editing mode
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-r from-${rotate ? 'blue' : 'purple'}-100 to-${rotate ? 'indigo' : 'green'}-200 flex items-center justify-center py-12 px-6 sm:px-8 transition-transform duration-500`}
    >
      <div
        className={`bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 transform transition-all duration-500 ease-in-out ${
          rotate ? 'rotate-0' : 'rotate-180'
        }`}
      >
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500 bg-gray-200 transform hover:scale-105 transition-all duration-300 ease-in-out">
              {/* Profile Picture or Placeholder */}
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-500" />
              )}
            </div>
            {/* Status or 'Active' Indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">{user.username}</h2>
          <p className="text-sm text-gray-600 mb-4">{user.email}</p>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          {/* Phone Number Section */}
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>Phone Number</span>
            {isPhoneEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="px-3 py-2 w-24 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter phone"
                />
                <button
                  onClick={savePhoneNumber}
                  className="text-sm text-white bg-teal-600 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  Save
                </button>
              </div>
            ) : (
              <span className="font-semibold">{phone || 'Not Set'}</span>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6">
          <label htmlFor="bio" className="text-sm text-gray-700 font-medium">Bio</label>
          <textarea
            id="bio"
            value={user.bio || ''}
            onChange={(e) => user.setBio(e.target.value)} // Assuming bio is a user state
            rows="3"
            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Write something about yourself..."
          />
        </div>

        {/* Image Upload Section */}
        <div className="mt-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-105 transition-all duration-300 ease-in-out"
          />
          <span className="text-sm text-gray-500 mt-2 block">Upload a new profile picture</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {/* Back to Dashboard Button */}
          <Link
            to="/dashboard"
            className={`w-full py-2 px-4 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-105 transition-all duration-300 ease-in-out`}
          >
            <span className="mr-2">🏠</span> Back to Dashboard
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <span className="mr-2">🚪</span> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
