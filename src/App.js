import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
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
import OrderPDF from './pages/dashboard/order/OrderPDF';
import CustomerInvoice from './pages/dashboard/order/CustomerInvoice';
import ViewOrder from './pages/dashboard/order/View';
import CompanyDetails from './pages/auth/CompanyDetails';
import CustomerDetail from './pages/dashboard/customer/CustomerDetail';
import EquipAndCommodity from './pages/dashboard/admin/EquipAndCommodity';
import PaymentLists from './pages/dashboard/payment/PaymentLists';
import CarrierDetail from './pages/dashboard/carrier/CarrierDetail';
import EmployeeDetail from './pages/dashboard/employees/EmployeeDetail';
import Unauthorized from './components/Unauthorized';

function App() {
  return (
    <UserContextProvider>
        <div className="App">
              <BrowserRouter>
                <div className="routes">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Login />} />
 
                    <Route path="/home" element={
                      <PrivateRoute>
                        <Overview />
                      </PrivateRoute>
                    } />
                    <Route path="/orders" element={
                      <PrivateRoute>
                        <Orders />
                      </PrivateRoute>
                    } />
                    <Route path="/order/detail/:id" element={
                      <PrivateRoute>
                        <OrderPDF />
                      </PrivateRoute>
                    } />
                    <Route path="/edit/order/:id" element={
                      <PrivateRoute>
                        <AddOrder isEdit={true} />
                      </PrivateRoute>
                    } />
                    <Route path="/view/order/:id" element={
                      <PrivateRoute>
                        <ViewOrder />
                      </PrivateRoute>
                    } />
                    <Route path="/order/customer/invoice/:id" element={
                      <RoleBasedRoute allowedRoles={[1, 2, 3]}>
                        <CustomerInvoice />
                      </RoleBasedRoute>
                    } />
                    <Route path="/order/add" element={
                      <RoleBasedRoute allowedRoles={[1, 3]}>
                        <AddOrder />
                      </RoleBasedRoute>
                    } />
                    <Route path="/customers" element={
                      <PrivateRoute>
                        <Customers />
                      </PrivateRoute>
                    } />
                    <Route path="/payments" element={
                      <RoleBasedRoute allowedRoles={[2, 3]}>
                        <PaymentLists />
                      </RoleBasedRoute>
                    } />
                    <Route path="/customer/detail/:id" element={
                      <PrivateRoute>
                        <CustomerDetail />
                      </PrivateRoute>
                    } />
                    <Route path="/carriers" element={
                      <PrivateRoute>
                        <Carriers />
                      </PrivateRoute>
                    } />
                    <Route path="/carrier/detail/:id" element={
                      <PrivateRoute>
                        <CarrierDetail />
                      </PrivateRoute>
                    } />
                    <Route path="/employees" element={
                      <PrivateRoute>
                        <EmployeesLists />
                      </PrivateRoute>
                    } />
                    <Route path="/employee/detail/:id" element={
                      <PrivateRoute>
                        <EmployeeDetail />
                      </PrivateRoute>
                    } />
                    <Route path="/accounts/orders" element={
                      <RoleBasedRoute allowedRoles={[2, 3]}>
                        <AccountOrders />
                      </RoleBasedRoute>
                    } />
                    <Route path="/company/details" element={
                      <PrivateRoute>
                        <CompanyDetails />
                      </PrivateRoute>
                    } />

                    {/* Role-based protected routes - example for admin access */}
                    <Route path="/commodity-and-equipments" element={
                      <RoleBasedRoute allowedRoles={[3]}>
                        <EquipAndCommodity />
                      </RoleBasedRoute>
                    } />

                    <Route path="/unauthorized" element={<Unauthorized />} /> 
                    <Route path="*" element={<Error404 />} /> 
                  </Routes>
                </div>
              </BrowserRouter>
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
