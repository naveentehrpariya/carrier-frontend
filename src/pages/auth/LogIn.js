import React, { useContext, useState } from "react";
import Button from "../common/Button";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
import Endpoints from "../../api/Endpoints";
import { UserContext } from "../../context/AuthProvider";
import toast from "react-hot-toast";
import CheckLogin from "./CheckLogin";
import Logotext from "../common/Logotext";
import ForgotPasswors from "./ForgotPassword";

export default function Login() {
  
    const {Errors, setIsAuthenticated, setUser} = useContext(UserContext);
    function LoginForm(){

    const inputFields = [
      { type:"text", name :"email", label: "Email" },
      { type:"password", name :"password", label: "Password" },
    ];
      
    const [data, setData] = useState({
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
      if (data.email === "" || data.password === "") {
        toast.error("Email or password can't be empty.");
        return false
      }
      setLoading(true);
      const m = new Endpoints();
      const resp = m.login(data);
      resp.then((res) => {
        setLoading(false);
        if(res.data.status){
          if(res.data.user.role !== '1'){
            toast.success(res.data.message);
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
            navigate("/home");
          } else {
            toast.error("Invalid credentials. Please try again.");
          }
        } else { 
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setLoading(false);
        Errors(err);
      });
    }

    return (
      <>
        {inputFields.map((field, index) => (
          <input required key={index} name={field.name} onChange={handleinput} type={field.type} placeholder={field.label} className="input" />
        ))}
        <div className="m-auto table mt-8">
          <Button loading={loading} onclick={handleLogin} type={"button"} text='Login Now' classes={`m-auto `}  />
        </div>
      </>
    );
    }

    return (
      <Layout>
        <CheckLogin takeaction={true}  redirect={true} />
        <div className="h-[100vh] flex justify-center items-center" >
          <div className="w-full flex flex-col px-5 text-base leading-4 max-w-[590px] text-slate-500">
          <header>
              <Link to="/" className="self-center table  m-auto text-3xl font-mono font-bold text-center text-red-500 drunk lowercase">
                <Logotext />
              </Link>
              <h2 className="font-bold mb-1 text-center font-mono text-[20px] mt-6   text-white">Login into runstream</h2>
              <div className="flex justify-center py-3">
              <ForgotPasswors />
              </div>
          </header>
          <main className="mt-8" >
              <LoginForm />
          </main> 
          <footer>
              <Link to="/signup" className="text-center mt-4 text-normal table m-auto  text-white">
                Create an account?
              </Link>
          </footer>
          </div>
        </div>
      </Layout>
    );
}
