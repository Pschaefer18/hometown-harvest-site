import React, { useRef } from 'react';
import './Navbar.css'; // Import your CSS file for styling

const Navbar = () => {
  const homeRef = useRef(null);
  const csaRef = useRef(null);
  const aboutRef = useRef(null);

  const scrollToSection = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="navbar">
      <div className="logo">
        {/* Your logo here */}
        <img class="logo" src="/Hometown Harvest Logo (transparent background).png" alt="Your Logo" />
      </div>
      <ul className="nav-links">
        <li onClick={() => scrollToSection(homeRef)}>Home</li>
        <li onClick={() => scrollToSection(csaRef)}>CSA Program</li>
        <li onClick={() => scrollToSection(aboutRef)}>About</li>
      </ul>
    </nav>
  );
};

export default Navbar;