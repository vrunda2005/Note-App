// src/lib/getGeminiSdk.ts
// Runtime wrapper to load the `@google/genai` package without forcing
// Next's build-time bundler to resolve it (avoids Module not found during compile).

export function getGeminiSDK(): any | null {
  try {
    // Use a runtime `require` obtained via `eval` to avoid bundlers statically
    // resolving the `@google/genai` package during build.
    // eslint-disable-next-line no-eval
    const req: any = eval("require");
    const pkg = req("@google/genai");
    return pkg?.GoogleGenAI ?? pkg ?? null;
  } catch (e) {
    // Package not installed or cannot be resolved in this environment
    return null;
  }
}

