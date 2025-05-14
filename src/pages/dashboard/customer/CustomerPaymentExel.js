import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Badge from '../../common/Badge';

export default function CustomerPaymentExel({data, text, customer}) {
    
   const [action, setaction] = useState();
   const [type, setType] = useState();


   const formattedValue = (currency, amount) =>{
      return new Intl.NumberFormat("en-GB", {
         style: "currency",
         currency: currency,
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
       }).format(amount);
   }

   const downloadExel  = async(t) => {
      setType(t);
      let loadedData = [];
      // if(t === 'all'){
         data.map((e, i) => {
            loadedData.push({
               'Sr. No.' :`${i+1}`,
               'Order No.' :`CMC${e.serial_no}`,
               'Total Amount' :formattedValue((e?.revenue_currency||'cad'), e?.total_amount),
               'Accountant Approval' : e?.customer_payment_approved_by_accounts ? e?.customer_payment_approved_by_accounts : 'Pending',
               'Admin Approval' : e?.customer_payment_approved_by_admin ? e?.customer_payment_approved_by_admin : 'Pending',
               'Payment Method' : e?.customer_payment_method || 'None',
               'Final Payment Status' : e?.customer_payment_status || 'None',
               'Date' :e?.customer_payment_date || "None",
            });
         });
      // }
      const worksheet = XLSX.utils.json_to_sheet(loadedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      console.log("loadedData",loadedData)
      const excelBuffer = XLSX.write(workbook, {
         bookType: "xlsx",
         type: "array",
      });
      const blob = new Blob([excelBuffer], {
         type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(blob, `${customer?.name}-${t}-payments.xlsx`);
      setaction('close');
      setTimeout(() => {
         setaction();
      })
   }


  return (
    <>
      <Popup action={action} size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses="btn btn-sm !text-black" 
      btntext={text ? text : 'Export'} >
         <h2 className='text-white font-bold text-center text-lg '>Download XSXL</h2>
          <p className='text-white text-center my-4 text-lg'>Choose the type of file you want to download.</p>
         <div className='flex justify-center items-center'>
            <button className={`btn text-sm ${type === 'all' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('all')} >Export All</button>
            {/* <button className={`btn text-sm ${type === 'all' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('all')} >All</button> */}
            {/* <button className={`btn text-sm ${type === 'pending' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('pending')} >Pending</button> */}
            {/* <button className={`btn text-sm ${type === 'paid' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('paid')} >Paid</button> */}
         </div>
      </Popup>
    </>
  )
}
