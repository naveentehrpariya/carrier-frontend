import React from 'react'
import AuthLayout from '../../../layout/AuthLayout';
import OrdersFetch from './OrdersFetch';

export default function Orders() {

   return (
      <AuthLayout> 
         <OrdersFetch />
      </AuthLayout>
   )
}
