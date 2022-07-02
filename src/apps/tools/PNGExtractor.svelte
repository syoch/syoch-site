<script lang="ts">
  import Button from "@smui/button";

  const PNG_HEAD = [137, 80, 78, 71];
  const PNG_TAIL = [73, 69, 78, 68, 174, 66, 96, 130];

  let image_urls: Array<string> = [];

  function startswith(
    source: Uint8Array,
    pattern: Array<number>,
    index: number
  ) {
    for (let i = 0; i < pattern.length; i++) {
      if (source[index + i] != pattern[i]) {
        return false;
      }
    }
    return true;
  }

  function find_subarray(
    source: Uint8Array,
    pattern: Array<number>,
    index: number
  ) {
    for (let start = index; start < source.length; start++) {
      if (startswith(source, pattern, start)) {
        return start;
      }
    }
    return -1;
  }

  function detect_png_files(file: Uint8Array) {
    var index = 0;
    while (1) {
      let start_pos = find_subarray(file, PNG_HEAD, index);
      let end_pos = find_subarray(file, PNG_TAIL, start_pos);

      if (start_pos == -1 || end_pos == -1) {
        break;
      }

      index = end_pos + PNG_TAIL.length;

      let png = file.slice(start_pos, end_pos + 8);
      let png_url = URL.createObjectURL(new Blob([png]));

      image_urls = [...image_urls, png_url];
    }
  }

  function onFileSelected(e) {
    var reader = new FileReader();
    reader.onload = () => {
      let buffer = reader.result as ArrayBuffer;
      detect_png_files(new Uint8Array(buffer));
      console.log(image_urls);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  }
</script>

<div>
  <Button variant="raised">
    <input type="file" id="file_input" on:change={(e) => onFileSelected(e)} />
    Select File
  </Button><br />

  {#if image_urls}
    {#each image_urls as url}
      <img class="detected_image" src={url} alt="" />
    {/each}
  {:else}
    No images are detected.
  {/if}
</div>

<style>
  #file_input {
    opacity: 0;
    appearance: none;
    position: absolute;
  }

  .detected_image {
    border: 1px solid #ccc;

    background: linear-gradient(
        45deg,
        #212121 25%,
        transparent 25%,
        transparent 75%,
        #212121 75%
      ),
      linear-gradient(
        45deg,
        #212121 25%,
        transparent 25%,
        transparent 75%,
        #212121 75%
      );
    background-color: #bdbdbd;
    background-size: 12px 12px;
    background-position: 0 0, 6px 6px;
  }
</style>
