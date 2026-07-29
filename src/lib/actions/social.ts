"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export type ActionResult = {
  error?: string;
  ok?: boolean;
};

export async function sendFriendRequest(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const addresseeId = String(formData.get("addressee_id") ?? "").trim();
  if (!addresseeId) return { error: "Missing friend id." };
  if (addresseeId === auth.userId) {
    return { error: "Cannot friend yourself." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("friendships").insert({
    requester_id: auth.userId,
    addressee_id: addresseeId,
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath("/me");
  return { ok: true };
}

export async function respondFriendRequest(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const friendshipId = String(formData.get("friendship_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!friendshipId) return { error: "Missing friendship id." };
  if (status !== "accepted" && status !== "declined") {
    return { error: "Status must be accepted or declined." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .update({ status })
    .eq("id", friendshipId)
    .eq("addressee_id", auth.userId)
    .eq("status", "pending")
    .select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Request not found." };

  revalidatePath("/me");
  return { ok: true };
}

export async function joinLeague(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const leagueId = String(formData.get("league_id") ?? "").trim();
  if (!leagueId) return { error: "Missing league id." };

  const supabase = await createClient();
  const { error } = await supabase.from("league_members").upsert(
    {
      league_id: leagueId,
      user_id: auth.userId,
      weekly_xp: 0,
    },
    { onConflict: "league_id,user_id", ignoreDuplicates: true }
  );
  if (error) return { error: error.message };

  revalidatePath("/me");
  revalidatePath("/me/leaderboard");
  return { ok: true };
}

export async function createChallenge(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const opponentId = String(formData.get("opponent_id") ?? "").trim();
  const lessonId = String(formData.get("lesson_id") ?? "").trim() || null;
  if (!opponentId) return { error: "Missing opponent." };
  if (opponentId === auth.userId) {
    return { error: "Cannot challenge yourself." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("challenges").insert({
    challenger_id: auth.userId,
    opponent_id: opponentId,
    lesson_id: lessonId,
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath("/me");
  return { ok: true };
}

export async function respondChallenge(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const challengeId = String(formData.get("challenge_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!challengeId) return { error: "Missing challenge id." };
  if (status !== "active" && status !== "declined") {
    return { error: "Status must be active or declined." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .update({ status })
    .eq("id", challengeId)
    .eq("opponent_id", auth.userId)
    .eq("status", "pending")
    .select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Challenge not found." };

  revalidatePath("/me");
  return { ok: true };
}

export async function listFriends() {
  const auth = await requireUser();
  if ("error" in auth) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_friends");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLeagueLeaderboard(leagueId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("league_members")
    .select(
      "user_id, weekly_xp, joined_at, profile:profiles(display_name, profile_picture_url)"
    )
    .eq("league_id", leagueId)
    .order("weekly_xp", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}
