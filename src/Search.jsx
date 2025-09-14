import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Search = ({ onSearch, searchTerm = "" }) => {
    const [typedValue, setTypedValue] = useState("");

    useEffect(() => {
        setTypedValue(searchTerm);
    }, [searchTerm]);

    const changeTypedValue = (event) =>{
        setTypedValue(event.target.value);
    }

    const searchItem = async (event) =>{
        onSearch(typedValue);
    }

  return (
    <div>
        <div className="flex justify-center items-center mt-10">
            <input placeholder='Search' onChange={changeTypedValue} value={typedValue} className="text-[25px] h-11.5 block w-206 p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ease-in-out" type="text" />
            <button className="p-3 w-22 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-md hover:cursor-pointer" onClick={searchItem}>Search</button>
        </div>
    </div>
  )
}

export default Search
