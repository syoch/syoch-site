function getime(mode) {
  let jikan = new Date();
  let hour = jikan.getHours();
  let minu = jikan.getMinutes();
  let seco = jikan.getSeconds();
  let year = jikan.getFullYear();
  let mont = jikan.getMonth() + 1;
  let daay = jikan.getDate();
  let th = ('00' + hour).slice(-2);
  let tm = ('00' + minu).slice(-2);
  let ts = ('00' + seco).slice(-2);
  let dy = ('0000' + year).slice(-4);
  let dm = ('00' + mont).slice(-2);
  let dd = ('00' + daay).slice(-2);
  return time = dy + "/" + dm + "/" + dd + " " + th + ":" + tm + ":" + ts;
}
