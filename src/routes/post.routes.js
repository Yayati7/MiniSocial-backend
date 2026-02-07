import express from "express";
import {
  createPost,
  getPosts,
  likePost,
  commentPost,
  deleteComment,
  deletePost,
} from "../controllers/post.controller.js";

const router = express.Router();

/* ---------- POST ROUTES ---------- */
router.post("/", createPost);
router.get("/", getPosts);
router.post("/:id/like", likePost);
router.post("/:id/comment", commentPost);
router.delete("/:id/comment/:commentId", deleteComment);
router.delete("/:id", deletePost);


export default router;
