class MockFormData implements FormData {
  private data: Map<string, any> = new Map();

  append(name: string, value: string | Blob, fileName?: string): void {
    this.data.set(name, value);
  }

  delete(name: string): void {
    this.data.delete(name);
  }

  get(name: string): FormDataEntryValue | null {
    return this.data.get(name) || null;
  }

  getAll(name: string): FormDataEntryValue[] {
    const value = this.data.get(name);
    return value ? [value] : [];
  }

  has(name: string): boolean {
    return this.data.has(name);
  }

  set(name: string, value: string | Blob, fileName?: string): void {
    this.data.set(name, value);
  }

  forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void): void {
    this.data.forEach((value, key) => callbackfn(value, key, this));
  }

  entries(): IterableIterator<[string, FormDataEntryValue]> {
    return this.data.entries();
  }

  keys(): IterableIterator<string> {
    return this.data.keys();
  }

  values(): IterableIterator<FormDataEntryValue> {
    return this.data.values();
  }

  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]> {
    return this.entries();
  }
}

// @ts-ignore
global.FormData = MockFormData;
