import Navbar from './Navbar';
import Footer from './Footer';
import SideMenu from './Sidebar';

// @ts-ignore
export default function Layout({children}) {
    return (
        <>
            <SideMenu pageWrapId={'page-wrap'} outerContainerId={'navbar'}/>

            <Navbar/>

            {children}

            <Footer/>
        </>
    );
}
