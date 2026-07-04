require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  try {
    console.log("Node:", process.version);
    console.log("Connecting...");

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected");
    console.log(conn.connection.host);
  } catch (err) {
    console.error("FULL ERROR:");
    console.error(err);
  }
})();