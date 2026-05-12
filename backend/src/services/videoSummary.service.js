import fs from "fs";
import os from "os";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

if (ffprobeStatic?.path) {
    ffmpeg.setFfprobePath(ffprobeStatic.path);
}

const TEMP_AUDIO_DIR = path.join(os.tmpdir(), "videotube-ai-audio");
const MIN_TRANSCRIPT_WORDS = 12;
const MIN_TRANSCRIPT_CHARACTERS = 80;

const SUMMARY_FAILURE_REASONS = {
    API_LIMIT_REACHED: "API_LIMIT_REACHED",
    NO_AUDIO_DETECTED: "NO_AUDIO_DETECTED",
    INSUFFICIENT_CONTENT: "INSUFFICIENT_CONTENT",
    INVALID_VIDEO_URL: "INVALID_VIDEO_URL",
    UNSUPPORTED_AUDIO_FORMAT: "UNSUPPORTED_AUDIO_FORMAT",
    AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
    EMPTY_TRANSCRIPT: "EMPTY_TRANSCRIPT",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
};

const sanitizeFileName = (value = "") => value.replace(/[^a-zA-Z0-9-_]/g, "_");

class VideoSummaryError extends Error {
    constructor(reason, message, statusCode = 500, cause = null) {
        super(message);
        this.name = "VideoSummaryError";
        this.reason = reason;
        this.statusCode = statusCode;
        this.cause = cause;
    }
}

const createSummaryError = (reason, message, statusCode = 500, cause = null) => {
    return new VideoSummaryError(reason, message, statusCode, cause);
};

const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw createSummaryError(
            SUMMARY_FAILURE_REASONS.AI_SERVICE_ERROR,
            "GEMINI_API_KEY is not configured",
            500
        );
    }

    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const hasAudioStream = async (videoUrl) => {    //Check wheter Video has audio stream or not using ffprobe...
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoUrl, (error, metadata) => {
            if (error) {
                return reject(error);
            }

            const audioStreams = metadata?.streams?.filter((stream) => stream?.codec_type === "audio") || [];
            resolve(audioStreams.length > 0);
        });
    });
};

const mapExtractionError = (error) => {
    const message = String(error?.message || "");
    const lowerMessage = message.toLowerCase();

    if (
        lowerMessage.includes("invalid data found") ||
        lowerMessage.includes("404") ||
        lowerMessage.includes("403") ||
        lowerMessage.includes("not found") ||
        lowerMessage.includes("error opening input") ||
        lowerMessage.includes("server returned") ||
        lowerMessage.includes("failed to resolve hostname") ||
        lowerMessage.includes("input/output error") ||
        lowerMessage.includes("connection timed out") ||
        lowerMessage.includes("connection refused") ||
        lowerMessage.includes("tls")
    ) {
        return createSummaryError(
            SUMMARY_FAILURE_REASONS.INVALID_VIDEO_URL,
            "Video source could not be processed.",
            400,
            error
        );
    }

    if (
        lowerMessage.includes("unsupported") ||
        lowerMessage.includes("unknown format") ||
        lowerMessage.includes("could not find codec parameters")
    ) {
        return createSummaryError(
            SUMMARY_FAILURE_REASONS.UNSUPPORTED_AUDIO_FORMAT,
            "Audio format is not supported for transcription.",
            400,
            error
        );
    }

    return createSummaryError(
        SUMMARY_FAILURE_REASONS.INVALID_VIDEO_URL,
        "Video source could not be processed.",
        400,
        error
    );
};

const extractAudio = async (videoUrl, videoId) => {
    if (!videoUrl?.trim()) {
        throw createSummaryError(
            SUMMARY_FAILURE_REASONS.INVALID_VIDEO_URL,
            "Video source could not be processed.",
            400
        );
    }

    await fs.promises.mkdir(TEMP_AUDIO_DIR, { recursive: true });

    try {
        const videoHasAudio = await hasAudioStream(videoUrl);
        if (!videoHasAudio) {
            throw createSummaryError(
                SUMMARY_FAILURE_REASONS.NO_AUDIO_DETECTED,
                "No speech/audio was detected in this video.",
                400
            );
        }
    } catch (error) {
        if (error instanceof VideoSummaryError) {
            throw error;
        }
        throw mapExtractionError(error);
    }

    const outputAudioPath = path.join(
        TEMP_AUDIO_DIR,
        `${sanitizeFileName(videoId)}-${Date.now()}.wav`
    );

    await new Promise((resolve, reject) => {
        ffmpeg(videoUrl)
            .noVideo()
            .audioCodec("pcm_s16le")
            .audioFrequency(16000)
            .audioChannels(1)
            .format("wav")
            .on("end", resolve)
            .on("error", (error) => reject(mapExtractionError(error)))
            .save(outputAudioPath);
    });

    return outputAudioPath;
};

const mapGeminiError = (error) => {
    const statusCode = Number(error?.status || error?.code || 500);
    const message = String(error?.message || "");
    const lowerMessage = message.toLowerCase();

    if (statusCode === 429 || lowerMessage.includes("quota") || lowerMessage.includes("rate limit")) {
        return createSummaryError(
            SUMMARY_FAILURE_REASONS.API_LIMIT_REACHED,
            "AI service limit has been reached. Please try again later.",
            429,
            error
        );
    }

    if (lowerMessage.includes("unsupported") || lowerMessage.includes("mime")) {
        return createSummaryError(
            SUMMARY_FAILURE_REASONS.UNSUPPORTED_AUDIO_FORMAT,
            "Audio format is not supported for transcription.",
            400,
            error
        );
    }

    return createSummaryError(
        SUMMARY_FAILURE_REASONS.AI_SERVICE_ERROR,
        "AI summary service is currently unavailable.",
        503,
        error
    );
};

const generateTranscriptWithGemini = async (audioPath) => {
    if (!audioPath) {
        throw createSummaryError(
            SUMMARY_FAILURE_REASONS.UNSUPPORTED_AUDIO_FORMAT,
            "Audio format is not supported for transcription.",
            400
        );
    }

    try {
        const geminiClient = getGeminiClient();
        const transcriptionModel = geminiClient.getGenerativeModel({
            model: process.env.GEMINI_TRANSCRIBE_MODEL || "gemini-1.5-flash"
        });
        //Gemini is a Cloud based API. It can not read your local files. So we need to convert the audio file to base64 string and send it to the API.
        const audioBuffer = await fs.promises.readFile(audioPath);
        const audioPayload = audioBuffer.toString("base64");

        const response = await transcriptionModel.generateContent([
            {
                text: "Transcribe the spoken content from this audio. Return plain transcript text only. If there is no speech, return an empty response."
            },
            {
                inlineData: {
                    mimeType: "audio/wav",
                    data: audioPayload
                }
            }
        ]);

        return response?.response?.text?.()?.trim() || "";
    } catch (error) {
        throw mapGeminiError(error);
    }
};

const generateSummaryWithGemini = async (transcript) => {
    if (!transcript?.trim()) {
        throw createSummaryError(
            SUMMARY_FAILURE_REASONS.EMPTY_TRANSCRIPT,
            "Transcript could not be generated from the video.",
            400
        );
    }

    const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < MIN_TRANSCRIPT_WORDS || transcript.trim().length < MIN_TRANSCRIPT_CHARACTERS) {
        throw createSummaryError(
            SUMMARY_FAILURE_REASONS.INSUFFICIENT_CONTENT,
            "Not enough spoken content is available to generate a summary.",
            400
        );
    }

    try {
        const geminiClient = getGeminiClient();
        const summaryModel = geminiClient.getGenerativeModel({
            model: process.env.GEMINI_SUMMARY_MODEL || "gemini-1.5-flash"
        });

        const prompt = [
            "Summarize the following video transcript into 5-7 concise bullet points.",
            "Keep it simple, readable, and easy to understand.",
            "",
            "Transcript:",
            transcript
        ].join("\n");

        const response = await summaryModel.generateContent(prompt);
        return response?.response?.text?.()?.trim() || "";
    } catch (error) {
        throw mapGeminiError(error);
    }
};

const cleanupFile = async (filePath) => {
    if (!filePath) {
        return;
    }

    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        // Ignore cleanup errors intentionally.
    }
};

export {
    extractAudio,
    generateTranscriptWithGemini,
    generateSummaryWithGemini,
    cleanupFile,
    VideoSummaryError,
    SUMMARY_FAILURE_REASONS
};
