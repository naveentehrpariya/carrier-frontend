import React, { useContext, useState } from 'react'
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Badge from '../../common/Badge';

export default function CarrierPaymentExel({data, text, carrier}) {
    
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
      setType(t);
      let loadedData = [];
         data.map((e, i) => {
            if(t === 'all' ){
               loadedData.push({
                  'Sr. No.' :`${i+1}`,
                  'Order No.' :`CMC${e.serial_no}`,
                  'Carrier' : e?.carrier?.name || '',
                  'Order Added By' : `${e?.created_by?.name} ${e?.created_by?.phone ? `(${e?.created_by?.phone})` : ''}`,
                  'Payment Date' : formattime(e?.carrier_payment_date, 'time') || "None",
                  'Payment Status' : e?.carrier_payment_status || 'None',
                  'Payment Method' : e?.carrier_payment_method || 'None',
                  'Admin Approval' : e?.carrier_payment_approved_by_admin ? "YES" : 'NO',
                  'Total Amount' :formattedValue((e?.revenue_currency||'cad'), e?.carrier_amount),
               });
            } else {
               if(t === e?.carrier_payment_status){
                  loadedData.push({
                     'Sr. No.' :`${i+1}`,
                     'Order No.' :`CMC${e.serial_no}`,
                     'Carrier' : e?.carrier?.name || '',
                     'Order Added By' : `${e?.created_by?.name} ${e?.created_by?.phone ? `(${e?.created_by?.phone})` : ''}`,
                     'Payment Date' : formattime(e?.carrier_payment_date, 'time') || "None",
                     'Payment Status' : e?.carrier_payment_status || 'None',
                     'Payment Method' : e?.carrier_payment_method || 'None',
                     'Admin Approval' : e?.carrier_payment_approved_by_admin ? "YES" : 'NO',
                     'Total Amount' :formattedValue((e?.revenue_currency||'cad'), e?.carrier_amount),
                  });
               }
            }
         });
      const worksheet = XLSX.utils.json_to_sheet(loadedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${carrier?.name} ${t} payments`);
      console.log("loadedData",loadedData)
      const excelBuffer = XLSX.write(workbook, {
         bookType: "xlsx",
         type: "array",
      });
      const blob = new Blob([excelBuffer], {
         type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(blob, `${carrier?.name}-carrier-${t}-payments.xlsx`);
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
            {/* <button className={`btn text-sm ${type === 'all' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('all')} >Export All</button> */}
            <button className={`btn text-sm ${type === 'all' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('all')} >All</button>
            <button className={`btn text-sm ${type === 'pending' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('pending')} >Pending</button>
            <button className={`btn text-sm ${type === 'paid' ? 'text-black' : 'text-white bg-gray-800'}  mx-2`} onClick={()=>downloadExel('paid')} >Paid</button>
         </div>
      </Popup>
    </>
  )
}
