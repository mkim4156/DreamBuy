import React from 'react'
import { useNavigate } from 'react-router-dom';
import Search from './Search';


const Home = ({ setItems }) => {
  const navigate = useNavigate();

  const handleSearchFromHome = (query) => {
    navigate(`/browse`, { state: { query }});
  }

  return (
    <div className="flex justify-center">
      <div className=" justify-between w-full max-w-6xl min-h-screen  bg-[#121317]">
        <div className='flex font-bold text-9xl bg-gradient-to-r from-[#ffffff] to-[#4c00ff] bg-clip-text text-transparent justify-center items-center'>Dream Buy</div>
        <Search onSearch={handleSearchFromHome} setItems={setItems}/>
      </div>
    </div>

  )
}

export default Home
