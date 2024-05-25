import {supabaseClient} from "./supabase";

export const evaluate = async (organizationId: string, query: string, input: any) => {
    const response = await fetch(`http://localhost:1324/evaluate/${organizationId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input,
            query,
        }),
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }
    return data;
}

export const getOrganizationIdsForGuild = async (guildId: string, kind: "discord" | "slack") => {
    const column = kind === "discord" ? "discord_guild_id" : "slack_workspace_id";
    const result = await supabaseClient.from("organizations").select("id").eq(column, guildId);
    return result.data.map(org=>org.id)
}
