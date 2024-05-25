import {Client, Events, GatewayIntentBits, Partials, Snowflake} from "discord.js";
import * as process from "process";
import {evaluate, getOrganizationIdsForGuild} from "./utils";
import {App, SayFn} from "@slack/bolt";

console.log("Loading...");

if (process.env.DISCORD_BOT_TOKEN === undefined) {
    throw new Error(
        "DISCORD_BOT_TOKEN is not set. Did you create a .env file?"
    );
}
// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
    ]
})

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client
    .once(Events.ClientReady, readyClient => {
        console.log(`Discord Bot Ready! Logged in as ${readyClient.user.tag}`);
    });

const processDiscordEventSafe = async (guildId: Snowflake, input:any) => {
    try {
        const orgIds = await getOrganizationIdsForGuild(guildId, "discord");
        await Promise.all(orgIds.map(async orgId => {
            const result = await evaluate(orgId, "data.polism.info", input)
            const guild = await client.guilds.fetch(guildId);
            const systemChannel = guild.systemChannel;
            if (systemChannel == null) {
                throw new Error("System channel is not set");
            }
            for (const infoMessage of result) {
                const message = `**:information_source: info**\n${infoMessage}`;
                await systemChannel.send(message);
            }
        }));
    } catch (e) {
        console.error(e);
    }
}
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    await processDiscordEventSafe(reaction.message.guildId, {
        event: "reaction_add",
        user_id: user.id,
        user_name: user.username,
        message_id: reaction.message.id,
        emoji_name: reaction.emoji.name,
    });
})
client.on(Events.MessageReactionRemove, async (reaction, user) => {
    await processDiscordEventSafe(reaction.message.guildId, {
        event: "reaction_remove",
        user_id: user.id,
        user_name: user.username,
        message_id: reaction.message.id,
        emoji_name: reaction.emoji.name,
    });
})

// Log in to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

// todo: App Directory対応
const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});
const processSlackEventSafe = async (say:SayFn, input:any) => {
    try {
        const orgIds = await getOrganizationIdsForGuild("GLOBAL", "slack");
        await Promise.all(orgIds.map(async orgId => {
            const result = await evaluate(orgId, "data.polism.info", input)
            for (const infoMessage of result) {
                const message = `:information_source: info\n${infoMessage}`;
                await say(message);
            }
        }));
    } catch (e) {
        console.error(e);
    }
}
// on reaction add / remove all
app.event('reaction_added', async ({ event, say }) => {
    await processSlackEventSafe(say, {
        event: "reaction_add",
        user_id: event.user,
        user_name: event.user,
        message_id: event.item.ts,
        emoji_name: event.reaction,
    });
});
app.event('reaction_removed', async ({ event, say }) => {
    await processSlackEventSafe(say, {
        event: "reaction_remove",
        user_id: event.user,
        user_name: event.user,
        message_id: event.item.ts,
        emoji_name: event.reaction,
    });
});
(async () => {
    // Start the app
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running at :3000, please use ngrok or whatever to receive events from Slack!');
})();
