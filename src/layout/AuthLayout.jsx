import * as React from "react";
import CheckLogin from "../pages/auth/CheckLogin";
import Logo from "../pages/common/Logo";
import { UserContext } from "../context/AuthProvider";
import TimeCounter from "../pages/common/TimeCounter";
import {Helmet} from "react-helmet";
import Sidebar from "./Sidebar";
import { TbUserSquareRounded } from "react-icons/tb";


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
            <div className="flex gap-5 items-center">

            {/* <div onClick={showSidebar} className="hem-menu"><CiMenuFries /></div> */}

              <TbUserSquareRounded color="#fff" className='me-2' size={'2rem'} /> 
              <button onClick={showSidebar} className="sidebar-toggle text-base leading-6 whitespace-nowrap text-neutral-400">
                <span className="" ></span>
                <span className="my-2" ></span>
                <span className="" ></span>
              </button>
            </div>
            
          </header>
          <div className="flex w-full overflow-hidden">
            <Sidebar logout={logout} trial={<>
              {user && user.trialStatus === "active" ? 
                <div className="text-white justify-center mt-4 flex md:hidden items-center font-bold text-sm ">
                  <p className="mb-0">Trial Ends In : <TimeCounter date={user.free_trial} /></p>
                </div>
              : ''}
            </>} toggle={toggle} />
            <div className="content md:max-h-[100vh] overflow-auto w-[calc(100%-300px)] p-6 md:p-8  !pt-[150px] w-full" >
                {children} 
            </div>
          </div>
        </main>
        <CheckLogin takeaction={true} />
      </div>
    </>
  );
}
