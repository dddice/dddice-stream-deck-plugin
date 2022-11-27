import API from "./api";

let websocket = null;
let pluginUUID = null;

const DestinationEnum = Object.freeze({
  HARDWARE_AND_SOFTWARE: 0,
  HARDWARE_ONLY: 1,
  SOFTWARE_ONLY: 2,
});

let API_KEY;
let timer;

const counterAction = {
  type: "com.dddice.quick-roll.macro",

  onKeyDown: function (context, settings, coordinates, userDesiredState) {
    timer = setTimeout(function () {
      const updatedSettings = {};
      updatedSettings["keyPressCounter"] = -1;

      counterAction.SetSettings(context, updatedSettings);
      counterAction.SetTitle(context, 0);
    }, 1500);
  },

  onKeyUp: function (context, settings, coordinates, userDesiredState) {
    clearTimeout(timer);

    console.log(`api key ${API_KEY}`);
    const api = new API(API_KEY);
    api.roll().create({
      dice: [{ type: settings.rollEquation, theme: settings.diceTheme }],
      room: settings.room,
      operator: {},
    });

    /*let keyPressCounter = 0;
    if (settings != null && settings.hasOwnProperty("keyPressCounter")) {
      keyPressCounter = settings["keyPressCounter"];
    }

    keyPressCounter++;

    const updatedSettings = {};
    updatedSettings["keyPressCounter"] = keyPressCounter;

    this.SetSettings(context, updatedSettings);

    this.SetTitle(context, keyPressCounter);*/
  },

  onWillAppear: function (context, settings, coordinates) {
    let keyPressCounter = 0;
    if (settings != null && settings.hasOwnProperty("keyPressCounter")) {
      keyPressCounter = settings["keyPressCounter"];
    }

    this.SetTitle(context, keyPressCounter);
  },

  SetTitle: function (context, keyPressCounter) {
    const json = {
      event: "setTitle",
      context: context,
      payload: {
        title: "" + keyPressCounter,
        target: DestinationEnum.HARDWARE_AND_SOFTWARE,
      },
    };

    websocket.send(JSON.stringify(json));
  },

  SetSettings: function (context, settings) {
    const json = {
      event: "setSettings",
      context: context,
      payload: settings,
    };

    websocket.send(JSON.stringify(json));
  },
};

(window as any).connectElgatoStreamDeckSocket = (
  inPort,
  inPluginUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo
) => {
  pluginUUID = inPluginUUID;

  // Open the web socket
  websocket = new WebSocket("ws://127.0.0.1:" + inPort);

  console.log(inActionInfo);

  function registerPlugin(inPluginUUID) {
    const json = {
      event: inRegisterEvent,
      uuid: inPluginUUID,
    };

    websocket.send(JSON.stringify(json));
  }

  function getGlobalSettings(context) {
    console.log("getGlobalSettings");
    const json = {
      event: "getGlobalSettings",
      context: pluginUUID,
    };

    websocket.send(JSON.stringify(json));
  }

  websocket.onopen = function () {
    // WebSocket is connected, send message
    registerPlugin(pluginUUID);
  };

  websocket.onmessage = function (evt) {
    // Received message from Stream Deck
    const jsonObj = JSON.parse(evt.data);
    console.log(jsonObj);
    const event = jsonObj["event"];
    const action = jsonObj["action"];
    const context = jsonObj["context"];
    console.log(`message received <FK{{{ ${event}`);

    switch (event) {
      case "keyDown": {
        const jsonPayload = jsonObj["payload"];
        const settings = jsonPayload["settings"];
        const coordinates = jsonPayload["coordinates"];
        const userDesiredState = jsonPayload["userDesiredState"];
        counterAction.onKeyDown(
          context,
          settings,
          coordinates,
          userDesiredState
        );
        break;
      }
      case "keyUp": {
        const jsonPayload = jsonObj["payload"];
        const settings = jsonPayload["settings"];
        const coordinates = jsonPayload["coordinates"];
        const userDesiredState = jsonPayload["userDesiredState"];
        console.log("hello");
        console.log(API_KEY);
        counterAction.onKeyUp(context, settings, coordinates, userDesiredState);
        break;
      }
      case "willAppear": {
        const jsonPayload = jsonObj["payload"];
        const settings = jsonPayload["settings"];
        const coordinates = jsonPayload["coordinates"];
        counterAction.onWillAppear(context, settings, coordinates);
        break;
      }
      case "didReceiveGlobalSettings":
        console.log(jsonObj);
        API_KEY = jsonObj.payload.settings.apiKey;
        break;
      case "deviceDidConnect":
        getGlobalSettings(context);
        break;
    }
  };

  websocket.onclose = function () {
    // Websocket is closed
  };
};
