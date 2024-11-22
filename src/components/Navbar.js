import React, { useRef } from 'react';
import './Navbar.css'; // Import your CSS file for styling

const Navbar = ({ aboutRef, csaProgramRef }) => {
  const handleScrollToAbout = () => {
    aboutRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToCsa = () => {
    csaProgramRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="logo">
        {/* Your logo here */}
        <img class="logo" src="/Hometown Harvest Logo (transparent background).png" alt="Your Logo" />
      </div>
      <ul className="nav-links">
        <li onClick={() => scrollToSection(homeRef)}>Home</li>
        <li onClick={handleScrollToCsa}>CSA Program</li>
        <li onClick={handleScrollToAbout}>About</li>
      </ul>
    </nav>
  );
};

export default Navbar;