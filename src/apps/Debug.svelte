<script lang="ts">
  import { generate_user_id } from "@src/wasm/pkg/wasm";
  import * as fs from "@src/libs/fs";

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

  let id = "";
  try {
    id = generate_user_id();
  } catch (e) {
    id = e.toString();
  }
</script>

<button
  on:click={() => {
    id = generate_user_id();
  }}>Regenerate ID: {id}</button
><br />
<h2>FS</h2>
<pre>{JSON.stringify(root, null, 2)}</pre>
