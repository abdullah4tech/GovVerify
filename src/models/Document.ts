import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  title: string;
  url: string;
  category: string;
  status: "verified" | "pending" | "rejected";
  confidenceScore: number;
  usageCount: number;
  uploaderId: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["verified", "pending", "rejected"],
      default: "pending",
    },
    confidenceScore: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    uploaderId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);
