interface TokenEncoder {
  encode(text: string): number[];
}

let encoder: TokenEncoder | undefined;

export async function countTokens(text: string): Promise<number> {
  if (!encoder) {
    const { encodingForModel } = await import("js-tiktoken");

    encoder = encodingForModel("gpt-4o");
  }

  return encoder.encode(text).length;
}
