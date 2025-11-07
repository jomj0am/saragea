"use client"

import React from 'react'
import Lottie from "lottie-react";
import animationData from '../../../public/assets/lottie/Not Found.json'

export const Nodata = () => {
  return (
     <Lottie animationData={animationData} className="w-full max-w-[16rem] mx-auto -my-8" />

  )
}

