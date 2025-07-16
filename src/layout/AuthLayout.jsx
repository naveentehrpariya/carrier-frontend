import * as React from "react";
import CheckLogin from "../pages/auth/CheckLogin";
import Logo from "../pages/common/Logo";
import { UserContext } from "../context/AuthProvider";
import TimeCounter from "../pages/common/TimeCounter";
import {Helmet} from "react-helmet";
import Sidebar from "./Sidebar";
import { TbUserSquareRounded } from "react-icons/tb";
import { TbLogout } from "react-icons/tb";
 import { HiOutlineUserCircle } from "react-icons/hi2";


export default function AuthLayout({children, heading}) {

  const {user} = React.useContext(UserContext);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  
  // const [windowWidth, setWindowWidth] = React.useState(window && window.innerWidth);
  // React.useEffect(() => {
  //   const handleResize = () => {
  //     setWindowWidth(window.innerWidth);
  //   };
  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  const [toggle, setToggle] = React.useState(false);
 function showSidebar() {
   const Sidebar = document.getElementById("sidebar");
    Sidebar.classList.toggle("open");
    setToggle(!toggle);
  }

  const roleChecker = () =>{
    if(user?.role === 1){
      return user?.position ||'Employee'
    }
    else if(user?.role === 2){
      return user?.position ||'Accountant'
    }
    else if(user?.role === 3){
      return user?.position ||'Adminstrator'
    }
  }
  return (
    <>
      <Helmet>
         <meta charSet="utf-8" />
         <title>{heading ? `${heading} | ` : '' } Cross Miles Carrier </title>
         <link rel="canonical" href={window.location.href || "https://runstream.co"} />
      </Helmet>
     
     {toggle ? <div onClick={showSidebar} className="fixed top-0 left-0 w-full h-full bg-[#0009] blur z-[9999]"></div> : ''}
      <div className="auth-wrap flex justify-between max-lg:flex-wrap">
        <main className="main-wrap">
          <header className="fixed top-0 lg:top-0 z-[9998] bg-dark border-b border-gray-800 px-6 md:px-7 py-2 xl:py-4 flex items-center w-full justify-between">
            <Logo /> 
            <div className="flex gap-2 items-center">
               
              <div className="hidden md:flex items-center">
                <div><HiOutlineUserCircle color="white"  size='2.5rem'/></div>
                <div className="text-start me-4 ps-2">
                  <h2 className="capitalize font-bold text-white">{user?.name}</h2>
                  <p className="capitalize text-sm mt-[-3px] text-gray-400">{roleChecker()}</p>
                </div>
              </div>
              <button className="hidden md:flex" onClick={logout} ><TbLogout color="#fff" className='me-2' size={'2rem'} /></button>
              
              <button onClick={showSidebar} className="sidebar-toggle text-base leading-6 whitespace-nowrap text-neutral-400">
                <span className="" ></span>
                <span className="my-2" ></span>
                <span className="" ></span>
              </button>

            </div>
            
          </header>
          <div className="flex w-full overflow-hidden">
            <Sidebar  logout={logout}  toggle={toggle} />
            <div className="content md:max-h-[100vh] overflow-y-auto lg:w-[calc(100%-300px)] p-6 md:p-8 !pt-[120px]   lg:!pt-[150px] w-full" >
                {children} 
            </div>
          </div>
        </main>
        <CheckLogin takeaction={true} />
      </div>
    </>
  );
}
