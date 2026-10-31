import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");

// Komponen web asli (../src) dipakai langsung di video: Tailwind dengan token yang sama, alias "@" seperti di web,
// pengganti next/* (shim), dan satu salinan react/three/fiber supaya tidak ada instance ganda.
const here = process.cwd(); // perintah selalu dijalankan dari folder video/
const mod = (p: string) => path.join(here, "node_modules", p);

Config.overrideWebpackConfig((config) => {
  const withTailwind = enableTailwind(config);
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...((withTailwind.resolve?.alias as Record<string, string>) ?? {}),
        "@": path.resolve(here, "../src"),
        "next/image": path.resolve(here, "src/shims/next-image.tsx"),
        "next/link": path.resolve(here, "src/shims/next-link.tsx"),
        "next/navigation": path.resolve(here, "src/shims/next-navigation.ts"),
        react: mod("react"),
        "react-dom": mod("react-dom"),
        three: mod("three"),
        "@react-three/fiber": mod("@react-three/fiber"),
      },
    },
  };
});
