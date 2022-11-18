<script lang="ts">
  import { generate_user_id } from "@src/wasm/pkg/wasm";
  import * as fs from "@src/libs/fs";
  import Terminal from "@components/Terminal.svelte";

  let root = fs.fromJSON({
    usr: {
      packages: {},
      mime: {
        application: {},
        text: {
          cafecode: {
            extensions: [".cafecode"],
            handler: "0syoch/cafecode",
          },
          minecode2: {
            extensions: [".cafecode"],
            handler: "0syoch/cafecode",
          },
        },
      },
      apps: {
        sys: {
          ".folder.json": {
            name: "System Apps",
            icons: "system/icon_setting",
          },
          "explorer.app": {},
          "setting.app": {},
          "terminal.app": {},
        },
        "notepad.app": {},
        "Necko.app": {},
        "analysis.app": {},
      },
      lib: {
        "http_wrap.mc2": {},
        "gui.mc2": {},
        "necko.mc2": {},
      },
    },
    mnt: {
      "?wiiu": {
        type: "mount",
        parameters: {
          fs: "0syoch/FTP",
          source: "ftp://192.168.3.4:21/",
        },
      },
    },
    workspace: {},

    "?sys": {
      type: "mount",
      parameters: {
        fs: "system/virtual_fs",
        source: "system/sysfs",
      },
    },
  });

  let cursor = new fs.Cursor(root, "/");

  eval("window.cursor = cursor");

  let id = "";
  try {
    id = generate_user_id();
  } catch (e) {
    id = e.toString();
  }

  // let session = new DebugTerminalSession();
</script>

<button
  on:click={() => {
    id = generate_user_id();
  }}>Regenerate ID: {id}</button
><br />

<Terminal
  prompt={() =>
    "/" +
    cursor
      .get_cwd()
      .split("/")
      .filter(Boolean)
      .map((x) => (x[0] == "?" ? x.slice(0, 2) : x[0]))
      .join("/") +
    " $"}
  handler={(cmd, write) => {
    let [command, ...args] = cmd.trim().split(" ");
    switch (command) {
      case "ls": {
        const obj = cursor.get_object();
        if (!obj) {
          write("Failed to get object");
        }

        if (!fs.isDict(obj)) {
          write(`"${cursor.get_cwd()}" is not path.`);
          break;
        }

        const files = obj.list();
        write(`Current Directory: ${cursor.get_cwd()}\n`);
        for (const file_name of files) {
          const file = obj.get_child(file_name);

          const line =
            file_name.padEnd(20, " ") +
            " " +
            fs.types.ObjectKind[file.kind].padEnd(8);

          if (!fs.isDict(file)) {
            write(`${line} [${file.toJSON()}]\n`);
          } else {
            write(`${line}\n`);
          }
        }

        break;
      }
      case "cd": {
        const going_to = args.join(" ");
        const obj = cursor.get_object();

        if (going_to == "..") {
          cursor.parent();
          break;
        }

        if (fs.isDict(obj)) {
          const new_obj = obj.get_child(going_to);
          if (!fs.isDict(new_obj)) {
            write(`Cannot cd to non-Dict object`);
          }
          cursor.cd(going_to);
        }
        break;
      }

      default:
        write(`Unknown command: ${command}`);
    }
  }}
/>
