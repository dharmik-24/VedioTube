import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

//Now we have to do some configuaration settings ::

//Configuration setting for CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//Allow express to use json
app.use(express.json({limit: "16kb"}));

//allow express to use data from url
app.use(express.urlencoded({limit: "16kb"}));

app.use(express.static("public"));

app.use(cookieParser());



//Import Routers 
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js"


app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);

export {app};