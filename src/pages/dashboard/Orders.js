import React from 'react'
import AuthLayout from '../../layout/AuthLayout';
export default function Orders() {
  return (
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Orders</h2>
         </div>
         
         <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
            <h2 className='text-white p-[20px] text-lg mb-4 border-b border-gray-900'>Recent Orders</h2>

            <table className='w-full p-2' cellPadding={'20'}>
               <tr>
                  <th className='text-sm text-gray-400 uppercase border-b border-gray-900'>order id </th>
                  <th className='text-sm text-gray-400 uppercase border-b border-gray-900'>Date Added</th>
                  <th className='text-sm text-gray-400 uppercase border-b border-gray-900'>Customer</th>
                  <th className='text-sm text-gray-400 uppercase border-b border-gray-900'>Payment</th>
                  <th className='text-sm text-gray-400 uppercase border-b border-gray-900'>Pickup</th>
                  <th className='text-sm text-gray-400 uppercase border-b border-gray-900'>Date</th>
                  <th className='text-sm text-gray-400 uppercase border-b border-gray-900'>Carrier</th>
               </tr>
               <tr>
                  <td className='text-sm text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/04/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>Company who is sending you load</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'><div className='badge text-green-600'>Paid</div></td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>11 Alloy CRT</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/03/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>ART CANEDA</td>
               </tr>
               <tr>
                  <td className='text-sm text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/04/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>Company who is sending you load</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'><div className='badge text-green-600'>Paid</div></td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>11 Alloy CRT</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/03/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>ART CANEDA</td>
               </tr>
               <tr>
                  <td className='text-sm text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/04/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>Company who is sending you load</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'><div className='badge text-green-600'>Paid</div></td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>11 Alloy CRT</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/03/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>ART CANEDA</td>
               </tr>
               <tr>
                  <td className='text-sm text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/04/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>Company who is sending you load</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'><div className='badge text-green-600'>Paid</div></td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>11 Alloy CRT</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/03/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>ART CANEDA</td>
               </tr>
               <tr>
                  <td className='text-sm text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/04/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>Company who is sending you load</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'><div className='badge text-green-600'>Paid</div></td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>11 Alloy CRT</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>26/03/2024</td>
                  <td className='text-sm text-gray-200 uppercase border-b border-gray-900'>ART CANEDA</td>
               </tr>
            </table>
         
         </div>
      </AuthLayout>
  )
}
