import React, { useContext, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider'
import OrderTimelineCard from '../../../components/orders/OrderTimelineCard'
import OrderTimelineSkeleton from '../../../components/orders/OrderTimelineSkeleton'

export default function OrderItem({lists, fetchLists, loading = false}) {
   const {user} = useContext(UserContext);
   const [activeQuickViewId, setActiveQuickViewId] = useState(null);

   if (loading) {
      return (
         <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
               <OrderTimelineSkeleton key={i} />
            ))}
         </div>
      );
   }

   return (
      <div className="space-y-4">
         {lists && lists.map((order, index) => (
            <OrderTimelineCard 
               key={`order-${order._id || index}`}
               order={order}
               user={user}
               fetchLists={fetchLists}
               activeQuickViewId={activeQuickViewId}
               setActiveQuickViewId={setActiveQuickViewId}
            />
         ))}
      </div>
   )
}
