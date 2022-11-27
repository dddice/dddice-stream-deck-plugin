// this is our global websocket, used to communicate from/to Stream Deck software
// and some info about our plugin, as sent by Stream Deck software
let websocket = null,
  uuid = null,
  actionInfo = {};
let settings: Record<string, string> = {};

(window as any).connectElgatoStreamDeckSocket = (
  inPort,
  inUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo
) => {
  uuid = inUUID;
  // please note: the incoming arguments are of type STRING, so
  // in case of the inActionInfo, we must parse it into JSON first
  actionInfo = JSON.parse(inActionInfo); // cache the info
  websocket = new WebSocket("ws://localhost:" + inPort);

  console.log(inActionInfo);
  settings = actionInfo?.payload?.settings;

  Object.entries(settings).forEach(([key, value]) => {
    const element = document.getElementById(`dddice-${key}`) as HTMLElement;
    if (element) {
      element.setAttribute("value", value);
    }
  });

  // if connection was established, the websocket sends
  // an 'onopen' event, where we need to register our PI
  websocket.onopen = function () {
    var json = {
      event: inRegisterEvent,
      uuid: inUUID,
    };
    // register property inspector to Stream Deck
    websocket.send(JSON.stringify(json));
  };
};

// our method to pass values to the plugin
(window as any).setSetting = (key, value) => {
  console.log(`setSetting ${key}:${value}`);
  settings = { ...settings, [key]: value };
  const json = {
    event: "setSettings",
    context: uuid,
    payload: settings,
  };

  websocket.send(JSON.stringify(json));
};

(window as any).setGlobalSetting = (key, value) => {
  console.log(`setGlobalSetting ${key}:${value}`);
  const json = {
    event: "setGlobalSettings",
    context: uuid,
    payload: { [key]: value },
  };

  websocket.send(JSON.stringify(json));
};

// our method to pass values to the plugin
function sendValueToPlugin(value, param) {
  if (websocket) {
    const json = {
      action: actionInfo["action"],
      event: "sendToPlugin",
      context: uuid,
      payload: {
        [param]: value,
      },
    };
    websocket.send(JSON.stringify(json));
  }
}
