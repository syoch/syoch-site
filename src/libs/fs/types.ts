
export interface Object {
  get_value();
}

export class Int implements Object {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }
}
export class String implements Object {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }
}
export class Float implements Object {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }
}
export class Bool implements Object {
  value: boolean;

  constructor(value: boolean) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }
}

export class Bytes implements Object {
  value: Uint8Array;

  constructor(value: Uint8Array) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }
}

export class List implements Object {
  value: Object[];

  constructor(value: Object[]) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }
}

export class Dict implements Object {
  value: { [key: string]: Object };

  constructor(value: { [key: string]: Object }) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }
}

export class Null implements Object {
  value: null;

  constructor() {
    this.value = null;
  }

  get_value() {
    return this.value;
  }
}
