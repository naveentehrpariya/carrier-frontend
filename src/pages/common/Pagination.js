import React, { useEffect } from 'react'

export default function Pagination({total, currentPage, fetch, setPage}) {

   const [current, setCurrent] = React.useState(1);
   const [lists, setLists] = React.useState([])
   useEffect(()=>{
      let arr = [];
      for(let i = 1; i <= total; i++){
         arr.push(i);
      }
      setLists(arr);
   },[total]);
   
   const fetchdata = (e)=> {
      console.log(e)
      fetch(e);
      setPage(e);
      setCurrent(e)
   }

  return (
   <>
      {total > 1 ? <div className='pagination mt-6 m-auto' >
         <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button disabled={currentPage <= 1} onClick={()=>fetchdata(currentPage-1)} class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-800 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0">
               <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
            </button>

               {lists && lists.map((item, index)=>{
                  return <button onClick={()=>fetchdata(index+1)} class={`ring-1 ring-inset ring-gray-800 relative z-10 inline-flex items-center ${currentPage === (index+1) ? 'bg-main' : "bg-dark1"} 
                  px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 hover:text-white `}>{index+1}</button>
               })}

            <button disabled={currentPage  === total} onClick={()=>fetchdata(currentPage+1)} class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-800 hover:bg-gray-500  hover:text-white focus:z-20 focus:outline-offset-0">
               <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
            </button>
         </nav>
      </div> : ''}
   </>
  )
}
