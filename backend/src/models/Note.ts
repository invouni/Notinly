import mongoose, { Schema } from "mongoose"

const noteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled",
    },

    type: {
      type: String,
      enum: ["note", "folder"],
      default: "note",
      required: true,
    },

    content: {
      type: Schema.Types.Mixed,
      default: null,
    },

    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

noteSchema.index({ userId: 1, parentId: 1 })

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema)

export default Note