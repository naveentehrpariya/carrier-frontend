import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
import { CiWarning } from "react-icons/ci";

export default function Badge({tooltipcontent, status,classes, text, title, title2, approved, date}){

   function color(status) {
      if (status === "pending") {
         if(title){
            return "text-yellow-600";
         }
         return "bg-yellow-600";
      }
      if (status === "added") {
         if(title){
            return "text-blue-600";
         }
         return "bg-blue-600";
      }
      if (status === "paid") {
         if(title){
            return "text-green-600";
         }
         return "bg-green-700";
      }
      if (status === "completed") {
         if(title){
            return "text-green-600";
         }
         return "bg-green-700";
      }
      if (status === "active") {
         if(title){
            return "text-green-600";
         }
         return "bg-green-700";
      }
      if (status === "initiated") {
         if(title){
            return "text-orange-600";
         }
         return "bg-orange-600";
      }
      if (status === "failed") {
         if(title){
            return "text-red-600";
         }
         return "bg-red-600";
      }
      if (status === "inactive") {
         if(title){
            return "text-red-600";
         }
         return "bg-red-600";
      }
      if (status === "canceled") {
         if(title){
            return "text-gray-600";
         }
         return "bg-gray-600";
      }
      if (status === "refunded") {
         if(title){
            return "text-purple-600";
         }
         return "bg-purple-600";
      }
      if (status === "intransit") {
         if(title){
            return "text-indigo-600";
         }
         return "bg-indigo-600";
      }
      if (status === "started") {
         if(title){
            return "text-teal-600";
         }
         return "bg-teal-600";
      }
      if (status === "loaded") {
         if(title){
            return "text-cyan-600";
         }
         return "bg-cyan-600";
      }
      return "bg-gray-400"; // Default color for unknown statuses
   }
   
  return (
    <div className=" relative group inline-block ">
         <div
            className={`${classes} tooltipwrap inline-block uppercase rounded-[30px] flex items-center text-center hover:!bg-none 
               ${color(status)} ${title ? 'font-bold text-[13px] px-0 ms-1' : 'min-w-[60px] text-white text-[10px] px-2 py-[2px]'} `}
         >
            {status} 
            {text ? <>&nbsp;{text}</> : ''} 
            {date ? (
               <>
               {approved ? (
                  <FaCircleCheck className="ms-1 text-green-400" size={14} />
               ) : (
                  <CiWarning className="ms-1 text-yellow-400" size={17} />
               )}
               </>
            ) : null}
         </div>

         {tooltipcontent ? 
            <div className="tooltip-content absolute bottom-full mb-1 w-full min-w-[200px] max-w-[200px] 
            left-1/2 -translate-x-1/2 bg-white !whitespace-normal  word-break-keep-all
            text-black text-xs rounded-xl p-2  z-10">
               {tooltipcontent}
            </div>
         :''} 
      </div>

  )
}
