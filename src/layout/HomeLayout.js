import Footer from "../pages/common/Footer";
import Header from "../pages/common/Header";
import {Helmet} from "react-helmet";

const HomeLayout = ({ children, title }) => {
  return <>
    <Helmet>
        <meta charSet="utf-8" />
        <title>{title ? `${title} | ` : '' } RunStream </title>
        <link rel="canonical" href={window.location.href || "https://runstream.co"} />
    </Helmet>
    <Header />
        {children}
    <Footer />
  </>
};

export default HomeLayout;