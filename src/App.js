import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserContextProvider from './context/AuthProvider';
import Error404 from './404';
import Dashboardindex from './pages/dashboard';
import Overview from './pages/dashboard/Overview';
import Login from './pages/auth/LogIn';
import Orders from './pages/dashboard/Orders';
import Customers from './pages/dashboard/Customers';
import Carriers from './pages/dashboard/carrier/Carriers';


function App() {
  return (
    <UserContextProvider>
        <div className="App">
              <Router>
                <div className="routes">
                  <Routes>
                    <Route path="/login" element={<Login /> } />
                    <Route path="/home" element={<Overview /> } />
                    <Route path="/orders" element={<Orders /> } />
                    <Route path="/customers" element={<Customers /> } />
                    <Route path="/carriers" element={<Carriers /> } />
                    <Route path="*" element={<Error404 />} /> 
                  </Routes>
                </div>
              </Router>
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName="toaster-container"
                containerStyle={{}}
                toastOptions={{
                  className: '',
                  duration: 5000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: 'green',
                      secondary: 'black',
                    },
                  },
                }}
              />
        </div>
    </UserContextProvider>
  );
}

export default App;
