import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);import bannerUrl from 'url';const __dirname = bannerUrl.fileURLToPath(new URL('.', import.meta.url));
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// open-next.config.ts
var require_open_next_config = __commonJS({
  "open-next.config.ts"(exports, module) {
    module.exports = {
      default: {
        runtime: "edge",
        output: "standalone",
        generateWorker: true
      }
    };
  }
});
export default require_open_next_config();
