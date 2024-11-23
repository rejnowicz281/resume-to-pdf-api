import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";

export default function middleware(app: Express) {
    app.use(express.json());
    app.use(
        cors({
            origin: [
                "http://localhost:5173",
                "https://test--resume-to-pdf.netlify.app",
                "https://resume-to-pdf.netlify.app"
            ],
            credentials: true
        })
    );
    app.use(compression());
    app.use(helmet());
    app.use(cookieParser());
}
