import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiDotsVertical } from 'react-icons/hi';

export default function Dropdown({ children, classes, text,iconsize }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.top - window.scrollY, left: rect.right + window.scrollX - 224 }); // Adjust width as needed
    }
  }, [open]);

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} className="bg-[#0001] fixed top-0 left-0 w-full h-full z-1" ></div>
      )}

      <div className="relative inline-block text-left">
        <button className={classes} ref={buttonRef} onClick={() => setOpen(!open)}>
          {text ? text : <HiDotsVertical size={iconsize ? iconsize : '20px'} color="white" />}
          
        </button>

        {open &&
          createPortal(
            <div
              className="absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              style={{
                position: 'absolute',
                top: `${dropdownPosition.top+30}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              {children}
            </div>,
            document.body
          )}
      </div>
    </>
  );
}
