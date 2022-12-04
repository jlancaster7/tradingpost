import React from "react";
import Image from 'next/image'


const Footer = () => {
    return (
        <div className="footer" style={{height: '3vh'}}>
            <div className="copyright">
                <p>© 2022 Tradingpost</p>
            </div>
            <div className="footerlinks">
                <a href={"/privacy-policy"}
                   target="_blank" rel="noreferrer"
                   style={{
                       color: "white"
                   }}>Privacy Policy</a>
                <a href="/terms-of-service" 
                   target="_blank" rel="noreferrer"
                   style={{
                        color: "white",
                    }}>Terms of Service</a>
                <a href="/" style={{
                    color: "white",
                }}>Contact Us</a>

            </div>
            <div className="socialMedia">
                <a href="https://twitter.com/TradingPost_App" target="_blank" rel="noreferrer">
                    <span className="twitter"/>
                </a>
                <a href="https://www.linkedin.com/company/tradingpost/" target="_blank" rel="noreferrer">
                    <span className="linkdin"/>
                </a>
                <a href="https://www.tiktok.com/@tradingpostapp?_t=8VUY890Avyo&_r=1" target="_blank" rel="noreferrer">
                    <span className="tiktok"/>
                </a>
                <a href="https://www.instagram.com/tradingpostapp/" target="_blank" rel="noreferrer">
                    <span className="instagram"/>
                </a>
            </div>
        </div>
    );
}
export default Footer;