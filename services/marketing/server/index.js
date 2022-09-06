import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import {StaticRouter} from "react-router-dom/server";

import App from "../src/App";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get(['/', '/about', '/privacy-policy'], (req, res) => {
    let html = ReactDOMServer.renderToString(
        <StaticRouter location={req.url}>
            <App/>
        </StaticRouter>
    );

    const indexFile = path.resolve('./build/index.html');
    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Something went wrong: `, err);
            return res.status(500).send(`Oops, better luck next time`);
        }

        return res.send(
            data.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
        );
    });
});

app.use(express.static(path.resolve('./build')));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})

