
import type { Room} from "white-web-sdk";
import { WhiteWebSdk } from "white-web-sdk";
import type { ProjectorError} from "@netless/projector-plugin";
import {ProjectorDisplayer, ProjectorPlugin} from "@netless/projector-plugin";
import "./index.css";
import { bindControlPanel } from "./controlPanel";

const whiteBoardAppientirId = "PmRmgG6hEeymqYk1NAWK1w/Qj9hL8x9lgvAcQ"
const whiteBoardSDKToken = "NETLESSSDK_YWs9c1Z6bmpfQi1pTkRNQVJtNiZub25jZT1mNWRjNTA5MC1kYzlmLTExZWMtOTRhOC1iMzhlMGYxY2U3NDcmcm9sZT0wJnNpZz01OTg5OGNjNjQyODMxZTc4YmEyYjA4NDMzOTQwYjdkNTQzOGMyYmQ4OGM3NTliZWY2NjBkNjYyZjdlMGQ4ZmU2"
const debugRoomId = "3a014160dca811ec90eae11c4399a26a";
const debugRoomToken = "NETLESSROOM_YWs9eTBJOWsxeC1IVVo4VGh0NyZub25jZT0xNjUzNTM3NTYzMTE2MDAmcm9sZT0wJnNpZz1jZDFmN2Y1YWNkMTkwYjk3Mjg0NTc1NTFlYjc2M2MwODY3YzIxYjBhOWQ0YzQ3ZGZmNTFmNjIxZTE2ZGRhMzVkJnV1aWQ9M2EwMTQxNjBkY2E4MTFlYzkwZWFlMTFjNDM5OWEyNmE";


const whiteboard = new WhiteWebSdk({
    appIdentifier: whiteBoardAppientirId,
    useMobXState: true,
    invisiblePlugins: [ProjectorPlugin],
    wrappedComponents: [ProjectorDisplayer]
});
  
main();

async function main(): Promise<void> {
  const roomUUID = debugRoomId;
  const roomToken = debugRoomToken;
  const room = await (roomUUID && roomToken
    ? joinRoom(roomUUID, roomToken)
    : createRoom());
  (window as any).room = room;

  const appDiv = document.getElementById("root");
  if (appDiv) {
    room.bindHtmlElement(appDiv as HTMLDivElement);
  }
  console.log("start init plugin");
  
  const projectorPlugin = await ProjectorPlugin.getInstance(room, {
    logger: {
      info: console.log,
      error: console.error,
      warn: console.warn,
    },
    callback: {
      errorCallback: (e: ProjectorError) => {console.error(e)}
    }
  });
  if (!projectorPlugin) {
    alert("something wrong when create plugin!")
  } else {
    bindControlPanel(projectorPlugin, room);
    (window as any).projector = projectorPlugin;
  }
}

async function createRoom(): Promise<Room> {
  const { uuid } = await post<{ uuid: string }>("rooms", {
    limit: 0,
    isRecord: false,
  });
  const roomToken = await post<string>(`tokens/rooms/${uuid}`, {
    lifespan: 0,
    role: "admin",
  });
  
  localStorage.setItem("roomUUID", uuid);
  localStorage.setItem("roomToken", roomToken);
  return joinRoom(uuid, roomToken);
}

async function joinRoom(roomUUID: string, roomToken: string): Promise<Room> {
  const uid = "uid";
  return whiteboard.joinRoom({
    uuid: roomUUID,
    roomToken,
    uid,
    invisiblePlugins: [ProjectorPlugin],
    disableMagixEventDispatchLimit: true,
    userPayload: {
      uid,
      nickName: uid,
    },
  });
}

async function post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`https://api.netless.link/v5/${path}`, {
      method: "POST",
      headers: {
        token: whiteBoardSDKToken,
        region: "cn-hz",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return response.json();
}
