import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/LogIn';
import AccountOrders from './pages/AccountOrders';

function App() {
  return (
      <div className="App">
            <BrowserRouter>
              <div className="routes">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<AccountOrders />} />
                </Routes>
              </div>
            </BrowserRouter>
      </div>
  );
}

export default App;
