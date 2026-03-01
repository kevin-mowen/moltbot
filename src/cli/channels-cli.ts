import type { Command } from "commander";
import {
  channelsAddCommand,
  channelsCapabilitiesCommand,
  channelsListCommand,
  channelsLogsCommand,
  channelsRemoveCommand,
  channelsResolveCommand,
  channelsStatusCommand,
} from "../commands/channels.js";
import { danger } from "../globals.js";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { runChannelLogin, runChannelLogout } from "./channel-auth.js";
import { formatCliChannelOptions } from "./channel-options.js";
import { runCommandWithRuntime } from "./cli-utils.js";
import { hasExplicitOptions } from "./command-options.js";

const optionNamesAdd = [
  "channel",
  "account",
  "name",
  "token",
  "tokenFile",
  "botToken",
  "appToken",
  "signalNumber",
  "cliPath",
  "dbPath",
  "service",
  "region",
  "authDir",
  "httpUrl",
  "httpHost",
  "httpPort",
  "webhookPath",
  "webhookUrl",
  "audienceType",
  "audience",
  "useEnv",
  "homeserver",
  "userId",
  "accessToken",
  "password",
  "deviceName",
  "initialSyncLimit",
  "ship",
  "url",
  "code",
  "groupChannels",
  "dmAllowlist",
  "autoDiscoverChannels",
] as const;

const optionNamesRemove = ["channel", "account", "delete"] as const;

function runChannelsCommand(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action);
}

function runChannelsCommandWithDanger(action: () => Promise<void>, label: string) {
  return runCommandWithRuntime(defaultRuntime, action, (err) => {
    defaultRuntime.error(danger(`${label}: ${String(err)}`));
    defaultRuntime.exit(1);
  });
}

export function registerChannelsCli(program: Command) {
  const channelNames = formatCliChannelOptions();
  const channels = program
    .command("channels")
    .description(t("cli.channels.description"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink(
          "/cli/channels",
          "docs.openclaw.ai/cli/channels",
        )}\n`,
    );

  channels
    .command("list")
    .description(t("cli.channels.list.description"))
    .option("--no-usage", t("cli.channels.list.noUsage"))
    .option("--json", t("options.json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsListCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("status")
    .description(t("cli.channels.status.description"))
    .option("--probe", t("cli.channels.status.probe"), false)
    .option("--timeout <ms>", t("options.timeout"), "10000")
    .option("--json", t("options.json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsStatusCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("capabilities")
    .description(t("cli.channels.capabilities.description"))
    .option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`)
    .option("--account <id>", t("cli.channels.capabilities.accountHelp"))
    .option("--target <dest>", t("cli.channels.capabilities.targetHelp"))
    .option("--timeout <ms>", t("options.timeout"), "10000")
    .option("--json", t("options.json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsCapabilitiesCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("resolve")
    .description(t("cli.channels.resolve.description"))
    .argument("<entries...>", t("cli.channels.resolve.entriesArg"))
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("options.account"))
    .option("--kind <kind>", t("cli.channels.resolve.kindHelp"), "auto")
    .option("--json", t("options.json"), false)
    .action(async (entries, opts) => {
      await runChannelsCommand(async () => {
        await channelsResolveCommand(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
            kind: opts.kind as "auto" | "user" | "group",
            json: Boolean(opts.json),
            entries: Array.isArray(entries) ? entries : [String(entries)],
          },
          defaultRuntime,
        );
      });
    });

  channels
    .command("logs")
    .description(t("cli.channels.logs.description"))
    .option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`, "all")
    .option("--lines <n>", t("cli.channels.logs.linesHelp"), "200")
    .option("--json", t("options.json"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsLogsCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("add")
    .description(t("cli.channels.add.description"))
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("options.account"))
    .option("--name <name>", "Display name for this account")
    .option("--token <token>", "Bot token (Telegram/Discord)")
    .option("--token-file <path>", "Bot token file (Telegram)")
    .option("--bot-token <token>", "Slack bot token (xoxb-...)")
    .option("--app-token <token>", "Slack app token (xapp-...)")
    .option("--signal-number <e164>", "Signal account number (E.164)")
    .option("--cli-path <path>", "CLI path (signal-cli or imsg)")
    .option("--db-path <path>", "iMessage database path")
    .option("--service <service>", "iMessage service (imessage|sms|auto)")
    .option("--region <region>", "iMessage region (for SMS)")
    .option("--auth-dir <path>", "WhatsApp auth directory override")
    .option("--http-url <url>", "Signal HTTP daemon base URL")
    .option("--http-host <host>", "Signal HTTP host")
    .option("--http-port <port>", "Signal HTTP port")
    .option("--webhook-path <path>", "Webhook path (Google Chat/BlueBubbles)")
    .option("--webhook-url <url>", "Google Chat webhook URL")
    .option("--audience-type <type>", "Google Chat audience type (app-url|project-number)")
    .option("--audience <value>", "Google Chat audience value (app URL or project number)")
    .option("--homeserver <url>", "Matrix homeserver URL")
    .option("--user-id <id>", "Matrix user ID")
    .option("--access-token <token>", "Matrix access token")
    .option("--password <password>", "Matrix password")
    .option("--device-name <name>", "Matrix device name")
    .option("--initial-sync-limit <n>", "Matrix initial sync limit")
    .option("--ship <ship>", "Tlon ship name (~sampel-palnet)")
    .option("--url <url>", "Tlon ship URL")
    .option("--code <code>", "Tlon login code")
    .option("--group-channels <list>", "Tlon group channels (comma-separated)")
    .option("--dm-allowlist <list>", "Tlon DM allowlist (comma-separated ships)")
    .option("--auto-discover-channels", "Tlon auto-discover group channels")
    .option("--no-auto-discover-channels", "Disable Tlon auto-discovery")
    .option("--use-env", "Use env token (default account only)", false)
    .action(async (opts, command) => {
      await runChannelsCommand(async () => {
        const hasFlags = hasExplicitOptions(command, optionNamesAdd);
        await channelsAddCommand(opts, defaultRuntime, { hasFlags });
      });
    });

  channels
    .command("remove")
    .description(t("cli.channels.remove.description"))
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("options.account"))
    .option("--delete", t("cli.channels.remove.deleteHelp"), false)
    .action(async (opts, command) => {
      await runChannelsCommand(async () => {
        const hasFlags = hasExplicitOptions(command, optionNamesRemove);
        await channelsRemoveCommand(opts, defaultRuntime, { hasFlags });
      });
    });

  channels
    .command("login")
    .description(t("cli.channels.login.description"))
    .option("--channel <channel>", `Channel (${channelNames})`)
    .option("--account <id>", t("options.account"))
    .option("--verbose", t("options.verbose"), false)
    .action(async (opts) => {
      await runChannelsCommandWithDanger(async () => {
        await runChannelLogin(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
            verbose: Boolean(opts.verbose),
          },
          defaultRuntime,
        );
      }, t("cli.channels.login.failed"));
    });

  channels
    .command("logout")
    .description(t("cli.channels.logout.description"))
    .option("--channel <channel>", `Channel (${channelNames})`)
    .option("--account <id>", t("options.account"))
    .action(async (opts) => {
      await runChannelsCommandWithDanger(async () => {
        await runChannelLogout(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
          },
          defaultRuntime,
        );
      }, t("cli.channels.logout.failed"));
    });
}
