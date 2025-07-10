import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import AddCarrier from './AddCarrier';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import TimeFormat from '../../common/TimeFormat';
import Loading from '../../common/Loading';
import RemoveCarrier from './RemoveCarrier';
import Nocontent from './../../common/NoContent';
import { Link } from 'react-router-dom';
export default function Carriers() {


   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {user}  = useContext(UserContext);

   const fetchLists = (search) => {
      setLoading(true);
      const resp = Api.get(`/carriers/listings?${search ?`search=${search}` : ''}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.carriers);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
      });
   }

   useEffect(() => {
      fetchLists();
   }, []);

   const debounceRef = useRef(null);
   const handleInputChange = (e) => {
      const value = e.target.value;
      const wordCount = value && value.length;
      if (wordCount > 1) {
         fetchLists(value);
      }
      if (e.target.value === '') {
         fetchLists();
      }
   };
  return (
      <AuthLayout> 
         <div className='md:flex justify-between items-center'>
            <h2 className='text-white text-2xl mb-4 md:mb-0'>Carriers</h2>
            <div className='sm:flex items-center justify-between md:justify-end'>
               <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search by name or code' className='text-white min-w-[250px] w-full md:w-auto bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
               {user?.role === 3 ? <div className='ms-4'></div> : ''}
               {user?.role === 3 ? <AddCarrier classes={`btn md text-black font-bold w-full md:w-auto block md:flex mt-3 md:mt-0`} fetchLists={fetchLists} /> : '' }

            </div>
         </div>

         {loading ? <Loading />
         :
         <>
         {lists && lists.length > 0 ?
            <div className='recent-orders overflow-x-auto mt-6 border border-gray-900 rounded-[30px]'>
               <table className='w-full p-2' cellPadding={'20'}>
                  <tr>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Carrier</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Email</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Phone</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900 min-w-[240px] md:min-w-[auto] '>Address</th>
                     <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900 min-w-[220px] md:min-w-[auto]'>Added By</th>
                     {user?.is_admin === 1 ? <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Action</th> :''}
                  </tr>
                  {lists && lists.map((c, index) => {
                     return <tr key={`carriew-${index}`}>

                        <td className='text-sm text-start  uppercase border-b border-gray-900'>
                           <p className='text-white font-bold'><Link className='text-main' to={`/carrier/detail/${c?._id}`}>{c?.name}</Link> </p>
                           <p className='text-gray-400'>MC{c.mc_code}</p>
                        </td>

                        <td className='text-sm text-start text-gray-200 border-b border-gray-900'>
                           <p>{c?.email ? <a href={`mailto:${c?.email}`}>{c?.email}</a>  : "--"}</p>
                           <p>{c?.secondary_email ? <a href={`mailto:${c?.secondary_email}`}>{c?.secondary_email}</a>  : ""}</p>
                        </td>

                        <td className='text-sm text-start text-gray-200 border-b border-gray-900'>
                           <p>{c?.phone ? <a href={`tel:${c?.phone}`}>{c?.phone}</a>  : "--"}</p>
                           <p>{c?.secondary_phone ? <a href={`tel:${c?.secondary_phone}`}>{c?.secondary_phone}</a>  : ""}</p>
                        </td>

                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <div class='has-tooltip line-clamp-2 max-w-[200px]'>
                              <span class='tooltip rounded shadow-xl p-2 bg-gray-100 text-black -mt-8 max-w-[200px] '>
                                 {c.location || "--"} {c.city || ""} {c.state || ""} {c.country || ""} {c.zipcode || ""}
                              </span>
                              {c.location || "--"} {c.city || ""} {c.state || ""} {c.country || ""} {c.zipcode || ""}
                           </div>
                        </td>

                        <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                           <p>{c.created_by.name || "--"}</p>
                           <p><TimeFormat date={c.createdAt || "--"} /> </p>
                        </td>

                        {user?.is_admin === 1 ?
                           <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                              <AddCarrier classes="text-main" text={"Update"} item={c} fetchLists={fetchLists} />
                              <RemoveCarrier classes="text-red-600 mt-2" text={"Remove"} item={c} fetchLists={fetchLists} />
                           </td> 
                        : "" }

                     </tr>
                  })}
                  
               </table>
            
            </div>
            :  <Nocontent />
         }
         </>
         }
      </AuthLayout>
  )
}
