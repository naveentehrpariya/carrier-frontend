 


import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import safeStorage, { safeSessionStorage } from '../utils/safeStorage';
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
      // Check if user is logged in (you can check safeStorage, safeSessionStorage, or make API call)
      const token = safeStorage.getItem('token') || safeSessionStorage.getItem('token');
      const userData = safeStorage.getItem('user') || safeSessionStorage.getItem('user');
      const companyData = safeStorage.getItem('company') || safeSessionStorage.getItem('company');
      const adminData = safeStorage.getItem('admin') || safeSessionStorage.getItem('admin');
      
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
    safeStorage.setItem('user', JSON.stringify(userData));
    if (companyData) safeStorage.setItem('company', JSON.stringify(companyData));
    if (adminData) safeStorage.setItem('admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setcompany(null);
    setAdmin(null);
    
    // Clear persisted data
    safeStorage.removeItem('token');
    safeStorage.removeItem('user');
    safeStorage.removeItem('company');
    safeStorage.removeItem('admin');
    safeSessionStorage.removeItem('token');
    safeSessionStorage.removeItem('user');
    safeSessionStorage.removeItem('company');
    safeSessionStorage.removeItem('admin');
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
 