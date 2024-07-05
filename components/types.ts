class Bit {
  private value: boolean;

  constructor(value: boolean) {
    this.value = value;
  }

  get(): boolean {
    return this.value;
  }

  set(value: boolean) {
    this.value = value;
  }

  toHex(): string {
    return this.value ? "1" : "0";
  }

  toBit(): string {
    return this.value ? "1" : "0";
  }
}

class Uint8 {
  private value: number;

  constructor(value: number) {
    this.value = value & 0xff; // Ensure the value is within 0-255
  }

  get(): number {
    return this.value;
  }

  set(value: number) {
    this.value = value & 0xff; // Ensure the value is within 0-255
  }

  toHex(): string {
    return this.value.toString(16).toUpperCase().padStart(2, "0");
  }

  toBit(): string {
    return this.value.toString(2).toUpperCase().padStart(8, "0");
  }

  toStr(): string {
    return this.value.toString();
  }
}

class Uint16 {
  private value: number;

  constructor(value: number) {
    this.value = value & 0xffff; // Ensure the value is within 0-65535
  }

  get(): number {
    return this.value;
  }

  set(value: number) {
    this.value = value & 0xffff; // Ensure the value is within 0-65535
  }

  toHex(): string {
    return this.value.toString(16).toUpperCase().padStart(4, "0");
  }

  toBit(): string {
    return this.value.toString(2).toUpperCase().padStart(16, "0");
  }

  toStr(): string {
    return this.value.toString();
  }
}

export { Uint8, Uint16 };
