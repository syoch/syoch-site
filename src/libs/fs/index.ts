import * as types from "./types";

export * as types from "./types";
export type { Object as FSObj } from "./types";

export function fromJSON(obj: object): types.Object {
  if (obj == null) {
    return new types.Null();
  } else if (typeof obj === "number") {
    if (obj - Math.floor(obj) === 0) {
      return new types.Int(obj);
    } else {
      return new types.Float(obj);
    }
  } else if (typeof obj === "string") {
    return new types.StringItem(obj);
  } else if (typeof obj === "boolean") {
    return new types.Bool(obj);
  } else if (Array.isArray(obj)) {
    return new types.List(obj.map(fromJSON));
  } else if (typeof obj === "object") {
    return new types.Dict(
      Object.keys(obj).reduce((acc, key) => {
        acc[key] = fromJSON(obj[key]);
        return acc;
      }, {})
    );
  } else {
    throw new Error("Unknown type");
  }
}

export function isDict(obj: any): obj is types.Dict {
  return obj.flag_dict !== undefined;
}
export function isList(obj: any): obj is types.List {
  return obj.flag_list !== undefined;
}

export class Cursor {
  constructor(private root: types.Object, private cwd: string) {

  }
  get_object(): types.Object {
    let cur = this.root;

    for (let dir of this.cwd.split("/")) {
      if (!dir) { continue; }
      if (isDict(cur)) {
        cur = cur.get_child(dir);
      }
    }

    return cur;
  }
  parent() {
    this.cwd = `${this.cwd.split("/").slice(0, -2).join("/")}/`;
  }
  get_cwd(): string {
    return this.cwd;
  }

  cd(dir_name: string) {
    this.cwd += `${dir_name}/`;
  }
}