import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext.jsx";
const Upload = () => {
  const { removeBg } = useContext(AppContext);
  return (
    <div>
      <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent py-6 md:py-16">
        See the magic. Try Now
      </h1>
      <div className="flex items-center justify-center mb-24">
        <input onChange={e => removeBg(e.target.files[0])} type="file" accept="image/*" id="upload2" hidden />
        <label
          className="inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-pink-600 via-red-500 to-yellow-500 m-auto hover:scale-105 transition-all duration-700 items-center"
          htmlFor="upload2"
        >
          <img width={20} src={assets.upload_btn_icon} alt="upload-icon" />
          <p className="text-white">Upload your image</p>
        </label>
      </div>
    </div>
  );
};

export default Upload;