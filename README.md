# SEK - TempVC Bot

Discord Temporary Voice Channel bot and interactive management dashboard for automatic voice room generation, channel locking, renaming, and urgent staff alerts.

## Features

- **Tap-to-Create Voice Channels**: Automatically generates dedicated voice rooms when a user joins the configured `CREATE_VC_ID` room.
- **Discord Bot Controller Embed**: Automatically generates an embed with interactive buttons:
  - 🔒 **Lock**: Locks the channel by restricting the `@everyone` role from connecting.
  - 🔓 **Unlock**: Reopens the channel for all users.
  - ✏️ **Rename**: Allows the room owner, bot owner, or server admin to change the channel name (up to 50 characters).
  - 🚨 **Get Staff**: Mentions the configured `HIGH_STAFF_ROLE_IDS` for emergency voice assistance.
- **Auto-Cleanup**: Automatically deletes temporary voice channels when the last participant leaves.
- **Permission Checking**: Strictly enforces that only the channel owner, master bot owner, or administrator can execute channel controls (`❌ هذه ليست رومك الخاصة!`).
- **Interactive Web Simulator & Management Dashboard**: Full Discord UI simulator for testing voice flows, member states, and auditing events in real-time.
- **Real Discord Gateway Support**: Supports running with a live `DISCORD_BOT_TOKEN` in production or container environments.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `DISCORD_BOT_TOKEN` | Discord Bot Token from Developer Portal | *(optional in simulation mode)* |
| `CREATE_VC_ID` | Voice Channel ID for Tap-to-Create room | `1054739108905361469` |
| `MY_USER_ID` | Master Bot Owner Discord User ID | `1054739108905361469` |
| `HIGH_STAFF_ROLE_IDS` | Comma-separated High Staff Role IDs | `1054739108905361469, 1548474673124081795` |
| `PORT` | Web server port | `3000` |

## Scripts

- `npm run dev`: Starts the application with hot reloading via `tsx server.ts`
- `npm run build`: Bundles the client with Vite and server with esbuild
- `npm start`: Runs the compiled server in production mode
