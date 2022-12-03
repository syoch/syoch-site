import type { FSObj } from ".";

export enum ObjectKind {
  Int,
  String,
  Boolean,
  Float,
  Bytes,
  List,
  Dict, Null
};

export interface Object {
  kind: ObjectKind;

  get_value();
  toJSON(): string;
  dump(): string;
}

class ValueObject<T> implements Object {
  value: T;
  kind: ObjectKind;

  constructor(value: T) {
    this.value = value;
  }

  get_value() {
    return this.value;
  }

  toJSON(): string {
    return this.value.toString();
  }

  dump(): string {
    return this.toJSON();
  }
}

export class Int extends ValueObject<number> {
  kind = ObjectKind.Int;
}

export class StringItem extends ValueObject<string> {
  kind = ObjectKind.String;

  dump() {
    return `"${this.value}"`;
  }
}

export class Float extends ValueObject<number> {
  kind = ObjectKind.Float;
}
export class Bool extends ValueObject<boolean> {
  kind = ObjectKind.Boolean;
}

export class Bytes extends ValueObject<Uint8Array> {
  kind = ObjectKind.Bytes;
}

export class List extends ValueObject<Object[]> {
  flag_list = true;
  kind = ObjectKind.List;

  toJSON() {
    return `"List[${this.get_value().length}]"`;
  }

  dump() {
    return `[${this.get_value().map(x => x.dump()).join(",")}]`
  }
}

export class Dict extends ValueObject<{ [key: string]: Object }> {
  flag_dict = true;
  kind = ObjectKind.Dict;

  list() {
    return Object.keys(this.get_value());
  }

  get_child(key: string): Object {
    return this.get_value()[key];
  }

  toJSON(): string {
    const table = this.get_value();
    return `{${Object.keys(table).map(key => `${key}:${ObjectKind[table[key].kind]}`).join(",")}}`;
  }

  dump(): string {
    const table = this.get_value();
    return `{${Object.keys(table).map(key => `${key}:${table[key].dump()}`).join(",")}}`;
  }
}

export class Null implements Object {
  value: null;
  kind = ObjectKind.Null;

  constructor(public flag_null: string = "") {
    this.value = null;
  }

  get_value() {
    return this.value;
  }

  toJSON() {
    return "null";
  }
  dump(): string {
    return "null";
  }
}
