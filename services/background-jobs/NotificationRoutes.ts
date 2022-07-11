import Routes from './routes';
import express from "express";

export default class NotificationRoutes extends  Routes {
    constructor(app: express.Application) {
        super(app, 'NotificationRoutes');
    }
}