 


import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
export const UserContext = createContext(); 

export default function UserContextProvider(props) {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setcompany] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      // Check if user is logged in (you can check localStorage, sessionStorage, or make API call)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      const companyData = localStorage.getItem('company') || sessionStorage.getItem('company');
      const adminData = localStorage.getItem('admin') || sessionStorage.getItem('admin');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
        if (companyData) setcompany(JSON.parse(companyData));
        if (adminData) setAdmin(JSON.parse(adminData));
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData, companyData = null, adminData = null) => {
    setIsAuthenticated(true);
    setUser(userData);
    if (companyData) setcompany(companyData);
    if (adminData) setAdmin(adminData);
    
    // Persist authentication data
    localStorage.setItem('user', JSON.stringify(userData));
    if (companyData) localStorage.setItem('company', JSON.stringify(companyData));
    if (adminData) localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setcompany(null);
    setAdmin(null);
    
    // Clear persisted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('admin');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('company');
    sessionStorage.removeItem('admin');
  };

  function Errors(error) { 
      console.error(error);
      const errors = error && error.response && error.response.data && error.response.data.errors;
      console.log("errors",errors)
      if (errors !== undefined ) {
        errors.map((m, i) => { 
          toast.error(m); 
        });
      } else {
          if(error && error.data && error.data.message !== undefined){ 
            toast.error(error.data.message);
          } 
      }
  }

  const values = {
    Errors,
    isAuthenticated, setIsAuthenticated,
    user, setUser,
    login, company, setcompany,
    logout, admin, setAdmin,
    loading
  };

    return <>
        <UserContext.Provider value={values} >
            {props.children}
        </UserContext.Provider>
    </>
}
 