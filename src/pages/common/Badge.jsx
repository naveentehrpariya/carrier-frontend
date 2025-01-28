import React from 'react'

export default function Badge({status,classes}){

   function color(status){
      if(status === "pending"){
         return "bg-yellow-600"
      } 
      if(status === "added"){
         return "bg-blue-600"
      } 
      if(status === "completed"){
         return "bg-green-600"
      } 
      if(status === "active"){
         return "bg-green-600"
      } 
   }
  return (
    <button disabled className={` ${classes} uppercase px-2 py-[2px] rounded-[30px] text-white text-[10px] font-bold text-center ${color(status)}`}>{status}</button>
  )
}
