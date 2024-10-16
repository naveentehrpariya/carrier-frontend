import React from 'react'
export default function Nocontent({text}) {
  return (
    <div className='py-12 px-6 text-center w-ful bg-dark2 rounded-[30px]'>
       <h2 className='text-gray-500 font-mona  w-full text-[20px] uppercase text-center' >{text || "Nothing to see"}</h2>
    </div>
  )
}
