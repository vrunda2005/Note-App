declare module "@google/genai" {
  // Minimal typing to satisfy TypeScript/Next builds in this project.
  // The real package exports a GoogleGenAI client with a `models.generateContent` method.
  export class GoogleGenAI {
    constructor(opts: { apiKey?: string });
    models: {
      generateContent(opts: { model: string; contents: string | any[] }): Promise<any>;
      // other methods omitted
    };
  }
  const _default: any;
  export default _default;
}
