import React from "react";
import GainConfidenceSvg from '../assets/Gainconfidence.svg';
import DummyImage from '../assets/DummyImage1.png';

const HomeBlockOne = () => {
    return (
        <div className="blockone">
            <div className="blocktext">
                <img src={GainConfidenceSvg} alt=""/>
                <h1>Gain Confidence By Following Expert Traders And Investors</h1>
                <p>
                    Subscribe to experts on the platform to learn how they invest and trade. Gain access to articles,
                    charts, trades, and watchlists so you can grow your skills and your wealth.
                </p>
            </div>
            <img src={DummyImage} alt=""/>
        </div>
    );
}

export default HomeBlockOne;