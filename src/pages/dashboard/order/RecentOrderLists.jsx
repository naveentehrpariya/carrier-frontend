import React, {  useEffect, useState } from 'react'
import Api from '../../../api/Api';

import OrdersFetch from './OrdersFetch';

export default function RecentOrdersLists() {
  return (
   <div className='border-t border-gray-800 pt-8 mt-12'>
      <OrdersFetch isRecent={true} title={"Recently Added"} hideright={true} sortby={"date"} /> 
   </div>
  )
}
