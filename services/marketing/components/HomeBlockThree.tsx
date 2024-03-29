import React from "react";
import ItsYourDataSvg from '../public/Itsyourdata.svg'
import Image from 'next/image'

const HomeBlockThree = () => {
    return (
        <div className="blockthree">

            <div className="grid-container-b3">
                <div className='grid-item-left-b3'>
                    <h1>It's your data. We'll never sell it</h1>
                    <p>Unlike other platforms, we'll never profit off your private information.
                        We only make money when content creators make money. Put your content behind a paywall,
                        share it with the general public, or make it free for groups of your choosing.
                    </p>
                </div>
                <div className='grid-item-right-b3'>
                    <Image src={ItsYourDataSvg} alt="image letting you know its your data, we do not sell it"/>
                </div>
            </div>

            <div className='discovery'>
                <h1>Customize Discovery</h1>
                <p>We help surface high quality analysts and traders so you can access the best research.
                    Whether you are looking for an energy, growth, or software analyst,
                    we can help you find what you need.
                </p>
            </div>
        </div>
    );
}

export default HomeBlockThree;