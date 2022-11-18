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
  toJSON();
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

  toJSON() {
    return this.value.toString();
  }
}

export class Int extends ValueObject<number> {
  kind = ObjectKind.Int;
}

export class String extends ValueObject<string> {
  kind = ObjectKind.String;
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
  kind = ObjectKind.List;
}

export class Dict extends ValueObject<{ [key: string]: Object }> {
  flag_dict = null;
  kind = ObjectKind.Dict;

  list() {
    return Object.keys(this.get_value());
  }

  get_child(key: string): Object {
    return this.get_value()[key];
  }

  toJSON(): string {
    const table = this.get_value();
    return "{" + Object.keys(table).map(key => key + ":" + ObjectKind[table[key].kind]).join(",") + "}";
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
}
