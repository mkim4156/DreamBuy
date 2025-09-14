import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const CreateAccount = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');

  function togglePasswordVisibility1(){
    setShowPassword1(!showPassword1);
  };

  function togglePasswordVisibility2(){
    setShowPassword2(!showPassword2);
  };

  async function handleForm(event){
    event.preventDefault();
    
    // Checking if the any of the inputs are empty
    if(username === ""){
      console.error("Username has not been filled in")
      return
    }else if(password === ""){
      console.error("Password has not been filled in")
      return
    }else if (confirmPassword === ""){
      console.error("Confirm Password has not been filled in")
      return
    }

    // Checking if passwords are the same
    if(password !== confirmPassword){
      console.error("Password does not match!");
      return
    }
    // confirm if password and confirm password are the same password
    // if not give error

    const loginInformation = {
      username: username,
      password: password
    }
    // I need to somewhat send this information to the back end server then store it into the database
    // so i need to access to the back end server from here?
    try{
      const response = await fetch('http://localhost:8000/api/createaccount', {
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
      console.log('Create Account Successful:', data);
      navigate('/sign-in')
    } catch(error){
      console.error('Error during Creating:', error.message);
    }


    // resetting
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  function handleUsername(event){
    setUsername(event.target.value);
    console.log(username)
  }

  function handlePassword(event){
    setPassword(event.target.value);
  }

  function handleConfirmPassword(event){
    setConfirmPassword(event.target.value);
  }

  function navigateToLogin(){
    navigate('/sign-in');
  }

  return (   
    <div className="flex justify-center">
      <div className="min-h-screen flex items-center justify-center w-full max-w-6xl bg-[#121317]">
        <div className="absolute top-50 bg-gradient-to-r from-[#7573b0] to-[#530cfa] text-white h-85 w-150 text-center text-[59px] shadow-2xl">
          Create Account
          <form id="login-form" onSubmit={handleForm} action="">
            <div className='flex items-center justify-center h-15'>
              <div className='flex-1 text-white text-[18px] m-10 w-5'>Username:</div>
              <input id="create-username" value={username} onChange={handleUsername} className="
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
                rounded-md
                " 
            type="text" />
            </div>
            <div className='flex items-center justify-center h-15'>
              <div className='flex-1 text-white text-[18px] m-10 w-5'>Password:</div>
              { showPassword1 ? (
                <button type='button' className='flex-none text-[15px] ' onClick={togglePasswordVisibility1}><FontAwesomeIcon icon={faEye} /></button>
              ) : (
                <button type='button' className='flex-none text-[15px] ' onClick={togglePasswordVisibility1}><FontAwesomeIcon icon={faEyeSlash} /></button>
              )}
              <input id="create-password" value={password} onChange={handlePassword} className="
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
          type={showPassword1 ? "text" : "password"} />
            </div>
            <div className='flex items-center justify-center h-15'>
              <div className='flex-1 text-white text-[18px] m-10 w-5'>Confirm Password:</div>
              { showPassword2 ? (
                <button type='button' className='flex-none text-[15px] ' onClick={togglePasswordVisibility2}><FontAwesomeIcon icon={faEye} /></button>
              ) : (
                <button type='button' className='flex-none text-[15px] ' onClick={togglePasswordVisibility2}><FontAwesomeIcon icon={faEyeSlash} /></button>
              )}
              <input id="confirm-password" value={confirmPassword} onChange={handleConfirmPassword} className="
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
          type={showPassword2 ? "text" : "password"} />
            </div>
            <div className='flex'>
              <button id='back-button' type='button' onClick={navigateToLogin} className='
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
              >Back</button>
              <button id="create-button" onClick={handleForm} className='
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
              >Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAccount
