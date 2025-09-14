import React, { useState, useEffect } from 'react'

const ImageSlider = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // This useEffect hook will run whenever the 'slides' array changes.
    useEffect(() => {
        // Set the current index to the last slide.
        if (slides.length > 0) {
            setCurrentIndex(slides.length - 1);
        }
    }, [slides]);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1
        setCurrentIndex(newIndex);
    }

    const goToNext = () => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }

  return (
    <div className='h-full relative'>
        <div className='absolute top-1/2 left-[32px] -translate-y-1/2 z-10 hover:cursor-pointer text-white text-[45px]' onClick={goToPrevious}>❰</div>
        <div className='absolute top-1/2 right-[32px] -translate-y-1/2 z-10 hover:cursor-pointer text-white text-[45px]' onClick={goToNext}>❱</div>
        <div className='w-full h-full bg-center bg-cover'  style={{backgroundImage: `url(${slides[currentIndex]})`}}></div>
    </div>
  )
}

export default ImageSlider
