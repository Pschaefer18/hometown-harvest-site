// components/Navbar.js
import React from 'react';
import './Navbar.css'; // Import your CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ aboutRef, csaProgramRef, whatWeGrowRef, faqsRef }) => {
  const toggleMenu = () => {
    console.log('Menu toggled'); // For debugging
    document.querySelector('.nav-links').classList.toggle('open');
    };

  const handleScrollToAbout = () => {
    aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    toggleMenu(); // Close the menu after clicking a link (for mobile)
  };

  const handleScrollToCsa = () => {
    csaProgramRef.current.scrollIntoView({ behavior: 'smooth' });
    toggleMenu(); // Close the menu after clicking a link
  };

  const handleScrollToWhatWeGrow = () => {
    whatWeGrowRef.current.scrollIntoView({ behavior: 'smooth' });
    toggleMenu(); // Close the menu after clicking a link
  };

  const handleScrollToFAQs = () => {
    faqsRef.current.scrollIntoView({ behavior: 'smooth' });
    toggleMenu(); // Close the menu after clicking a link
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img
          className="logo" // Use className instead of class in JSX
          src="/Hometown Harvest Logo (transparent background).png"
          alt="Hometown Harvest Logo"
        />
      </div>
      <div className="mobile-menu-container" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} className="menu-icon" />
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