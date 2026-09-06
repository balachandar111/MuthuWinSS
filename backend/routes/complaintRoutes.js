const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Complaint = require('../models/Complaint'); // Adjust path as needed

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Accept a single "attachment" file (image or pdf), capped at 5MB.
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image (jpg, png, webp, gif) or PDF files are allowed"));
    }
  },
});

// POST /api/complaints -> save a new customer complaint (chatbot form
// submission), optionally with a single file attachment uploaded to
// Cloudinary.
router.post("/", (req, res) => {
  upload.single("attachment")(req, res, async (uploadErr) => {
    if (uploadErr) {
      const message =
        uploadErr.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Max size is 5MB."
          : uploadErr.message || "File upload failed.";
      return res.status(400).json({ success: false, message });
    }

    try {
      const {
        sessionId,
        language,
        purchaseType,
        orderPlatform,
        orderId,
        storeName,
        area,
        customerName,
        contactNumber,
        problem,
      } = req.body;

      if (!sessionId || !purchaseType || !customerName || !contactNumber || !problem) {
        return res.status(400).json({
          success: false,
          message:
            "sessionId, purchaseType, customerName, contactNumber and problem are required",
        });
      }

      let attachmentUrl = null;
      if (req.file) {
        attachmentUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "muthu-winss-chatbot/complaints" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
      }

      const newComplaint = await Complaint.create({
        sessionId,
        language,
        purchaseType,
        orderPlatform,
        orderId,
        storeName,
        area,
        customerName,
        contactNumber,
        problem,
        attachmentUrl,
      });

      return res.status(201).json({ success: true, data: newComplaint });
    } catch (err) {
      console.error("Error saving complaint:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
});

// GET /api/complaints -> list all complaints (for an admin/agent dashboard)
router.get("/", async (req, res) => {
  try {
    const { status, purchaseType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (purchaseType) filter.purchaseType = purchaseType;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/complaints/:id -> update status (e.g. agent marks resolved)
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating complaint:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
