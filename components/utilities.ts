export const uint8ToHex = (uint8Array: Uint8Array): string[] => {
  return Array.from(uint8Array).map((byte) => byte.toString(16).padStart(2, "0"));
};
