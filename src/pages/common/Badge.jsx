import React from 'react'

export default function Badge({status,classes, text}){

   function color(status) {
      if (status === "pending") {
         return "bg-yellow-600";
      }
      if (status === "added") {
         return "bg-blue-600";
      }
      if (status === "paid") {
         return "bg-green-600";
      }
      if (status === "completed") {
         return "bg-green-600";
      }
      if (status === "active") {
         return "bg-green-600";
      }
      if (status === "initiated") {
         return "bg-orange-600";
      }
      if (status === "failed") {
         return "bg-red-600";
      }
      if (status === "canceled") {
         return "bg-gray-600";
      }
      if (status === "refunded") {
         return "bg-purple-600";
      }
      if (status === "intransit") {
         return "bg-indigo-600";
      }
      if (status === "started") {
         return "bg-teal-600";
      }
      if (status === "loaded") {
         return "bg-cyan-600";
      }
      return "bg-gray-400"; // Default color for unknown statuses
   }
   
  return (
    <button disabled className={`${classes} uppercase px-2 py-[2px] min-w-[60px] rounded-[30px]
       text-white text-[10px] text-center ${color(status)}`}>{status} {text}</button>
  )
}
