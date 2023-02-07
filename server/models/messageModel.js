const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    PublicKey: { type: Number, required: true}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", messageSchema);