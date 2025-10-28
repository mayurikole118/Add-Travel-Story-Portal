import React from 'react'

import LOGO from "../assets/pictures/travellogo.svg";
import ProfileInfo from './cards/profileInfo';
import { useNavigate } from 'react-router-dom';

const Navbar = ( {userInfo }) => {
    const isToken = localStorage.getItem("token");
    const navigate = useNavigate();
   const onLogout = () => {
    localStorage.clear();
    navigate("/login");
   };

  return (
    <div className='bg-white flex items-centre justify-between px-6 py-2 drop-shadow sticky top-0 z-10'>
        <img src={LOGO} alt="travel story" className="h-9"/>

        { isToken && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}    
        </div>
  );
};

export default Navbar;