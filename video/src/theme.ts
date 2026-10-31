import { loadFont } from "@remotion/google-fonts/Poppins";

// Palet dari web MTJM (src/app/globals.css)
export const COLORS = {
  black: "#000000",
  navy: "#14144a",
  navyDeep: "#07082a",
  navy2: "#1b2a78",
  brand: "#1887cd",
  cyan: "#1dc7f4",
  white: "#ffffff",
};

const { fontFamily } = loadFont("normal", { weights: ["300", "400", "500", "600"], subsets: ["latin"] });
export const FONT = fontFamily;
