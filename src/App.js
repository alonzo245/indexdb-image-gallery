import React, { useState, useEffect, useRef } from "react";
import { saveImage, getImages, deleteTable } from "./db";
import "./App.css";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [sliderActive, setSliderActive] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      const storedImages = await getImages();
      setImages(storedImages);
    };
    fetchImages();
  }, []);

  useEffect(() => {
    // Add or remove the "slider-active" class to the body element
    if (sliderActive) {
      document.body.classList.add("slider-active");
      enterFullscreen(); // Request fullscreen mode
    } else {
      document.body.classList.remove("slider-active");
      exitFullscreen(); // Exit fullscreen mode
    }

    // Cleanup on component unmount
    return () => {
      document.body.classList.remove("slider-active");
      exitFullscreen(); // Ensure fullscreen mode is exited
    };
  }, [sliderActive]);

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleSave = async () => {
    if (!selectedFiles.length) return;

    const promises = selectedFiles.map((file, index) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Image = e.target.result;
          await saveImage(base64Image, images.length + index);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    await Promise.all(promises);
    const storedImages = await getImages();
    setImages(storedImages);
    setSelectedFiles([]);
  };

  const handleDeleteAll = async () => {
    await deleteTable();
    setImages([]);
  };

  const openSlider = (index) => {
    setCurrentImageIndex(index);
    setSliderActive(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const closeSlider = () => {
    setSliderActive(false);
  };

  const enterFullscreen = () => {
    const elem = sliderRef.current;
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="container">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      <button onClick={handleSave} disabled={!selectedFiles.length}>
        Save Images
      </button>
      <button
        onClick={handleDeleteAll}
        style={{ marginLeft: "10px", backgroundColor: "#d9534f" }}
      >
        Delete All
      </button>

      <h2>Saved Images</h2>
      <div className="image-gallery">
        {images.map((item, index) => (
          <div key={index}>
            <img
              src={item.image}
              alt={`Stored ${index}`}
              onClick={() => openSlider(index)}
              style={{ cursor: "pointer" }}
            />
            <p>Order: {item.order}</p>
          </div>
        ))}
      </div>

      {sliderActive && (
        <div className="image-slider" onClick={handleNextImage} ref={sliderRef}>
          <img
            src={images[currentImageIndex].image}
            alt={`Slide ${currentImageIndex}`}
          />
          <div className="slider-buttons">
            <button
              className="close-slider"
              onClick={() => {
                closeSlider();
                exitFullscreen();
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
