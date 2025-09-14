import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const Login = ({ setToken }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const showPasswordVisibility = () =>{
    setShowPassword(!showPassword);
  }

  const handleForm = async (event) => {
    event.preventDefault();
    
    // Checking if the any of the inputs are empty
    if(username === ""){
      console.error("Username has not been filled in")
      return
    }else if(password === ""){
      console.error("Password has not been filled in")
      return
    }

    const loginInformation = {
      username: username,
      password: password
    }
    // I need to somewhat send this information to the back end server then store it into the database
    // so i need to access to the back end server from here?
   try{
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginInformation), // JavaScript object -> JSON string
      })

      if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login Failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token); 
      console.log('Login Successful:', data);
      // I need a new method where I give the new page for the user
      navigate('/');
    } catch(error){
      console.error('Error during Login:', error.message);
    }

    // resetting
    setUsername('');
    setPassword('');
  }

  function createAccount(){
    // some how need to give new component to the html, need to give the createAccount component
  }

  function handleUsername(event){
    setUsername(event.target.value);
  }

  function handlePassword(event){
    setPassword(event.target.value);
  }

  function navigateToCreateAccount(){
    navigate('/sign-up');
  }

  return (
    <div className="flex justify-center">
        <div className="min-h-screen flex items-center justify-center w-full max-w-6xl bg-[#121317]">
          <div className="absolute top-50 bg-gradient-to-r from-[#7573b0] to-[#530cfa]  text-white h-75 w-150 text-center text-[59px] shadow-5xl">
            Login
            <form id="login-form" onSubmit={handleForm} action="">
              <div className='flex items-center justify-center h-15'>
                <div className='flex-1 text-white text-[35px] m-10 w-5'>Username:</div>
                <input id="username" value={username} onChange={handleUsername} className="
                  flex-1
                  bg-white
                  w-75
                  h-10 
                  text-[35px] 
                  m-10 
                  ml-5 
                  border 
                  border-gray-300 
                  shadow-md 
                  rounded-md" 
              type="text" />
              </div>
              <div className='flex items-center justify-center h-15'>
                <div className='flex-1 text-white text-[35px] m-10 w-5'>Password:</div>
                { showPassword ? (
                  <button type='button' className='flex-none text-[15px] ' onClick={showPasswordVisibility}><FontAwesomeIcon icon={faEye} /></button>
                ) : (
                  <button type='button' className='flex-none text-[15px] ' onClick={showPasswordVisibility}><FontAwesomeIcon icon={faEyeSlash} /></button>
                )}
                <input id="password" value={password} onChange={handlePassword} className="
                  flex-1
                  bg-white
                  w-75
                  h-10 
                  text-[35px] 
                  m-10 
                  ml-5 
                  border 
                  border-gray-300 
                  shadow-md 
                  rounded-md"
              type={showPassword ? "text" : "password"} />
              </div>
              <div className='flex justify-center items-center'>
                <button onClick={navigateToCreateAccount} type='button' className='
                  flex-1
                  text-white 
                  bg-gradient-to-r 
                  from-sky-200 to-sky-500 
                  hover:bg-gradient-to-bl 
                  focus:ring-4 
                  focus:outline-none 
                  focus:ring-cyan-300 
                  font-medium
                  text-[25px] 
                  py-2.5 
                  text-center 
                  me-2 mb-2
                  hover:cursor-pointer
                  '
                >Create Account</button>
                <button id="login_button" className='
                  flex-1
                  text-white 
                  bg-gradient-to-r 
                  from-cyan-500 to-blue-500 
                  hover:bg-gradient-to-bl 
                  focus:ring-4 
                  focus:outline-none 
                  focus:ring-cyan-300 
                  font-medium 
                  text-[25px] 
                  py-2.5 
                  text-center 
                  me-2 mb-2
                  hover:cursor-pointer
                  '
                >Login</button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
  )
}
export default Login
