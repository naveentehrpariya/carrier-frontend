import React from 'react'
import OrdersFetch from './OrdersFetch';
import { Link } from 'react-router-dom';

export default function RecentOrdersLists() {
  return (
   <div className='border-t border-gray-800 pt-8 mt-12'>
      <OrdersFetch 
      sidebtn={<><Link to={'/orders'} className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>View All</Link></>}
      isRecent={true} title={"Recently Added"} 
      hideSearch={true} 
      hideFilter={true} 
      hideExportOrder={true} 
      sortby={"date"} /> 
   </div>
  )
}
