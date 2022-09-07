import React from "react";

const Footer = () => {
    return (
        <div className="footer">
            <div className="copyright">
                <p>© 2022 Tradingpost</p>
            </div>
            <div className="footerlinks">
                <a href={"../assets/DraftPrivacyPolicy-HivemindStudios-TradingpostApp.pdf"}
                   target="_blank" rel="noreferrer"
                   style={{
                       color: "white"
                   }}>Privacy Policy</a>
                <a href="/" style={{
                    color: "white",
                }}>Terms of Service</a>
                <a href="/" style={{
                    color: "white",
                }}>Contact Us</a>

            </div>
            <div className="socialMedia">
                <a href="https://twitter.com/TradingPost_App" target="_blank" rel="noreferrer">
                    <img className="twitter" alt=''/>
                </a>
                <a href="https://linkdin.com" target="_blank" rel="noreferrer">
                    <img className="linkdin" alt=''/>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                    <img className="tiktok" alt=''/>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                    <img className="instagram" alt=''/>
                </a>
            </div>
        </div>
    );
}
export default Footer;