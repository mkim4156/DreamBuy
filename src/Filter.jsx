import React, { useState, useEffect } from 'react'

const Filter = ( { toggleOn, toggleFilter, minPrice, setMinPrice, maxPrice, setMaxPrice, filteredCategories, setFilteredCategories, priceData, setSubmitFilter, condition, setCondition }) => {
  const categories = ['Electronics', 'Clothing', 'Home', 'Arts', 'Collectibles', 'Sports', 'Outdoors', 'Health', 'Beauty', 'Automotive', 'Pet'];
  const conditionTypes = ["New", "Used"];

  const addFilter = (cate, event) => {
    const checked = event.target.checked;
    if(!checked && filteredCategories.includes(cate)){
      setFilteredCategories(currentCate => {
        return currentCate.filter(item => item !== cate);
      })
      return
    }
    setFilteredCategories(currentCate => [...currentCate, cate])
  
    console.log(cate)  
  }

  const handleMinChange = (e) => {
    const value = Number(e.target.value);
    if (value <= Number(maxPrice) - 5) {
      setMinPrice(value);
    } else {
      setMinPrice(Number(maxPrice) - 5);
    }
  };

  const handleMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value >= Number(minPrice) + 5) {
      setMaxPrice(value);
    } else {
      setMaxPrice(Number(minPrice)+5);
    }
  };  

  const changeMinPrice = (event) =>{
    const value = event.target.value;
    if(!(value < 0) && !(value > 1000)){
      setMinPrice(value);
    }
  }

  const changeMaxPrice = (event) =>{
    const value = event.target.value;
    if(!(value > 1000) && !(value < 0)){
      setMaxPrice(value);
    }
  }

  const changedCondition = (cond) => {
    setCondition(cond);
  }

  const submitFilter = () => {
    if (!(minPrice < maxPrice)){
      console.error("Price Range is incorrect")
    }
    if(!(filteredCategories.length > 0)){
      console.error("No filter checked")
    }

    setSubmitFilter(true);
  }

  useEffect(() => {
    console.log(filteredCategories, minPrice, maxPrice, condition)
  }, [filteredCategories, condition])

  return (
  <div className='relative'>
    <div
        className={`absolute top-25 w-70 h-160 bg-[#131418] shadow-lg transition-all duration-500 ease-in-out ${
          toggleFilter ? '-left-70' : 'left-0 z-0'
        }`}
      >

        <div className="flex flex-wrap p-4 gap-3">
          { categories.map(cate =>(
            <div key={cate} className="flex-1/2 font-bold text-[15px]">
              <div className='flex justify-center'>
                <label htmlFor={cate} className=' hover:cursor-pointer text-white' > 
                  {cate}
                </label>
                <input id={cate} className='ml-2  hover:cursor-pointer' type="checkbox" onClick={(event)=>addFilter(cate, event)}/>
              </div>
            </div>
          ))}
        </div>

        <span className='text-white p-5 font-bold'>Condition:</span>
        <div className='flex justify-center gap-5 mt-1 mb-2'>
          {conditionTypes.map(conditions =>(
            <div key={conditions} className='p-0.5 rounded-full bg-gradient-to-r from-[#4c00ff] to-[#00e1ff]'>
              <button className={`
                hover:cursor-pointer px-6 py-2 hover:bg-gray-800 active:bg-gray-700
                 text-white rounded-full transition-colors duration-200
                  ${conditions === condition ? 'bg-gray-800' : 'bg-gray-900'}`} onClick={()=>changedCondition(conditions)}
              >{conditions}
              </button>
            </div>
          ))}
        </div>

        <span className='text-white p-5 font-bold'>Price Range:</span>

        <div className="relative h-10 mt-1 mr-10 ml-10">
          
          {/* Track range */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-600 rounded-full -translate-y-1/2"></div>
            {/* Highlighted range */}
            <div
              className="absolute top-1/2 h-2 bg-gradient-to-r from-[#4c00ff] to-[#00e1ff] rounded-full -translate-y-1/2"
              style={{
                left: `${(minPrice / 1000) * 100}%`,
                right: `${100 - (maxPrice / 1000) * 100}%`,
              }}
            ></div>

            {/* Min Slider */}
            <input
              type="range"
              min="0"
              max="1000"
              step="5"
              value={minPrice}
              onChange={handleMinChange}
              className="absolute w-full h-10 bg-transparent appearance-none pointer-events-none 
                        [&::-webkit-slider-thumb]:pointer-events-auto 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-[#4c00ff]"
            />

            {/* Max Slider */}
            <input
              type="range"
              min="0"
              max="1000"
              step="5"
              value={maxPrice}
              onChange={handleMaxChange}
              className="absolute w-full h-10 bg-transparent appearance-none pointer-events-none 
                        [&::-webkit-slider-thumb]:pointer-events-auto 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-[#00e1ff]"
            />
          </div>

          <div className='flex mt-1'>
              <div key={priceData[0].name} className='flex-1'>
                <div className='flex justify-center'>
                  <div>
                    <span className='text-white mr-2'>
                      {priceData[0].name}
                    </span>
                    <input className='bg-white w-15 ' placeholder='$0' value={priceData[0].price} onChange={changeMinPrice} type="number" />
                  </div>
                </div>
              </div>
              <div key={priceData[1].name} className='flex-1'>
                <div className='flex justify-center'>
                  <div>
                    <span className='text-white mr-2'>
                      {priceData[1].name}
                    </span>
                    <input className='bg-white w-15 ' placeholder={'$1000'} value={priceData[1].price} onChange={changeMaxPrice} type="number" />
                  </div>
                </div>
              </div>
          </div>
          <button className="
            absolute top-152 left-25 flex h-2 rounded-full -translate-y-1/2 p-5 text-white
            justify-center items-center hover:cursor-pointer group  overflow-hidden
            transition-colors duration-300 ease-in-out hover:bg-[#00e1ff]" onClick={submitFilter}
          >
          <div className="absolute inset-0 bg-gradient-to-r from-[#4c00ff] to-[#00e1ff] transition-opacity duration-800 ease-in-out group-hover:opacity-0"></div>
          <span className="relative z-10">Filter</span>
          </button>
          
        </div>
      
      <div
        className={`absolute top-25 z-30 w-10 h-10 flex flex-col justify-center items-center hover:cursor-pointer transition-all duration-500 ease-in-out ${
          toggleFilter ? '-left-80' : '-left-10 z-88'
        }`}
        onClick={toggleOn}
      >
        <div className="flex justify-center items-center text-4xl text-gray-700 bg-[#131419] w-10 h-10 rounded-l-sm ">
          <div className='bg-gradient-to-r from-[#ffffff] to-[#4c00ff] bg-clip-text text-transparent'>
            {toggleFilter ? '❱❱' : '❰❰'}
          </div>
        </div>
        <div className='absolute top-[47.49px]  flex justify-center items-center bg-[#131419] p-2 h-10 rotate-270 rounded-t-sm font-bold '>
          <div className='bg-gradient-to-r from-[#ffffff] to-[#4c00ff] bg-clip-text text-transparent'>
            Filter
          </div>
        </div>
      </div>
    </div>
        

  )
}

export default Filter
