import React, { useState, useEffect, useContext } from 'react';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import Popup from '../../common/Popup';
import { LuEye } from "react-icons/lu";
import { BsFiletypeDoc } from 'react-icons/bs';
import { BsPlayCircle } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { UserContext } from '../../../context/AuthProvider';

export default function EmployeeDocuments({ employee, onClose, classes, text }) {
  
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

   const [file, setFile] = useState(null);
    const [fileMime, setFileMime] = useState(null);
   const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewingDoc, setPreviewingDoc] = useState(null);
    const [previewingUpload, setPreviewingUpload] = useState(false);

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

    const {Errors} = useContext(UserContext);
    const fetchDocuments = () => { 
        if (!employee || !employee._id) return; // Guard against undefined
        setLoading(true);
        const resp = Api.get(`/user/employee/docs/${employee._id}`); 
        resp.then((res)=>{
            if(res.data.status){
                setDocuments(res.data.documents);
            } else {
                setDocuments([]);
            }
            setLoading(false);
        }).catch(err => {
            Errors(err);
            setLoading(false);
        });
    }

    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    async function UploadMedia() {
        if (!file || !employee || !employee._id) return;
        setUploading(true);
        const fdata = new FormData();
        fdata.append('attachment', file);
        fdata.append('order', employee._id);
        const resp = Api.post(`/upload/employee/doc/${employee._id}`, fdata, setProgress);
        resp.then((res) => {
            if (res.data.status) {
                setProgress(100);
                fetchDocuments();
                setUploading(false);
                setFile(null);
                setFileMime(null);
                setProgress(0);
                toast.success(res.data.message);
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

    useEffect(() => {
        fetchDocuments();
        // Re-fetch whenever the employee changes and has a valid _id
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee && employee._id]);

    return (
        <Popup size="md:max-w-2xl" space="p-8" bg="bg-black" btnclasses={classes || 'text-main flex items-center'} btntext={text || <> <LuEye size={'18'} className='me-2' /> Documents</>}>
        {loading ? <Loading /> : (
            <div className="space-y-6">
                <h2 className='text-gray-100 text-2xl font-bold pb-2 '>{employee.name} Documents</h2>
                
                <div>
                    {file ? <>
                        <div className='selectedMedia mb-6 relative' >
                            <button onClick={()=>setFile(null)} className='bg-red-800 rounded-xl px-3 py-2 text-sm text-white absolute top-2 right-2 z-[2]'>Clear</button>
                            
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
                                <div className='w-full rounded-xl bg-gray-100 min-h-[300px] flex flex-col items-center justify-center'>
                                    {!previewingUpload ? (
                                        <>
                                            <BsFiletypeDoc size={'4rem'} className='text-gray-400 mb-4' />
                                            <p className='text-gray-600 mb-4'>Click to preview document</p>
                                            <button 
                                                onClick={() => setPreviewingUpload(true)}
                                                className='bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center'
                                            >
                                                <BsPlayCircle className='mr-2' /> Preview Document
                                            </button>
                                        </>
                                    ) : (
                                        <iframe className='w-full rounded-xl h-[300px]' src={URL.createObjectURL(file)} >
                                        </iframe>
                                    )}
                                </div>
                                : ""
                            }

                            <div className='flex justify-center'>
                                <div>
                                    <button onClick={UploadMedia} className='mt-2 bg-main text-white px-4 py-2 rounded-xl mt-2'>Upload Document</button>
                                    {uploading && <p className='text-gray-500  text-sm mt-2'>Uploading... {progress}%</p>}
                                </div>
                            </div>

                        </div>
                        </> :
                        <div className="relative w-full   mb-10  bg-white bg-dark2 rounded-lg border border-dashed  ">
                            <input onChange={handleFile} type="file" id="file-upload" accept="image/*,application/pdf,text/plain" className="hidden" />
                            <label for="file-upload" className="z-20 flex flex-col-reverse items-center justify-center w-full cursor-pointer p-8">
                                <p className="z-10  font-light text-center text-gray-500">Drag & Drop your files here</p>
                                <svg className="z-10 w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                </svg>
                            </label>
                        </div>
                        }
                </div>

                {loading ? <Loading /> :
                    <div>
                    {documents && documents.length > 0 ? 
                        <div className='grid grid-cols-2 gap-2'>

                            {documents && documents.map((f, i)=>{
                                const size = f.size / 1024;
                                const finalsize =  size > 1024 ? `${(size / 1024).toFixed(2)} MB` : `${size.toFixed(2)} KB`;

                                return <div key={i} className='relative py-4 px-2 border border-gray-700 rounded-2xl text-center'>
                                <div className='preview h-[180px] overflow-hidden bg-white rounded-xl' >
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
                                            <div className='w-full h-full flex flex-col items-center justify-center'>
                                                {previewingDoc !== i ? (
                                                    <>
                                                        <BsFiletypeDoc size={'3rem'} className='text-gray-400 mb-2' />
                                                        {/* <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setPreviewingDoc(i);
                                                            }}
                                                            className='bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center'
                                                        >
                                                            <BsPlayCircle className='mr-1' size='14' /> Preview
                                                        </button> */}
                                                    </>
                                                ) : (
                                                    <div className='w-full h-full flex flex-col'>
                                                        <iframe title='document' className='w-full h-full rounded-xl' src={f.url} style={{minHeight: '150px'}}> </iframe>
                                                        <div className='mt-2 flex justify-center space-x-2'>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setPreviewingDoc(null);
                                                                }}
                                                                className='bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600'
                                                            >
                                                                Hide
                                                            </button>
                                                            <a 
                                                                href={f.url} 
                                                                target='_blank' 
                                                                rel='noopener noreferrer'
                                                                className='bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700'
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                📄 Open
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            : ""
                                        }
                                        {getMime(f.mime) !== 'doc' && getMime(f.mime) !== 'video' && getMime(f.mime) !== 'image' ?
                                            <BsFiletypeDoc color='#D278D5' size={'4rem'} className='m-auto' /> : ''
                                        }
                                </div>
                                <p className='text-center text-gray-400 mt-2 capitalize'>{f.name}</p>
                                <p className='text-gray-500 text-sm'>Size : {finalsize}</p>
                                <p className='text-gray-500 text-sm'>Added By : {f.added_by?.name}</p>
                                <Popup  iconcolor={'black'}
                                    size="md:max-w-4xl" 
                                    space="p-8" 
                                    bg="bg-white" 
                                    btnclasses='absolute top-[20%] !p-3 right-[35%] bg-blue-600 text-white px-2 py-1 !rounded-xl text-xs hover:bg-blue-700'
                                    btntext='View Full Size'
                                >
                                    <div className='w-full text-center mb-4'>
                                        <h3 className='text-xl font-bold text-gray-800'>{f.name}</h3>
                                        <p className='text-gray-600'>Size: {finalsize} | Added by: {f.added_by?.name}</p>
                                    </div>
                                    <div className='w-full min-h-[500px] flex flex-col items-center justify-center'>
                                        { getMime(f.mime) === 'image'? 
                                            <img className="h-auto w-full object-cover max-w-full max-h-[600px] rounded-xl" src={f.url} alt="Document" />
                                            : ""
                                        }
                                        { getMime(f.mime) === 'video'?
                                            <video playsInline className='w-full h-auto rounded-xl max-h-[600px]' controls >
                                                <source src={f.url} type={f.mime} />
                                            </video>
                                            : ""
                                        }
                                        { getMime(f.mime) === 'doc'?
                                            <div className='w-full h-full flex flex-col'>
                                                <iframe title='document' className='w-full h-[500px] rounded-xl' src={f.url}> </iframe>
                                                <div className='mt-4 flex justify-center space-x-3'>
                                                    <a 
                                                        href={f.url} 
                                                        target='_blank' 
                                                        rel='noopener noreferrer'
                                                        className='bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center'
                                                    >
                                                        📄 Open in New Tab
                                                    </a>
                                                    <a 
                                                        href={f.url} 
                                                        download={f.name}
                                                        className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center'
                                                    >
                                                        ⬇️ Download
                                                    </a>
                                                </div>
                                            </div>
                                            : ""
                                        }
                                    </div>
                                </Popup>
                                </div>
                            })}
                        </div>
                        :
                        <p className='text-gray-500 text-sm'>No documents found for this employee.</p> 
                    }
                    </div>
                }

            </div>
        )}
        </Popup>
    );
}
