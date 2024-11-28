import React from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import AddCarrier from './AddCarrier';
export default function Carriers() {
  return (
      <AuthLayout> 
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Carriers</h2>
            <AddCarrier />
         </div>
         <div className='recent-orders overflow-hidden mt-6 border border-gray-900 rounded-[30px]'>
            <table className='w-full p-2' cellPadding={'20'}>
               <tr>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer ID</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Company</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Email</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Phone</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Action</th>
               </tr>
               <tr>
                  <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Company Name</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Jack Smith</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>name@company.com</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>+1 2348923489</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Edit</td>
               </tr>
               <tr>
                  <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Company Name</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Jack Smith</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>name@company.com</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>+1 2348923489</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Edit</td>
               </tr>
               <tr>
                  <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Company Name</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Jack Smith</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>name@company.com</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>+1 2348923489</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Edit</td>
               </tr>
               <tr>
                  <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>#758476</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Company Name</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Jack Smith</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>name@company.com</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>+1 2348923489</td>
                  <td className='text-sm text-start text-gray-200 uppercase border-b border-gray-900'>Edit</td>
               </tr>
            </table>
         
         </div>
      </AuthLayout>
  )
}
