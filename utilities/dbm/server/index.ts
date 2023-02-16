import config from 'dotenv/config'
import express from "express";
import api from './api'
import bodyParser from 'body-parser';
const app = express();
const port = 8083; // default port to listen

app.use(bodyParser.json())
// define a route handler for the default home page
app.use("/api", api);

app.get("/", (req, res) => {
    // render the index template
    res.json({ "HELLO": "thing" })
});



// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Entity Manager server started at http://localhost:${port}`);
});