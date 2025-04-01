import React, { useRef } from 'react';
import './Navbar.css'; // Import your CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from "@fortawesome/free-solid-svg-icons";
const Navbar = ({ aboutRef, csaProgramRef, whatWeGrowRef, faqsRef}) => {
  const handleScrollToAbout = () => {
    aboutRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToCsa = () => {
    csaProgramRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  const handleScrollToWhatWeGrow = () => {
    whatWeGrowRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  const handleScrollToFAQs = () => {
    faqsRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav className="navbar">
      <div className="logo-container">
        {/* Your logo here */}
        <img class="logo" src="/Hometown Harvest Logo (transparent background).png" alt="Your Logo" />
      </div>
      <div className='mobile menu-container'>
        <FontAwesomeIcon icon={faBars} className='menu'/>
      </div>
      <ul className="nav-links">
          <li onClick={handleScrollToCsa}>CSA Program</li>
          <li onClick={handleScrollToWhatWeGrow}>What We Grow</li>
          <li onClick={handleScrollToFAQs}>FAQs</li>
          <li onClick={handleScrollToAbout}>About</li>
      </ul>
    </nav>
  );
};

export default Navbar;