import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiDotsVertical } from 'react-icons/hi';

export default function Dropdown({ children, classes, text,iconsize }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom - window.scrollY + 30, left: rect.right + window.scrollX - 224 });
    }
  }, [open]);

  useEffect(() => {
    const updatePosition = () => {
      if (!open || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 0;
      const spaceBelow = window.innerHeight - rect.bottom;
      if (menuHeight && spaceBelow < menuHeight + 30) {
        setDropdownPosition({ top: rect.top - window.scrollY - menuHeight - 30, left: rect.right + window.scrollX - 224 });
      } else {
        setDropdownPosition({ top: rect.bottom - window.scrollY + 30, left: rect.right + window.scrollX - 224 });
      }
    };
    updatePosition();
    if (open) {
      const handler = () => updatePosition();
      window.addEventListener('resize', handler);
      window.addEventListener('scroll', handler, true);
      return () => {
        window.removeEventListener('resize', handler);
        window.removeEventListener('scroll', handler, true);
      };
    }
  }, [open, children]);

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
              ref={dropdownRef}
              className="fixed z-[9999] mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
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
