import React from "react";
import GainConfidenceSvg from '../public/Gainconfidence.svg';
import FeedInFront from '../public/FeedInForeFront.svg'
import DummyImage from '../public/DummyImage1.png';
import Image from 'next/image'

const HomeBlockOne = () => {
    return (
        <div className="blockone">
            <div className="blocktext">
                <Image src={GainConfidenceSvg} alt=""/>
                <h1>Gain Confidence By Following Expert Traders And Investors</h1>
                <p>
                    Subscribe to experts on the platform to learn how they invest and trade. Gain access to articles,
                    charts, trades, and watchlists so you can grow your skills and your wealth.
                </p>
                
            </div>
            <Image src={FeedInFront} alt=""/>
        </div>
    );
}

export default HomeBlockOne;