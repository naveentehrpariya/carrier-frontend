import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export default function Popup({btnclasses, btntext, children, space, action, bg}) {

  const [open, setOpen] = useState(false)
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    console.log("action", action);
    if (action === "open") {
      setOpen(true)
    } 
    if (action === "close") {
      setOpen(false)
    }
  }, [action]);

  return (
   <>
   <button className={btnclasses || "btn"} onClick={() => setOpen(true)}>{btntext || "open"}</button>
    <Transition.Root show={open} as={Fragment}>
      <Dialog className="relative z-10 " initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto px-4">
          <div className="flex min-h-full items-center justify-center text-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={` transform overflow-hidden rounded-[35px] ${bg ? bg : "bg-white"} text-left shadow-xl transition-all sm:my-8 w-full md:w-full md:max-w-lg ${space}`}>
                  <button
                    type="button"
                    className="close absolute top-0 right-4 text-[30px] "
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}>
                    &times;   
                  </button>
                  {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
   </>
  )
}
