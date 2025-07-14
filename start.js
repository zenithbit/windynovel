#!/usr/bin/env node

import { spawn, exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

console.log("🚀 WindyNovel Startup Script");
console.log("============================");

// Check if .env exists
if (!fs.existsSync(".env")) {
  console.log("❌ File .env không tồn tại!");
  console.log("💡 Vui lòng tạo file .env theo mẫu trong SETUP.md");
  process.exit(1);
}

// Check if node_modules exists
const checkDependencies = async () => {
  console.log("📦 Kiểm tra dependencies...");

  const rootNodeModules = fs.existsSync("node_modules");
  const serverNodeModules = fs.existsSync("server/node_modules");

  if (!rootNodeModules || !serverNodeModules) {
    console.log("📥 Cài đặt dependencies...");
    try {
      await execAsync("npm run install:all");
      console.log("✅ Dependencies đã được cài đặt!");
    } catch (error) {
      console.error("❌ Lỗi cài đặt dependencies:", error.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Dependencies đã có sẵn!");
  }
};

// Check MongoDB connection
const checkMongoDB = async () => {
  console.log("🍃 Kiểm tra kết nối MongoDB...");
  try {
    await execAsync("npm run check-mongo");
    console.log("✅ MongoDB kết nối thành công!");
  } catch {
    console.log("❌ Không thể kết nối MongoDB");
    console.log(
      "💡 Đảm bảo MongoDB đang chạy hoặc kiểm tra MONGODB_URI trong .env"
    );
    console.log(
      "   Tiếp tục khởi động server... (có thể sẽ lỗi nếu không có MongoDB)"
    );
  }
};

// Start development environment
const startDev = () => {
  console.log("🎯 Khởi động development environment...");
  console.log("");
  console.log("Frontend: http://localhost:5173");
  console.log("Backend:  http://localhost:8080");
  console.log("API Health: http://localhost:8080/api/health");
  console.log("");
  console.log("💡 Nhấn Ctrl+C để dừng cả 2 services");
  console.log("============================");

  const devProcess = spawn("npm", ["run", "dev:all"], {
    stdio: "inherit",
    shell: true,
  });

  devProcess.on("close", (code) => {
    console.log(`\n🛑 Development server stopped with code ${code}`);
  });

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping development server...");
    devProcess.kill("SIGINT");
    process.exit(0);
  });
};

// Main execution
const main = async () => {
  try {
    await checkDependencies();
    await checkMongoDB();
    startDev();
  } catch (error) {
    console.error("❌ Startup error:", error.message);
    process.exit(1);
  }
};

main();
