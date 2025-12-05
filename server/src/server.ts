import app from "./app.js"; // Note: .js extension zaroori hai "type": "module" mein
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n===================================`);
  console.log(`🚀 Server is running on Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`===================================\n`);
});