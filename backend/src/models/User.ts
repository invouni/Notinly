import mongoose, { Schema, type Model } from "mongoose"

export interface IUser {
  name: string
  firebaseUid: string
  email: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    firebaseUid: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema)

export default User