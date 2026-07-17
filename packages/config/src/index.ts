export { loadConfig } from "./loader/configLoader.js";
export type { ConfigLoadResult } from "./loader/configLoader.js";

export { defaultConfig } from "./defaults/defaultConfig.js";

export { validateConfig } from "./validation/validateConfig.js";
export type {
  ConfigValidationError,
  ConfigValidationResult,
} from "./validation/validateConfig.js";
