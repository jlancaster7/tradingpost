import React from 'react';

import Home from './pages/Home';
import About from './pages/About';
import PrivacyPolicy from "./pages/PrivacyPolicy";

export const routes = [
    {
        path: "/",
        element: <Home/>,
    },
    {
        path: "about",
        element: <About/>,
    },
    {
        path: "privacy-policy",
        element: <PrivacyPolicy/>
    }
]