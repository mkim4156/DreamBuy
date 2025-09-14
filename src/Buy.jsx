import React, { useState, useCallback, useEffect} from 'react'
import { useDropzone } from 'react-dropzone'
import { useLocation } from 'react-router-dom';
import ImageSlider from './ImageSlider'

const Buy = ({ token, user }) => {

  const location = useLocation();
  const { productDetails } = location.state || {};

  // authenticating:
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('token');
      if(!token){
        console.error("No token found, redirecting to login...");
        return;
      }
  
      try{
        const response = await fetch('http://localhost:8000/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });
  
        const data = await response.json();
        if(!response.ok){
          console.error("Failed to fetch protected data:", data.message);
          if(response.status === 401){
            localStorage.removeItem('token');
          }
        }
        console.log("Protected data:", data);
        //setUsername(data.username);
  
      } catch (err){
        console.error("Network or esrver error:", err);
      }
    }
  
    useEffect(()=>{
       if(token){
        fetchProtectedData();
       }
    }, [token])
    

    useEffect(()=>{
      console.log(productDetails.item_images)
    }, [])

  const submitBuy = async (event) =>{
    event.preventDefault();

    if(!user){
      console.error("Must login to purchase");
      return
    }

    if(user.user_id === productDetails.user_id){
      console.error("Cannot buy your own product!");
    }

  }

  return (
    <div className="flex justify-center">
      <div className="relative min-h-screen flex items-center justify-center w-full max-w-6xl bg-[#1D1E1F]">
        <div className='absolute top-15 flex justify-center items-center bg-[#2D3032]'>
          <div className='flex-1'>
            <div className='w-100 h-90 bg-[#0E1218]'>
              <div className='w-100 h-90 mx-auto'>
                <ImageSlider slides={productDetails.item_images}></ImageSlider>
              </div>
            </div>
          </div>
          <div className='flex-1 w-120 h-90'>
            <form className='flex gap-3 flex-col max-w-95' onSubmit={submitBuy}>

              <div className='flex items-center m-3 '>
                <label className='w-24'>Item Name: </label>
                <label className='text-white' htmlFor="">{productDetails.item_name}</label>
              </div>
              <div className='flex items-center m-3'>
                <label className='w-24'>Condition: </label>
                <div className='flex border-3 rounded-4xl px-3 py-0.5 ml-2 active:bg-[#1F2021]'>
                  <div className='text-white' >{productDetails.item_condition}</div>
                </div>
              </div>
              <div className='flex items-center m-3'>
                <label className='w-24'>Price: </label>
                <div className="text-white">
                  <div>${productDetails.price}</div>
                </div>
              </div>
              <div className='flex items-center m-3'>
                <label className='w-24'>Category: </label>
                <div className='flex flex-wrap max-h-7 items-center'>
                  {productDetails.categories.map( category=> (
                    <div
                      key={category}
                      className={`
                        flex border-3 rounded-4xl px-3 py-0.5 mb-1
                        ml-2 active:bg-[#1F2021] 
                      `}
                    >
                      <div className='flex justify-center items-center text-white text-[13px]'>
                        {category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            <div className='absolute top-95 left-0 w-220 flex'>
              <button className='flex-1 rounded-2xl bg-gradient-to-r from-cyan-50 to-cyan-500 hover:cursor-pointer p-3 font-mono font-bold'>Buy</button>           
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Buy
