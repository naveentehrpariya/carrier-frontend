import React, { useState } from 'react'
import Popup from '../../common/Popup';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Currency from '../../common/Currency';

export default function OrderExel({data, text, orderStatus}) {
    
   const [action, setaction] = useState();
   const [type, setType] = useState(orderStatus);

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

const downloadExel = async (t) => {
  setType(t);
  let loadedData = [];

  data.forEach((e, i) => {
    loadedData.push({
      'Sr. No.': `${i + 1}`,
      'Order No.': `CMC${e.serial_no} ${e?.lock ? '(Locked)' : ''}`,
      'Customer Name': `${e.customer?.name}(${e.customer?.customerCode})`,
      'Customer Amount': formattedValue((e?.revenue_currency || 'cad'), e?.total_amount),
      'Customer Payment Status': `${e?.customer_payment_status ? e?.customer_payment_status.toUpperCase() : 'N/A'} ${e?.customer_payment_method ? `(${e?.customer_payment_method})` : ''} ${e?.customer_payment_approved_by_admin ? " - Approved By Admin" : '- Not Approved By Admin'}`,
      'Carrier Name': `${e.carrier?.name} (${e.carrier?.mc_code})`,
      'Carrier Amount': formattedValue((e?.revenue_currency || 'cad'), e?.carrier_amount),
      'Carrier Payment Status': `${e?.carrier_payment_status ? e?.carrier_payment_status.toUpperCase() : 'N/A'} ${e?.carrier_payment_method ? `(${e?.carrier_payment_method})` : ''} ${e?.carrier_payment_approved_by_admin ? " - Approved By Admin" : '- Not Approved By Admin'}`,
      'Order Status': e?.order_status ?e?.order_status.toUpperCase() :'N/A',
      'Total Distance': `${((e?.totalDistance / 1609.34).toFixed(2))} MILES`,
      'Created BY': e?.created_by?.name, 
      'Created Date': formattime(e?.createdAt, true),
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(loadedData);

  // Auto-calculate column widths
  const objectMaxLength = [];
  loadedData.forEach((row) => {
    Object.values(row).forEach((val, idx) => {
      const len = val ? val.toString().length : 10;
      objectMaxLength[idx] = Math.max(objectMaxLength[idx] || 10, len);
    });
  });

  const headerKeys = Object.keys(loadedData[0]);
  const colWidths = headerKeys.map((key, idx) => ({
    wch: Math.max(key.length, objectMaxLength[idx]) + 2, // padding
  }));

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });

  saveAs(blob, `${t}-orders.xlsx`);
  setaction('close');
  setTimeout(() => {
    setaction();
  });
};




  return (
    <>
      <Popup action={action} size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses="btn btn-sm !text-black ms-3" 
      btntext={text ? text : 'Export'} >
         <h2 className='text-white font-bold text-center text-lg '>Download XSXL</h2>
          <p className='text-white text-center my-4 text-lg'>Down exel sheet of all the {type} orders.</p>
         <div className='flex justify-center items-center'>
            <button className={`btn text-sm text-white bg-gray-800  mx-2`} onClick={()=>downloadExel('all')} >Export</button>
         </div>
      </Popup>
    </>
  )
}
