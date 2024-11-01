import React from "react";
import { assets } from "../assets/assets";
const Footer = () => {
  return (
    <div className="flex items-center justify-between gap-4 py-3 lg:px-44">
      <img width={150} src={assets.logo} alt="" />
      <p className="flex-1 border-1 border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden">
        Copyright &copy; 2024. All Rights Reserved
      </p>
      <div className="flex items-center gap-4">
        <img
          className="cursor-pointer hover:scale-125 transition-all duration-200"
          width={40}
          src={assets.facebook_icon}
          alt=""
        />
        <img
          className="cursor-pointer hover:scale-125 transition-all duration-200"
          width={40}
          src={assets.twitter_icon}
          alt=""
        />
        <img
          className="cursor-pointer hover:scale-125 transition-all duration-200"
          width={40}
          src={assets.google_plus_icon}
          alt=""
        />
      </div>
    </div>
  );
};

export default Footer;