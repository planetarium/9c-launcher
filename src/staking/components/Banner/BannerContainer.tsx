import React from "react"
import BannerComponent from "./BannerComponent"


const BannerContainer: React.FC = () => {
  return <BannerComponent remaining={'6d'} progress={20}/>
}

export default BannerContainer

