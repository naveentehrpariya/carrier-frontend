import { Link, useNavigate } from "react-router-dom";
import loginbg from "../img/login-bg.png";
import Logotext from "./common/Logotext";

export default function Login() {
  
    function LoginForm(){

      const inputFields = [
        { type:"text", name :"corporateID", label: "Corporate ID" },
        { type:"email", name :"email", label: "Email" },
        { type:"text", name :"password", label: "Password" },
      ];
      return (
        <>
        <form  >
          {inputFields.map((field, index) => (
            <>
            <label className="mt-4 mb-0 block">{field.label}</label>
            <input required   name={field.name}   type={field.type} placeholder={field.label} className="input" />
            </>
          ))}
          <div className="mt-2 flex justify-center lg:justify-start">
            <Link to='/'  className="btn md mt-6 px-[50px] w-full lg:w-auto main-btn text-black font-bold"> Log In</Link>
          </div>
          </form>
        </>
    );
    }

    return (
      <>
        <div className="h-[100vh] overflow-hidden lg:flex justify-center items-center" >
          <div className="side-image w-full hidden lg:block lg:max-w-[50%] min-w-[50%] bg-dark2">
            <img src={loginbg} className="img-fluid block m-3 rounded-[30px] w-full" alt="loginimage" />
          </div>
          <div className="w-full h-screen  flex lg:block items-center lg:items-auto lg:h-auto lg:max-w-[50%] min-w-[50%]">
            <div className="max-h-[100vh] py-6 overflow-auto">
              <div className="w-full py-8 max-w-[390px] lg:max-w-[600px] m-auto  lg:py-0 px-8 lg:px-5   text-slate-500">
                <div className="flex items-center justify-center lg:justify-start">
                  <Logotext />
                </div>
                <h2 className="font-bold mb-1 text-[24px] mt-6 text-center lg:text-start text-white px-12 lg:px-0">Welcome to Cross Miles Carrier </h2>
                <p className="text-gray-500 hidden lg:block lg:text-start mb-2 ">Enter your credentials to login to your account </p>
                <div className='bg-[#D278D5] m-auto lg:m-0 h-[3px] w-[100px] mt-4'></div>
                <main className="mt-8 " >
                    <LoginForm />
                </main> 
              </div>
            </div>
          </div>
        </div>
      </>
    );
}
