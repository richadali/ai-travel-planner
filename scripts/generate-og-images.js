const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

// Create directory if it doesn't exist
const ogDir = path.join(__dirname, "..", "public", "og");
if (!fs.existsSync(ogDir)) {
  fs.mkdirSync(ogDir, { recursive: true });
}

// Register fonts
registerFont(path.join(__dirname, "fonts", "Inter-Bold.ttf"), {
  family: "Inter",
  weight: "bold",
});
registerFont(path.join(__dirname, "fonts", "Inter-Regular.ttf"), {
  family: "Inter",
  weight: "normal",
});

// Create default OG image
async function createOGImage(
  title = "AI Travel Planner",
  subtitle = "Plan your perfect trip with AI"
) {
  // Create canvas with OG image dimensions
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  // Draw gradient background
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(1, "#1e293b");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  // Draw title
  context.font = "bold 60px Inter";
  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.fillText(title, width / 2, height / 2 - 30);

  // Draw subtitle
  context.font = "40px Inter";
  context.fillStyle = "#94a3b8";
  context.fillText(subtitle, width / 2, height / 2 + 40);

  // Draw button
  const buttonWidth = 320;
  const buttonHeight = 60;
  const buttonX = (width - buttonWidth) / 2;
  const buttonY = height / 2 + 100;

  context.fillStyle = "#4f46e5";
  context.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
  context.fill();

  context.font = "bold 24px Inter";
  context.fillStyle = "#ffffff";
  context.fillText("Plan Your Perfect Trip with AI", width / 2, buttonY + 38);

  // Save the image
  const buffer = canvas.toBuffer("image/jpeg");
  fs.writeFileSync(path.join(ogDir, "og-image.jpg"), buffer);
  console.log("OG image generated successfully!");
}

// Generate default OG image
createOGImage().catch(console.error);

// Note: This is a placeholder script. In a real implementation, you would need to:
// 1. Install the 'canvas' package: npm install canvas
// 2. Create a fonts directory with Inter font files
// 3. Implement more sophisticated image generation logic
