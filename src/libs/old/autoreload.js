function reload() {
  console.log("Reloading page");
  window.location.reload(1);
}

function socketIOReloader() {
  console.log("Connecting to Develop namespace")
  let sock = io("/develop", {
    path: "/ws/socket.io"
  });

  sock.on("connect", () => {
    console.log("Connected to Develop namespace!");
  });

  sock.on("reload", reload);
}
export function initAutoReload() {
  if (location.port == "3000") {
    console.log("Auto reloading is disabled in Browser Preview");
    return;
  } else if (location.port == "10000") {
    console.log("Auto reloading is disabled in production mode");
    return;
  }
  socketIOReloader();
}