# dddice Stream Deck Plugin

Use your Elgato Stream Deck to send rolls at a push of a button to dddice. 

## Features

### Quick Roll Macros
Use a quick roll macro action to quickly roll dice, as represented by a dice equation, to a configured room. All dice will be rolled in the same theme

### Pick up your dice button
Use a button from your stream deck to pick up all the dice you have rolled

### Clear table button (GM only)
A GM can use this button to clear all the dice off the table regardless of who rolled them

### Clear roll history (GM only)
A GM can use this button to delete all the roll result messages from the roll log

### Change room background (GM only)
Bind images to buttons. When you press the button the background of your room will be switched to the image on the button.

## Installation

1. Visit
   <https://github.com/dddice/dddice-stream-deck-plugin/raw/main/release/com.dddice.dddice.streamDeckPlugin>
2. Go to the download folder and open `com.dddice.dddice.streamDeckPlugin`.

## Feedback

dddice is built with our community in mind! We are extremely interested in your feedback. Interested in connecting with us?

- [Become a backer on Patreon](https://www.patreon.com/dddice)
- [Join the dddice Discord Server](https://discord.gg/VzHq5TfAr6)
- [Follow dddice on Twitter](https://twitter.com/dddice_app)
- [Join the dddice subreddit](https://reddit.com/r/dddice)
- [Subscribe to dddice on YouTube](https://www.youtube.com/channel/UC8OaoMy-oFAvebUi_rOc1dQ)
- [Follow dddice on Twitch](https://www.twitch.tv/dddice_app)

## Documentation and API

dddice features a robust API and SDK to build applications with.

- [API Documentation](https://docs.dddice.com/api?ref=foundry)
- [SDK Documentation](https://docs.dddice.com/sdk/js/latest?ref=foundry)

## Development

If you would like to contribute to this extension, follow the instructions below.

You will need [Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/).

We use [Volta](https://volta.sh) to pin our node and npm versions, but it's not necessary that you do as well

```shell
# Clone this repository
git clone git@github.com:dddice/dddice-stream-deck-plugin.git

# Install dependencies
npm i

# create a symlink to your stream deck plugins directory
mkdir %appdata%\Elgato\StreamDeck\Plugins\com.dddice.app.sdPlugin
mklink com.dddice.app.sdPlugin %appdata%\Elgato\StreamDeck\Plugins\com.dddice.app.sdPlugin /D

# Start the package bundler
npm run start
```

## License

The plugin is available as open source under the terms of the
[MIT License](https://opensource.org/licenses/MIT). A copy of the license can be
found at <https://github.com/dddice/dddice-stream-deck-plugin/blob/main/LICENSE.md>.