import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import {Schema, model} from "mongoose";

mongoose.connect(process.env.MONGODB_URL as string)
 .then(() => {
      console.log("✅ Connected to MongoDB successfully");
    })
    .catch((error) => {
      console.error("❌ Failed to connect to MongoDB:", error.message);
      process.exit(1);
    });  

const UserSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
});

export const UserModel = model("User", UserSchema);

const ContentSchema=new Schema({
  title: String,
  link: String,
  // support more content types: youtube, twitter, image, document, text
  type: { type: String, enum: ['youtube', 'twitter', 'image', 'document', 'text'], default: 'youtube' },
  // For text content we store the body directly
  body: String,
  // optional filename/mime for future file uploads
  filename: String,
  mime: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
})

export const ContentModel=model("Content",ContentSchema);

const LinkSchema=new Schema({
  hash:String,
  userId:{type:mongoose.Types.ObjectId,ref:"User",required:true,unique:true},
})

export const LinkModel=model("Link",LinkSchema);