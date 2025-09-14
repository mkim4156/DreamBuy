import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import dream_buy_logo from '../pictures/DreamBuy_icon.png';

const Navbar = ({ token, setUser, setLogged, logged, user }) => {
const navigate = useNavigate();
  const [username, setUsername] = useState("");

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
      setUsername(data.username);
      setUser(data)
      setLogged(true);
    } catch (err){
      console.error("Network or esrver error:", err);
    }
  }

  useEffect(()=>{
     if(token){
      fetchProtectedData();
     }
     else{
      setUsername("")
     }
  }, [token])

 const logOut = () => {
    onClickLogOut();
 }

 const navigateToSignIn = () => {
  navigate('/sign-in');
 }

 const navigateToProfile = () => {
  navigate('/profile');
 }

 const navigateToSellItem = () => {
  navigate('/sell-item');
 }

 const navigateToAboutUs = () => {
  navigate('/about-us');
 }

 const navigateToBrowse = () => {
  if(window.location.pathname === '/browse'){
    window.location.reload();
  } else{
    navigate('/browse');
  }
 }

 const navigateToHome = () => {
  navigate('/');
 }

 return (
    <nav className="flex justify-center">
        <div className="flex justify-between w-full max-w-6xl h-25 bg-[#121317]">
            <div className="flex justify-center items-center">
              <img className="w-20 h-20 hover:cursor-pointer" src={dream_buy_logo} alt="" onClick={navigateToHome}/>
            </div>
            <div className="flex justify-around gap-5 text-white items-center">
              <div className="p-5 font-mono font-bold hover:cursor-pointer" onClick={navigateToBrowse}>Browse</div>
              <div className="p-5 font-mono font-bold hover:cursor-pointer" onClick={navigateToSellItem}>Sell Item</div>
              <div className="p-5 font-mono font-bold hover:cursor-pointer" onClick={navigateToAboutUs}>About Us</div>
            </div>
            <div className="flex justify-around items-center text-white">
              { username && user ? (
                <>
                  <div className="font-mono font-bold hover:cursor-pointer" onClick={navigateToProfile} >Welcome {username}! </div>
                  <img className='w-10 h-10 rounded-full m-2 hover:cursor-pointer' onClick={navigateToProfile} src={user.profile_picture_url} alt=''/>
                </>
              ) : (
                <div className="p-5 font-mono font-bold hover:cursor-pointer" onClick={navigateToSignIn} >Sign In</div>
              )}
              </div>
        </div>
    </nav>
  )
}

export default Navbar
