import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updateVideo, togglePublishStatus, summarizeVideo} from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJWT) //Use VerfyJWT for all other routes

router.route("/")
.get(getAllVideos)


router.route("/")
.post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
)

// Specific routes must come before generic /:videoId route
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
router.route("/:videoId/summarize").post(summarizeVideo);

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail") , updateVideo)

export default router;