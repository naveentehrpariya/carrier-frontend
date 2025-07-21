import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import Dropdown from './common/Dropdown';
import BadgeStatus from './common/BadgeStatus';
import Loading from './common/Loading';
import AuthLayout from './AuthLayout';
export default function AccountOrders() {

   const [loading, setLoading] = useState(true);
   useEffect(() => {
      setTimeout(() => {
         setLoading(false);
      },2000)
   },[]);

   return (
      <AuthLayout> 
         <div className='md:flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Account Orders Lists</h2>
            <div className='flex items-center w-full md:w-auto mt-3 lg:mt-0'>
               <input    type='search' placeholder='Search by order no' className='text-white min-w-[250px] bg-dark1 border w-full md:w-auto border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
            </div>
         </div>
         {loading ? <Loading />
         :
         <>
            <div className='recent-orders overflow-x-auto mt-6 border border-gray-900 rounded-[30px]'>
               <table className='w-full p-2' cellPadding={'20'}>
                  <tr>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900 min-w-[220px] md:min-w-[auto]'>Order No.</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Customer</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier Payment</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900 min-w-[240px] md:min-w-[auto]'>Employee</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900 min-w-[220px] md:min-w-[auto]'>Amount/Profit</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Action</th>
                  </tr>
                     <tr  >
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus title={true} status={'active'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus   status={'pending'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='mt-1'><Link className='text-main' to={`/carrier/detail/`}>Carrir</Link></p>
                        </td> 
                        
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           $4500
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>Amount : 400 USD</p>
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <div className='flex items-center'>
                              <Dropdown>
                                 <li className={`list-none text-sm  `}>
                                       <a className='flex items-center' >Open</a>
                                 </li>
                              </Dropdown>
                              </div>
                        </td> 
   
                     </tr>
                     <tr  >
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus title={true} status={'active'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus   status={'pending'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='mt-1'><Link className='text-main' to={`/carrier/detail/`}>Carrir</Link></p>
                        </td> 
                        
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           $4500
                        </td>
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>Amount : 400 USD</p>
                        </td>
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <div className='flex items-center'>
                              <Dropdown>
                                 <li className={`list-none text-sm  `}>
                                       <a className='flex items-center' >Open</a>
                                 </li>
                              </Dropdown>
                              </div>
                        </td> 
                     </tr>
                     <tr  >
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus title={true} status={'active'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus   status={'pending'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='mt-1'><Link className='text-main' to={`/carrier/detail/`}>Carrir</Link></p>
                        </td> 
                        
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           $4500
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>Amount : 400 USD</p>
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <div className='flex items-center'>
                              <Dropdown>
                                 <li className={`list-none text-sm  `}>
                                       <a className='flex items-center' >Open</a>
                                 </li>
                              </Dropdown>
                              </div>
                        </td> 
   
                     </tr>
                     <tr  >
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus title={true} status={'active'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus   status={'pending'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='mt-1'><Link className='text-main' to={`/carrier/detail/`}>Carrir</Link></p>
                        </td> 
                        
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           $4500
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>Amount : 400 USD</p>
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <div className='flex items-center'>
                              <Dropdown>
                                 <li className={`list-none text-sm  `}>
                                       <a className='flex items-center' >Open</a>
                                 </li>
                              </Dropdown>
                              </div>
                        </td> 
   
                     </tr>
                     <tr  >
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus title={true} status={'active'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus   status={'pending'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='mt-1'><Link className='text-main' to={`/carrier/detail/`}>Carrir</Link></p>
                        </td> 
                        
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           $4500
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>Amount : 400 USD</p>
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <div className='flex items-center'>
                              <Dropdown>
                                 <li className={`list-none text-sm  `}>
                                       <a className='flex items-center' >Open</a>
                                 </li>
                              </Dropdown>
                              </div>
                        </td> 
   
                     </tr>
                     <tr  >
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus title={true} status={'active'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus   status={'pending'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='mt-1'><Link className='text-main' to={`/carrier/detail/`}>Carrir</Link></p>
                        </td> 
                        
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           $4500
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>Amount : 400 USD</p>
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <div className='flex items-center'>
                              <Dropdown>
                                 <li className={`list-none text-sm  `}>
                                       <a className='flex items-center' >Open</a>
                                 </li>
                              </Dropdown>
                              </div>
                        </td> 
   
                     </tr>
                     <tr  >
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus title={true} status={'active'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-400 capitalize border-b border-gray-900'>
                           <p className='flex items-center'>Status :<BadgeStatus   status={'pending'} /> </p>
                        </td> 
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p className='mt-1'><Link className='text-main' to={`/carrier/detail/`}>Carrir</Link></p>
                        </td> 
                        
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           $4500
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>Amount : 400 USD</p>
                        </td>
   
                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <div className='flex items-center'>
                              <Dropdown>
                                 <li className={`list-none text-sm  `}>
                                       <a className='flex items-center' >Open</a>
                                 </li>
                              </Dropdown>
                              </div>
                        </td> 
   
                     </tr>
               </table>
            </div>
            
            <div className='py-12 mt-8 px-6 text-center w-ful bg-dark2 rounded-[30px] mt-12'>
               <h2 className='text-gray-500 w-full text-[20px] uppercase text-center' >Nothing to see</h2>
            </div>

         </>
         }
      </AuthLayout>
  )
}
