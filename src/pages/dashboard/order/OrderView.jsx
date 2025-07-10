import React, { useContext, useEffect, useState } from 'react'
import AddNotes from '../accounts/AddNotes';
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';
import toast from 'react-hot-toast';
import Api from '../../../api/Api';
import { BsFiletypeDoc } from "react-icons/bs";
import TimeFormat from '../../common/TimeFormat';
import Badge from '../../common/Badge';

import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa6";
import Loading from '../../common/Loading';
export default function OrderView({order, text, fetchLists, btnclasses}){ 

   const [open, setOpen] = useState(false);
   const {Errors, user} = useContext(UserContext);
   const [files, setFiles] = useState([]);
   const [paymentLogs, setPaymentLogs] = useState([]);
   const [fetching, setFeching] = useState(false);
   const fetchFiless = () => { 
      setFeching(true);
      const resp = Api.get(`/order_docs/${order._id}`); 
      resp.then((res)=>{
         if(res.data.status){
            setFiles(res.data.files);
            setPaymentLogs(res.data.paymentLogs);
         } else {
            setFiles([]);
         }
         setFeching(false);
      }).catch(err => {
         Errors(err);
         setFeching(false);
      });
   }

   useEffect(() => {
      if(open){
         fetchFiless();
      }
   },[open]);


   const getMime = (type) => {
      const isImage = type.includes('image');
      const isVideo = type.includes('video');
      const isAudio = type.includes('audio');
      if (isImage) {
         return 'image'
      } else if (isAudio) {
         return 'audio';
      } else if (isVideo) {
         return 'video';
      } else {
         return 'doc';
      }
   }

   function UPLOAD({update, classes, updateSize}) {
      const [open, setOpen] = useState();
      const [uploading, setUploading] = useState(false);
      const [file, setFile] = useState(null);
      const [fileMime, setFileMime] = useState(null);
      const {Errors} = useContext(UserContext);

      const handleFile = async (e) => {
         setFile(e.target.files[0]);
         console.log(e.target.files[0]);
         const type = e.target.files[0] && e.target.files[0].type;
         const isImage = type.includes('image');
         const isVideo = type.includes('video');
         const isAudio = type.includes('audio');
         if (isImage) {
            setFileMime('image');
         } else if (isAudio) {
            setFileMime('audio');
         } else if (isVideo) {
            setFileMime('video');
         } else {
            setFileMime('doc');
         }
      }
      
      const [progress, setProgress] = useState(0);
      async function UploadMedia() {
         if (!file) return;
         setUploading(true);
         const fdata = new FormData();
         fdata.append('attachment', file);
         fdata.append('order', order._id);
         const resp = Api.post(`/cloud/upload/${order._id}`, fdata, setProgress); 
         resp.then((res)=>{
            if(res.data.status){
               setProgress(100);
               setTimeout(()=>{
                  setFile(null);
                  setOpen('close');
                  update && update(1);
                  updateSize && updateSize();
                  setTimeout(()=>{
                     setOpen('');
                  }, 500); 
                  setUploading(false); 
                  toast.success(res.data.message);
               }, 1000);
            } else {
               toast.error(res.data.message);
               setUploading(false);
            }
         }).catch(err => {
            Errors(err);
            toast.error('File upload failed');
            setUploading(false);
         });
      }

   return (
      <>
         <Popup iconcolor={'black'} action={open} space={'p-6 sm:p-10'} btntext={"+ Add More"} btnclasses={classes ? classes : 'bg-main text-white rounded-[30px] px-3 md:px-4 py-[4px] md:py-[11px] text-[12px] md:text-[15px] uppercase  '} >
               <div className="flex justify-center w-full mx-auto">
                  <div className=" w-full bg-white sm:rounded-lg">
                     <div className="mb-4 md:mb-10 text-center">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Upload your files</h2>
                        <p className="text-md text-gray-500">File should be of format pdf, doc, image</p>
                     </div>

                     {file ? <>
                        <div className='selectedMedia mb-6 relative' >
                           <button onClick={()=>setFile(null)} className='bg-red-800 rounded-xl px-3 py-2 text-sm text-white absolute top-2 right-2 z-[2]'>Remove</button>
                           
                           { fileMime === 'image'? 
                              <img className="h-auto w-full object-cover max-w-full max-h-[300px] sm:max-h-[300px] rounded-xl" src={URL.createObjectURL(file)} alt="Cloud" />
                              : ""
                           }
                           { fileMime === 'video'?
                              <video playsInline className='w-full h-full rounded-xl min-h-[300px] max-h-[300px]' controls >
                                 <source src={URL.createObjectURL(file)} type={file.type} />
                              </video>
                              : ""
                           }
                           
                           { fileMime === 'doc'?
                              <iframe className='w-full rounded-xl ' src={URL.createObjectURL(file)} >
                              </iframe>
                              : ""
                           }

                        </div>
                     </> :
                     <div className="relative w-full max-w-xs mb-10  bg-white bg-gray-200 rounded-lg border border-dashed m-auto">
                        <input onChange={handleFile} type="file" id="file-upload" accept="image/*,application/pdf,text/plain" className="hidden" />
                        <label for="file-upload" className="z-20 flex flex-col-reverse items-center justify-center w-full cursor-pointer p-8">
                           <p className="z-10 text-xs font-light text-center text-gray-500">Drag & Drop your files here</p>
                           <svg className="z-10 w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                           </svg>
                        </label>
                     </div>
                     }

                     <div className='flex justify-center'>
                        <button disabled={uploading} onClick={UploadMedia} className='btn w-full max-w-xs' > 
                           {uploading ? 
                               `Uploading...`
                           : "Upload"}
                        </button>
                     </div>
                  </div>
               </div>
         </Popup> 
      </>
   )
   }

   return <>
      <div className='orderSider'>
         <button onClick={(e)=>setOpen(true)} className={btnclasses}>{text ? text : "View All Notes"}</button>
         <div className={`sider ${open ? 'ordersidebar open' : 'ordersidebar close'} w-full h-screen overflow-auto fixed top-0 right-0 bg-dark1 p-8 z-[9999] pt-[20px] max-w-[500px]`}>
            <div className='flex justify-between items-center'>
               <h2 className='text-white text-2xl'><strong>CMC#{order?.serial_no}</strong> Order Details</h2>
               <button className='text-3xl text-white mb-3' onClick={(e)=>setOpen(false)} >&times;</button>
            </div>

            <div className="flex mt-6 justify-between items-center">
               <p className=' text-gray-100 text-xl'>Notes</p>
               {order?.lock ? <button className='flex items-center'>{order?.lock ? <FaLock className='me-1 text-red-500' /> : <FaLockOpen className='me-1' />} Edit Notes</button> : <AddNotes text={"Edit Note"} classes="text-main" note={order.notes} id={order.id} fetchLists={fetchLists} />}
            </div>

            <p className='my-2 text-white mb-4'>{order.notes}</p>
            {user?.role === 2 || user?.is_admin === 1 ?
               <>
                  {order?.customer_payment_notes ?<p className='text-white my-2 mt-4'><p className='!text-gray-400'>Customer Payment Notes :</p> {order?.customer_payment_notes}</p> :''}
                  {order?.carrier_payment_notes ? <p className='text-white my-2 mt-4'> <p className='!text-gray-400'>Carrier Payment Notes :</p> {order?.carrier_payment_notes}</p> :'' }
               </> 
               : ""
            }
            <div className='flex justify-between mt-6 border-t border-gray-700 pt-6 pb-6'>
               <p className=' text-gray-100 text-xl' >Documents</p>
               <UPLOAD update={fetchFiless} classes="text-main" />
            </div>

            {fetching ? <Loading /> :
               <div>
                  {files && files.length > 0 ? 
                     <div className='grid grid-cols-2 gap-2'>

                        {files && files.map((f, i)=>{
                           const size = f.size / 1024;
                           const finalsize =  size > 1024 ? `${(size / 1024).toFixed(2)} MB` : `${size.toFixed(2)} KB`;

                           return <a href={f.url} target='_blank' className='relative py-4 px-2 border border-gray-700 rounded-2xl text-center'>
                              <div className='preview h-[100px] overflow-hidden bg-white rounded-xl' >
                                    { getMime(f.mime) === 'image'? 
                                       <img className="h-auto w-full object-cover max-w-full max-h-[300px] sm:max-h-[300px] rounded-xl" src={f.url} alt="Cloud" />
                                       : ""
                                    }
                                    { getMime(f.mime) === 'video'?
                                       <video playsInline className='w-full h-full rounded-xl min-h-[300px] max-h-[300px]' controls >
                                          <source src={f.url} type={f.mime} />
                                       </video>
                                       : ""
                                    }
                                    { getMime(f.mime) === 'doc'?
                                       <iframe className='w-full rounded-xl ' src={f.url} > </iframe>
                                       : ""
                                    }
                                    {getMime(f.mime) !== 'doc' && getMime(f.mime) !== 'video' && getMime(f.mime) !== 'image' ?
                                       <BsFiletypeDoc color='#D278D5' size={'4rem'} className='m-auto' /> : ''
                                    }
                              </div>
                              <p className='text-center text-gray-400 mt-2 capitalize'>{f.name}</p>
                              <p className='text-gray-500 text-sm'>Size : {finalsize}</p>
                              <p className='text-gray-500 text-sm'>Added By : {f.added_by?.name}</p>
                           </a>
                        })}
                     </div>
                     :
                     <p className='text-gray-500 text-sm'>No documents found for this order.</p> 
                  }

                  {user?.role === 2 || user?.is_admin === 1 ?
                     <>
                        <h2 className='text-gray-100 text-xl mt-4 pb-2 border-t border-gray-700 pt-6'>Payment Logs</h2>
                        
                        {paymentLogs && paymentLogs.length > 0 ? 
                           <>
                              {paymentLogs && paymentLogs.map((f, i)=>{
                                 return <div key={i} className='border-b !border-gray-800 py-3 mb-3'>
                                    {f.approval && f.updated_by.is_admin ?
                                    <>
                                    <p className='text-gray-500 text-[17px]'>{f.type} Payment status <Badge classes={'!inline m-0'} title={true} status={f.status} /> is <span className='text-green-500'>approved</span> via payment method {f.method}.</p>
                                    <p className='text-gray-500 mt-2 text-sm'>Approved By : {f.updated_by?.name}{f.updated_by?.phone ? `(${f.updated_by?.phone})` : ''}</p>
                                    <p className='text-gray-300 mt-2 text-sm'>Date : <TimeFormat date={f.createdAt || "--"} /></p>
                                    </>
                                    :
                                    <>
                                    <p className='text-gray-500 text-[17px] '>{f.type} Payment status updated to <Badge classes={'!inline m-0'} title={true} status={f.status} /> via payment method {f.method}.</p>
                                    <p className='text-gray-500 mt-2 text-sm'>Update By : {f.updated_by?.name}{f.updated_by?.phone ? `(${f.updated_by?.phone})` : ''}</p>
                                    <p className='text-gray-300 mt-2 text-sm'>Date : <TimeFormat date={f.createdAt || "--"} /></p>
                                    </> }
                                 </div>
                              })}
                           </>
                        :
                           <p className='text-gray-500 text-sm'>No Payment Logs found.</p> 
                        }
                     </>
                  :''
                  }   
               </div>
            }
         </div> 
      </div>
   </>
}
