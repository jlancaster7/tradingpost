import React from "react";

const PageBottom = () => {

    return (
            <div className="pageBottom">
                <p>
                    Download TradingPost App today!
                </p>
                <div className="appStoreIcons">
                    <a href="https://play.google.com/store/apps/details?id=com.tradingpostapp" target="_blank" rel="noreferrer">
                        <span className="playstore"/>
                    </a>
                    <a href="https://apps.apple.com/us/app/tradingpost-app/id6443603177" target="_blank" rel="noreferrer">
                        <span className="appstore" />
                    </a>
                </div>
                <p>
                    Or check it out on the Web App:
                </p>
                <div className="webAppLinkContainer">
                    <a href="https://m.tradingpostapp.com" >
                        <h1 className="webAppLink">
                            TradingPost Web App
                        </h1>
                    </a>
                </div>

            </div>
    );
}


export default PageBottom;