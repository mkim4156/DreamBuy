import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Search from './Search';
import Filter from './Filter';

const Browse = ( { user, items, setItems }) => {
  const navigate = useNavigate();
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [toggleFilter, setToggleFilter] = useState(false);
  const location = useLocation();

  const [shouldFetch, setShouldFetch] = useState(false);

  // Filtering variables:
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [condition, setCondition] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]) 
  const [submitFilter, setSubmitFilter] = useState(false);

  const priceData = [{ name: 'Min', price: minPrice }, { name: 'Max', price: maxPrice },];

  const fetchItems = async ( page = currentPage, searchedItem = searchTerm, cond = condition, min = minPrice, max = maxPrice, cate = filteredCategories ) => {
    console.log("SEX", min, max, cate)
    
    const condition = cond === "" ? "all" : cond;

    try{
      let url;
      if(!searchedItem && cate.length > 0){
        // Just the filter 
        url = `http://localhost:8000/api/grab-items/filter/${cate}/${condition}/${min}/${max}/${page}`;
        setSubmitFilter(false);
      }
      else if(searchedItem && cate.length === 0) {
        // Searched item
        url = `http://localhost:8000/api/grab-items/search/${searchedItem}/${page}`;
      } 
      else if(searchedItem && cate.length > 0){
        // Searched item with filtering
        console.log("Using Filter + Search")
        url = `http://localhost:8000/api/grab-items/filter/${cate}/${condition}/${min}/${max}/${page}/${searchedItem}`;
        setSubmitFilter(false);
      }
      else{
        // Regular item showcase
        url = `http://localhost:8000/api/grab-items/${page}`;
      }

      const response = await fetch(url);
      if(!response.ok){
        const errorData = await response.json();
        throw new Error(`HTTP Error! Status: ${response.status}. Message: ${errorData.error || 'Unknown error occurred.'}`);
      }

      const data = await response.json();
      console.log("Items fetched successfully: ", data);
      setItems(data.data);
      setPages(Math.ceil(data.totalItems / 20));
      setCurrentPage(page);
    } catch (error){
      console.error("Error in fetching items: ", error);
    }
  }

  // Effect to handle navigation from Home
  useEffect(() => {
    if (location.state?.query) {
      setSearchTerm(location.state.query);
      setCurrentPage(1); // Reset to page 1 for new search
      setShouldFetch(true); // Flag to trigger API call
    }
  }, [location.state]);
      
  // Effect to perform the API call
  useEffect(()=>{
    if(shouldFetch){
      fetchItems(currentPage, searchTerm, condition, minPrice, maxPrice, filteredCategories);
      setShouldFetch(false); // Reset the flag after fetching
    } else {
        // For the initial load or when not triggered by search from Home, just fetch
        fetchItems(currentPage, searchTerm, condition, minPrice, maxPrice, filteredCategories);
    }
  }, [currentPage, searchTerm, submitFilter===true, shouldFetch])

  const navigateToBuyItemPage = (productDetails) =>{
    navigate('/buy-item', { state: { productDetails }});
  }

  const toggleOn = () => {
    setToggleFilter(!toggleFilter);
  }

  const handleSearch = (query) => {
    setSearchTerm(query);
    setCurrentPage(1);
    setShouldFetch(true); // Trigger fetch when user searches from this page
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setShouldFetch(true); // Trigger fetch when page changes
  }
  
  return (
    <div className="flex justify-center"> 
      <Filter toggleOn={toggleOn} toggleFilter={toggleFilter} minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} filteredCategories={filteredCategories} setFilteredCategories={setFilteredCategories} priceData={priceData} setSubmitFilter={setSubmitFilter} condition={condition} setCondition={setCondition}/>
      <div className="min-h-screen flex justify-center w-full max-w-6xl bg-[#121317] relative z-50 ">
        <div className='flex flex-col items-center '>
          <Search onSearch={handleSearch} searchTerm={searchTerm} />
          <div className='flex flex-row flex-wrap justify-start ml-25'>
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <div key={item.id} className='w-50 h-65 bg-[#2D3032] m-5 transform transition-transform duration-500 hover:scale-120'>
                  <div key={index} className='w-50 h-50 bg-center bg-cover hover:cursor-pointer' style={{backgroundImage: `url(${item.item_images[0]})`}} onClick={() => navigateToBuyItemPage(item)}></div>
                  <div className='ml-3 text-white truncate'>{item.item_name}</div>
                  <div className='flex justify-end mr-1.5 text-white'>${item.price}</div>
                </div>
              ))
            ) : (
              <div className='text-white'>No items to display.</div>
            )}
          </div>
          <div className='flex justify-center items-center h-5 w-5 pb-10 mt-2'>
            {Array.from({ length: pages }, (_, index) => (
              <div key={index+1} className='flex-1 text-white hover:cursor-pointer mr-1'onClick={()=>handlePageChange(index + 1)}>
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Browse