import React from 'react'
import AuthLayout from '../../layout/AuthLayout';
import revanue from '../../img/revenue-graph.png'
import loads from '../../img/loads-stats.png'
export default function Overview() {
  return (
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Overview</h2>
            <div className='filter'>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Weekly</button>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Monthly</button>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Yearly</button>
            </div>

         </div>
         <div className='total-leads mt-4 grid grid-cols-5 gap-3'>
            <div className='lead border border-gray-900 rounded-[30px] p-[20px]'>
               <h2 className='text-gray-300 mb-1 text-xl'>Total Loads</h2>
               <div className='bg-[#D278D5] h-[3px] w-[40px]'></div>
                  <div className='cals mt-3 flex items-center justify-between'>
                     <h2 className='font-bold text-white text-2xl'>120</h2>
                     <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect x="0.5" y="0.5" width="49" height="39" rx="19.5" stroke="white" stroke-opacity="0.2"/>
                     <g opacity="0.7">
                     <path d="M22.5 25L27.5 20L22.5 15" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                     </g>
                     </svg>
                  </div>
            </div>
            <div className='lead border border-gray-900 rounded-[30px] p-[20px]'>
               <h2 className='text-gray-300 mb-1 text-xl'>Pending Loads</h2>
               <div className='bg-[#D278D5] h-[3px] w-[40px]'></div>
                  <div className='cals mt-3 flex items-center justify-between'>
                     <h2 className='font-bold text-white text-2xl'>120</h2>
                     <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect x="0.5" y="0.5" width="49" height="39" rx="19.5" stroke="white" stroke-opacity="0.2"/>
                     <g opacity="0.7">
                     <path d="M22.5 25L27.5 20L22.5 15" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                     </g>
                     </svg>
                  </div>
            </div>
            <div className='lead border border-gray-900 rounded-[30px] p-[20px]'>
               <h2 className='text-gray-300 mb-1 text-xl'>In-Transit Loads</h2>
               <div className='bg-[#D278D5] h-[3px] w-[40px]'></div>
                  <div className='cals mt-3 flex items-center justify-between'>
                     <h2 className='font-bold text-white text-2xl'>120</h2>
                     <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect x="0.5" y="0.5" width="49" height="39" rx="19.5" stroke="white" stroke-opacity="0.2"/>
                     <g opacity="0.7"><path d="M22.5 25L27.5 20L22.5 15" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                     </g></svg>
                  </div>
            </div>
            <div className='lead border border-gray-900 rounded-[30px] p-[20px]'>
               <h2 className='text-gray-300 mb-1 text-xl'>Completed Loads</h2>
               <div className='bg-[#D278D5] h-[3px] w-[40px]'></div>
                  <div className='cals mt-3 flex items-center justify-between'>
                     <h2 className='font-bold text-white text-2xl'>120</h2>
                     <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect x="0.5" y="0.5" width="49" height="39" rx="19.5" stroke="white" stroke-opacity="0.2"/>
                     <g opacity="0.7">
                     <path d="M22.5 25L27.5 20L22.5 15" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                     </g>
                     </svg>
                  </div>
            </div>
            <div className='lead border border-gray-900 rounded-[30px] p-[20px]'>
               <h2 className='text-gray-300 mb-1 text-xl'>Pending Payments</h2>
               <div className='bg-[#D278D5] h-[3px] w-[40px]'></div>
                  <div className='cals mt-3 flex items-center justify-between'>
                     <h2 className='font-bold text-white text-2xl'>120</h2>
                     <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect x="0.5" y="0.5" width="49" height="39" rx="19.5" stroke="white" stroke-opacity="0.2"/>
                     <g opacity="0.7">
                     <path d="M22.5 25L27.5 20L22.5 15" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                     </g>
                     </svg>
                  </div>
            </div>
         </div>

         <div className='revenue-graph flex justify-between mt-6'>
            <div className='left-graphs w-full max-w-[70%] '>
               <img src={revanue} className='w-full block ' alt='total revanue' />
            </div>
            <div className='right-graphs w-full ps-[30px] max-w-[30%]'>
            <img src={loads} className='w-full block ' alt='total revanue' />
            </div>
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