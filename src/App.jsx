import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar.jsx'
import Login from './Login.jsx'
import Home from './Home.jsx'
import CreateAccount from './CreateAccount.jsx'
import Profile from './Profile.jsx'
import About from './About.jsx'
import Sell from './Sell.jsx'
import Browse from './Browse.jsx'
import Buy from './Buy.jsx'
import ProtectedRoute from './ProtectedRoute.jsx';


function App() {
  const [logged, setLogged] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [items, setItems] = useState(null); // for search and browse


  useEffect(()=>{
    console.log(logged)
  }, [logged])
  return (
    <Router className="bg-sky-200">
      <Navbar token={token} setUser={setUser} setLogged={setLogged} logged={logged} user={user}/>
      <Routes>
        <Route path="/" element={<Home items={items} setItems={setItems}/>}/>
        <Route path="/sign-in" element={<Login setToken={setToken} />}/>
        <Route path="/sign-up" element={<CreateAccount />}/>
        <Route path="/about-us" element={<About />}/>
        <Route path="/browse" element={<Browse user={user} items={items} setItems={setItems} />}/>
        <Route path="/buy-item" element={<Buy token={token} user={user}/>}/>

        { /* Routes only available when user logged in*/}
        <Route element={<ProtectedRoute token={token} />}>
          <Route path="/sell-item" element={<Sell token={token} user={user} />}/>
          <Route path="/profile" element={<Profile token={token} setToken={setToken} user={user} setUser={setUser} setLogged={setLogged} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
