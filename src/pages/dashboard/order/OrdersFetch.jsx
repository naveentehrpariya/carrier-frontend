import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import { Link } from 'react-router-dom';
import Nocontent from '../../common/NoContent';
import Loading from '../../common/Loading';
import OrderItem from './OrderItem';

export default function OrdersFetch({isRecent, customer, sortby, hideAddOrder, title, hideright}) {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors, user} = useContext(UserContext);

   const fetchLists = (value) => {
      setLoading(true);
      const resp = Api.get(`/order/listings?${value ?`search=${value}` : ''}${customer ?`&customer_id=${customer}` : ''} ${sortby ?`&sortby=${sortby}` : ''}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            let orderslists = res.data.orders || [];
            if(isRecent){
               orderslists  = orderslists.slice(0, 5);
            }
            setLists(orderslists);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
         Errors(err);
      });
   }

   useEffect(() => {
      fetchLists();
   },[customer]);

   const debounceRef = useRef(null);
   const [searching, setSearching] = useState(false);
   const handleInputChange = (e) => {
      const value = e.target.value;
      const wordCount = value &&value.length;
      if (wordCount > 1) {
         setSearching(true);
         fetchLists(value);
      }
      if (e.target.value === '') {
         fetchLists();
      }
   };

   return (
         <> 
            <div className='md:flex justify-between items-center'>
               <h2 className='text-white text-2xl mb-4 md:mb-0'>{title ? title : "Orders"}</h2>
               {hideright ? '' :
               <div className='sm:flex items-center justify-between md:justify-end'>
                  <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search order' className='text-white min-w-[250px] w-full md:w-auto bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
                  {user?.role !== 2 ? <div className='ms-4'></div> : ''}
                  {hideAddOrder ? '' : <Link to="/order/add" className={"btn md text-black font-bold w-full md:w-auto block md:flex mt-3 md:mt-0"} >+ New Order</Link>}
               </div>
               }
            </div>

            {loading ? <Loading />
               :
               <>
               {lists && lists.length > 0 ? 
                  <OrderItem lists={lists} fetchLists={fetchLists} />
                  : 
                  <Nocontent text="No orders found" />
               }
               </>
            }
         </>
   )
}
