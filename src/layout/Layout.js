import Footer from "../pages/common/Footer";
import Header from "../pages/common/Header";

const Layout = ({ children }) => {
  return <>
      <div className="d-none" >
        <Header />
        <Footer /> 
      </div>
      {children}
  </>
};

export default Layout;