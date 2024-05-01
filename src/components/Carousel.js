import React from 'react';

const Carousel = ({ images }) => {
  return (
    <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
      <ol className="carousel-indicators">
        {images.map((image, index) => (
          <li key={index} className={index === 0 ? 'active' : ''} data-bs-slide-to={index} data-bs-target="#carouselExampleCaptions"></li>
        ))}
      </ol>
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <img src={image.src} className="d-block w-100" alt={image.alt} />
          </div>
        ))}
      </div>
      <a className="carousel-control-prev" href="#carouselExampleCaptions" role="button" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </a>
      <a className="carousel-control-next" href="#carouselExampleCaptions" role="button" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </a>
    </div>
  );
};

export default Carousel;