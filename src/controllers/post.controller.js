import { io } from "../app.js";
import Post from "../models/post.model.js";

/* ---------- CREATE POST ---------- */
export const createPost = async (req, res) => {
  try {
    const { username, text, image } = req.body;

    const post = new Post({
      username,
      text,
      image,
    });

    await post.save();
    io.emit("new_post", post);   // 🔥 broadcast to all users
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------- GET FEED ---------- */
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------- LIKE POST ---------- */
export const likePost = async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(username);

    if (alreadyLiked) {
      // UNLIKE
      post.likes = post.likes.filter((u) => u !== username);
    } else {
      // LIKE
      post.likes.push(username);
    }

    await post.save();

    io.emit("post_updated", post);   // real-time update

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ---------- COMMENT POST ---------- */
export const commentPost = async (req, res) => {
  try {
    const { username, text } = req.body;
    const { id } = req.params;

    const post = await Post.findById(id);

    post.comments.push({
      username,
      text,
    });

    await post.save();
    io.emit("post_updated", post);   // 🔥 notify everyone
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* --------------- DELETE COMMENT -------------- */
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { username } = req.body;

    const post = await Post.findById(id);

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // allow delete only if comment owner
    if (comment.username !== username) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.deleteOne();
    await post.save();

    io.emit("post_updated", post);

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --------------- DELETE POST -------------- */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.username !== username) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await post.deleteOne();

    io.emit("post_updated");

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

