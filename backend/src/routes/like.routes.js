import { Router } from "express";
import {
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
  getLikedVideos,
  getLikedTweets
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); 

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/tweets").get(getLikedTweets);

export default router;