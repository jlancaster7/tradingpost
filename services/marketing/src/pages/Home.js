import React from "react";
import SplashBlock from '../components/SplashBlock';
import HomeBlockOne from '../components/HomeBlockOne';
import HomeBlockTwo from '../components/HomeBlockTwo';
import HomeBlockThree from '../components/HomeBlockThree';
import HomeBlockFour from '../components/HomeBlockFour'

function Home() {
  return (
      <>
        <SplashBlock />
        <HomeBlockOne />
        <HomeBlockTwo />
        <HomeBlockThree />
        <HomeBlockFour />
      </>
  );
}

export default Home;