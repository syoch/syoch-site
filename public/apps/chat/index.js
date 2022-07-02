let rooms = $("#rooms");

let chat = io("/chat", {
  path: "/ws/socket.io"
});

chat.on("connect", () => {
  console.log("connected");
  chat.emit("get_all_rooms");
  chat.emit("get_messages", 1);
});

chat.on("all_rooms", (data) => {
  rooms.empty();
  data.forEach((room) => {
    let element = $("<div>");
    element.addClass("room");
    element.attr("id", `room${room[0]}`)
    element.text(room[1]);
    rooms.append(element);
  });
});

chat.on("messages", (messages) => {
  console.log("messages", messages);
})

$("#rooms").on("wheel", (e) => {
  let delta = e.originalEvent.deltaY;

  let thumb = $("#rooms_scroll>.thumb");
  let rooms = $("#rooms");
  let scroll = $("#rooms_scroll");

  let thumb_size = thumb.height();
  let rooms_size = rooms.height();
  let scroll_size = scroll.height();

  let thumb_max = scroll_size - thumb_size;

  let margin = thumb.css("margin-top");
  margin = parseInt(margin.substring(0, margin.length - 2));
  margin += delta / 20;

  margin = Math.max(0, margin);
  margin = Math.min(margin, thumb_max);

  console.log(thumb_max, margin);
  thumb.css("margin-top", margin + "px");
  rooms.css("margin-top", -margin * thumb_max / scroll_size);
})