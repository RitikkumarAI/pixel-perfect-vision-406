import http from "k6/http";
import ws from "k6/ws";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    api_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 1000 }, // Ramp up to 1000 users
        { duration: "3m", target: 1000 }, // Hold at 1000 users
        { duration: "1m", target: 0 }, // Ramp down
      ],
    },
    websocket_load: {
      executor: "constant-vus",
      vus: 10000,
      duration: "5m",
    },
  },
};

export default function () {
  // Simulate API Request
  const res = http.get("http://api.nexus.local/api/v1/health");
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}

export function websocketSimulation() {
  const url = "ws://api.nexus.local/";
  const params = { tags: { my_tag: "websocket" } };

  const res = ws.connect(url, params, function (socket) {
    socket.on("open", function () {
      socket.send(JSON.stringify({ event: "ping" }));
    });

    socket.on("message", function (msg) {
      check(msg, { "received pong": (m) => m.includes("pong") });
    });

    socket.setTimeout(function () {
      socket.close();
    }, 60000); // 1 min per socket
  });

  check(res, { "status is 101": (r) => r && r.status === 101 });
}
