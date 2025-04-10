import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserContextProvider from './context/AuthProvider';
import Error404 from './404';
import Overview from './pages/dashboard/Overview';
import Login from './pages/auth/LogIn';
import Carriers from './pages/dashboard/carrier/Carriers';
import Customers from './pages/dashboard/customer/Customers';
import Orders from './pages/dashboard/order/Orders';
import AddOrder from './pages/dashboard/order/AddOrder';
import EmployeesLists from './pages/dashboard/employees/EmployeesLists';
import AccountOrders from './pages/dashboard/accounts/AccountOrders';
import OrderDetail from './pages/dashboard/order/OrderDetail';
import CustomerInvoice from './pages/dashboard/order/CustomerInvoice';
import ViewOrder from './pages/dashboard/order/View';
import CompanyDetails from './pages/auth/CompanyDetails';



function App() {
  return (
    <UserContextProvider>
        <div className="App">
              <Router>
                <div className="routes">
                  <Routes>
                    <Route path="/login" element={<Login /> } />
                    <Route path="/" element={<Login /> } />
                    <Route path="/home" element={<Overview /> } />
                    <Route path="/orders" element={<Orders /> } />
                    <Route path="/order/detail/:id" element={<OrderDetail /> } />
                    <Route path="/edit/order/:id" element={<AddOrder isEdit={true} /> } />
                    <Route path="/view/order/:id" element={<ViewOrder /> } />
                    <Route path="/order/customer/invoice/:id" element={<CustomerInvoice /> } />
                    <Route path="/order/add" element={<AddOrder /> } />
                    <Route path="/customers" element={<Customers /> } />
                    <Route path="/carriers" element={<Carriers /> } />
                    <Route path="/employees" element={<EmployeesLists /> } />
                    <Route path="/accounts/orders" element={<AccountOrders /> } />
                    <Route path="/company/details" element={<CompanyDetails /> } />
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
                  duration: 2000,
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
