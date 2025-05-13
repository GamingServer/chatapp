import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { authUser, setAuthUser } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !authUser?.username) return;

    const formData = new FormData();
    formData.append('file', file)
    try {
      const response = await fetch(`http://localhost:8080/api/image/upload/${authUser.username}`, {
        method: 'POST',
        body: formData,
        credentials:'include'
      });

      if (!response.ok) throw new Error('upload failed');

      const data = await response.json();
      const imageURL = data.fileUrl    
      const userData = {
        ...authUser,
        image:imageURL
      }  
      localStorage.setItem('user-data',JSON.stringify(userData))
      setAuthUser(userData)
      setShowUploadPopup(false);
    } catch (error) {
      console.log(error)
      alert('image upload error', error)
    }


  };

  return (
    <header>
      <nav className="flex justify-between items-center px-6 py-4 bg-[#2563eb] text-white shadow-md relative">
        <div className="text-[25px] font-bold">
          My Website
        </div>

        <ul className="hidden md:flex items-center gap-8">
          <Link to="/admin">
            <li className="hover:text-black duration-300">Admin</li>
          </Link>
        </ul>

        <button className="md:hidden z-20" onClick={toggleMenu}>
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M10.03 8.97a.75.75 0 0 0-1.06 1.06L10.94 12l-1.97 1.97a.75.75 0 1 0 1.06 1.06L12 13.06l1.97 1.97a.75.75 0 0 0 1.06-1.06L13.06 12l1.97-1.97a.75.75 0 1 0-1.06-1.06L12 10.94z" />
              <path fill="currentColor" fillRule="evenodd" d="M12 1.25C6.063 1.25 1.25 6.063 1.25 12S6.063 22.75 12 22.75S22.75 17.937 22.75 12S17.937 1.25 12 1.25M2.75 12a9.25 9.25 0 1 1 18.5 0a9.25 9.25 0 0 1-18.5 0" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" fillRule="evenodd" d="M20.75 7a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75m0 5a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75m0 5a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h16a.75.75 0 0 1 .75.75" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className={`md:hidden absolute top-full left-0 w-full bg-[#2563eb] text-white transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-40 py-4' : 'max-h-0 overflow-hidden'}`}>
          <ul className="flex flex-col items-center gap-4">
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              <li className="hover:text-black duration-300">Admin</li>
            </Link>
          </ul>
        </div>

        {authUser?.image ? (
          <div className="relative">
            <img
              src={authUser.image}
              alt="User"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
          </div>
        ) : (
          <button
            className="text-white border-2 border-white p-2 rounded-lg"
            onClick={() => setShowUploadPopup(true)}
          >
            Upload Image
          </button>
        )}

        {showUploadPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl mb-4">Upload a Profile Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border p-2 w-full"
              />
              <button
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
                onClick={() => setShowUploadPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
