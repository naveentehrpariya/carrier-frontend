import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginbg from "../../img/login-bg.png";
import { UserContext } from "../../context/AuthProvider";
import toast from "react-hot-toast";
import Logotext from "../common/Logotext";
import Api from "../../api/Api";
import CheckLogin from "./CheckLogin";

export default function Login() {
    const {Errors,setcompany, user, setIsAuthenticated, setUser} = useContext(UserContext);
    function LoginForm(){
      const inputFields = [
        { type:"text", name :"corporateID", label: "Corporate ID" },
        { type:"email", name :"email", label: "Email" },
        { type:"text", name :"password", label: "Password" },
      ];
        
      const [data, setData] = useState({
        corporateID: "",
        email: "",
        password: "",
      });

      const handleinput = (e) => {
        setData({ ...data, [e.target.name]: e.target.value});
      }

      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      function handleLogin(e) {
        e.preventDefault();
        if (data.email === "" || data.password === "" || data.corporateID === "") {
          toast.error("All fields are required.");
          return false
        }
        setLoading(true);
        const resp = Api.post(`/user/login`, data);
        resp.then((res) => {
          setLoading(false);
          if(res.data.status){
            // if(res.data.user.role !== '1'){
              toast.success(res.data.message);
              // Cookie is automatically set by the server with HttpOnly flag
              // No need to manually store token in localStorage
              setUser(res.data.user);
              setIsAuthenticated(true);
              navigate("/home");
              setcompany(res.data.company);
              localStorage.setItem('token', res.data.token);
            // } else {
            //   toast.error("Invalid credentials. Please try again.");
            // }
          } else { 
            toast.error(res.data.message);
          }
        }).catch((err) => {
          setLoading(false);
          Errors(err);
        });
      }
  
      useEffect(()=>{
        if(user && user._id){
          navigate('/home');
        } 
      },[user]);

    return (
      <>
      <CheckLogin />
      <form onSubmit={handleLogin} >
          {inputFields.map((field, index) => (
            <>
            <label className="mt-4 mb-0 block">{field.label}</label>
            <input required key={index} name={field.name} onChange={handleinput} type={field.type} placeholder={field.label} className="input" />
            </>
          ))}
          <div className="mt-2 flex justify-center lg:justify-start">
            <button type="submit" onClick={handleLogin} className="btn md mt-6 px-[50px] w-full lg:w-auto main-btn text-black font-bold">{loading ? "Logging in..." : "Submit"}</button>
          </div>
        </form>
      </>
    );
    }

    return (
      <>
        <div className="h-[100vh] overflow-hidden lg:flex justify-center items-center" >
          <div className="side-image w-full hidden lg:block lg:max-w-[50%] ">
            <img src={loginbg} className="img-fluid block m-3 rounded-[30px]" alt="loginimage" />
          </div>
          <div className="w-full h-screen  flex lg:block items-center lg:items-auto lg:h-auto lg:max-w-[50%]">
            <div className="max-h-[100vh] py-6 overflow-auto">
              <div className="w-full py-8 max-w-[390px] lg:max-w-[600px] m-auto  lg:py-0 px-8 lg:px-5   text-slate-500">
                <div className="flex items-center justify-center lg:justify-start">
                  <Link to="/" className="text-3xl font-mono font-bold  text-red-500 drunk lowercase">
                    <Logotext />
                  </Link>
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
