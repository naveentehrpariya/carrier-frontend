import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function PaymentExelSheet({data, type, title}) {
    
   const [action, setaction] = useState();
   const formattedValue = (currency, amount) =>{
      return new Intl.NumberFormat("en-GB", {
         style: "currency",
         currency: currency,
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
       }).format(amount);
   }

   const formattime = (dateString, includeTime) => {
      if(!dateString){
         return "N/A"
      }
      const date = new Date(dateString);
      let formattedDate =  date.toLocaleString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      });
      if(includeTime){
         const timeOptions = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
         };
         formattedDate += ' ' + date.toLocaleString('en-US', timeOptions);
      }
      return formattedDate;
   }

   const downloadExel  = async(t) => {
      let loadedData = [];
      data.map((e, i) => {
         if(type === 'customer' ){
            loadedData.push({
               'Sr. No.' :`${i+1}`,
               'Order No.' :`CMC${e.serial_no}`,
               'Customer Name' :`${e.customer?.name}`,
               'Customer Phone' :`${e.customer?.phone}`,
               'Customer Email' :`${e.customer?.email}`,
               'Amount' :formattedValue((e?.revenue_currency||'cad'), e?.total_amount),
               'Status' : e?.customer_payment_status || 'None',
               'Method' : e?.customer_payment_method || 'None',
               'Admin Approval' : e?.customer_payment_approved_by_admin ? "Approved" : 'Un-Approved',
               'Payment Date' : formattime(e?.customer_payment_date, 'time') || "None",
            });
         } else {
               loadedData.push({
                  'Sr. No.' :`${i+1}`,
                  'Order No.' :`CMC${e.serial_no}`,
                  'Carrier Name' :`${e.carrier?.name}`,
                  'Carrier Phone' :`${e.carrier?.phone}`,
                  'Carrier Email' :`${e.carrier?.email}`,
                  'Amount' :formattedValue((e?.revenue_currency||'cad'), e?.total_amount),
                  'Status' : e?.carrier_payment_status || 'None',
                  'Method' : e?.carrier_payment_method || 'None',
                  'Admin Approval' : e?.carrier_payment_approved_by_admin ? "YES" : 'NO',
                  'Payment Date' : formattime(e?.carrier_payment_date, 'time') || "None",
               });
         }
      });
      const worksheet = XLSX.utils.json_to_sheet(loadedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      console.log("loadedData",loadedData)
      const excelBuffer = XLSX.write(workbook, {
         bookType: "xlsx",
         type: "array",
      });
      const blob = new Blob([excelBuffer], {
         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(blob, `${title}-payments.xlsx`);
      setaction('close');
      setTimeout(() => {
         setaction();
      })
   }


  return (
    <>
      <Popup action={action} size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses="btn btn-sm !text-black" 
      btntext={'Export'} >
         <h2 className='text-white font-bold text-center text-lg '>Download XSXL</h2>
          <p className='text-white text-center my-4 text-lg'>All the payments will be downloaded in a excel sheet.</p>
         <div className='flex justify-center items-center'>
            <button className={`btn text-sm ${type === 'all' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel()} >Export All</button>
         </div>
      </Popup>
    </>
  )
}
