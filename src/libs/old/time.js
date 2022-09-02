function getime(mode) {
  let date_time = new Date();
  let hour = date_time.getHours();
  let minu = date_time.getMinutes();
  let seco = date_time.getSeconds();
  let year = date_time.getFullYear();
  let mont = date_time.getMonth() + 1;
  let daay = date_time.getDate();
  let th = ('00' + hour).slice(-2);
  let tm = ('00' + minu).slice(-2);
  let ts = ('00' + seco).slice(-2);
  let dy = ('0000' + year).slice(-4);
  let dm = ('00' + mont).slice(-2);
  let dd = ('00' + daay).slice(-2);
  return time = dy + "/" + dm + "/" + dd + " " + th + ":" + tm + ":" + ts;
}
