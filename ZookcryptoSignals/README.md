# ZookCryptoSignals# Telegram Launch Signal Bot

This is a simple Node.js Telegram bot that allows you to send a launch signal to one or more Telegram channels when you launch a new coin or token.

## Features

- Send a rich, formatted message to multiple Telegram channels with a single command
- Automatically extract the contract address (CA) from a previous message and use it in the signal
- Configurable via environment variables, making it easy to set up and manage
- Minimal dependencies, keeping the hosting costs low
- Supports GitHub Codespaces and other Node.js hosting platforms

## Getting Started

1. **Create a Telegram Bot**: Use the BotFather to create a new bot and obtain the bot token.
2. **Add the bot to your Telegram channels**: Make sure to add the bot as an admin to the channels where you want to post the launch signals.
3. **Obtain your Telegram user ID**: You can use services like @userinfobot or @RawDataBot to get your user ID.
4. **Gather the channel IDs**: Forward a message from each channel to @RawDataBot and copy the `chat.id` value (usually a negative number).
5. **Set up the project**:
   - Clone the repository or create a new folder for your project.
   - Create a `package.json` file with the necessary dependencies.
   - Create an `.env` file with the following variables:
     ```
     BOT_TOKEN=YOUR_BOT_TOKEN
     OWNER_ID=YOUR_TELEGRAM_USER_ID
     CHANNEL_IDS=-1001111111111,-1002222222222
     DEFAULT_WALLET=YOUR_SOL_WALLET_ADDRESS (optional)
     ```
   - Create an `index.js` file with the bot logic.
6. **Install dependencies and start the bot**:
   ```bash
   npm install
   npm start