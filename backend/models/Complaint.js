const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["english", "tamil"],
      default: "english",
    },

    // Step 1: where the product was purchased
    purchaseType: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    // Filled only when purchaseType === "online"
    orderPlatform: { type: String, enum: ["blinkit", "swiggy", ""], default: "" },
    orderId: { type: String, trim: true, default: "" },
    // Filled only when purchaseType === "offline"
    storeName: { type: String, trim: true, default: "" },
    area: { type: String, trim: true, default: "" },

    // Customer details
    customerName: { type: String, trim: true, required: true },
    contactNumber: { type: String, trim: true, required: true },
    problem: { type: String, trim: true, required: true },

    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
    attachmentUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
