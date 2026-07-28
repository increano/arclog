"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { toUserFacingError } from "@/lib/errors";

export type ActionResult = {
  error?: string;
  ok?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string | null;
};

const GUEST_COOKIE = "arclog_guest_id";

async function ensureGuestId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  jar.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}

async function ensureProfile(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("ensure_user_profile", { p_user_id: userId });
}

export async function submitStepAnswer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const stepId = String(formData.get("step_id") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!stepId) return { error: "Missing step id." };

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    // Soft-wall onboarding: prefer guest attempts when there is no session.
    // If a session exists, ensure a profile row before writing user attempts.
    let guestId: string | null = null;
    if (userData.user) {
      await ensureProfile(userData.user.id);
    } else {
      guestId = await ensureGuestId();
    }

    const { data, error } = await supabase.rpc("submit_step_answer", {
      p_step_id: stepId,
      p_answer: answer,
      p_guest_id: guestId,
    });
    if (error) return { error: toUserFacingError(error.message) };

    const row = Array.isArray(data) ? data[0] : data;
    return {
      ok: true,
      isCorrect: Boolean(row?.is_correct),
      correctAnswer: row?.correct_answer ?? null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : undefined;
    return { error: toUserFacingError(message) };
  }
}

export async function completeLesson(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const lessonId = String(formData.get("lesson_id") ?? "").trim();
  const score = Number(formData.get("score") ?? 0);
  if (!lessonId) return { error: "Missing lesson id." };

  try {
    const supabase = await createClient();
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("id, xp_reward, is_guest_allowed, unit_id")
      .eq("id", lessonId)
      .maybeSingle();
    if (lessonError) return { error: toUserFacingError(lessonError.message) };
    if (!lesson) return { error: "Lesson not found." };

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      if (!lesson.is_guest_allowed) {
        return { error: "Sign in to complete this lesson." };
      }
      const guestId = await ensureGuestId();
      const { error } = await supabase.from("guest_lesson_progress").upsert(
        {
          guest_id: guestId,
          lesson_id: lessonId,
          status: "completed",
          score: Number.isFinite(score) ? score : 0,
          attempts: 1,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "guest_id,lesson_id" }
      );
      if (error) return { error: toUserFacingError(error.message) };
      return { ok: true };
    }

    const userId = userData.user.id;
    await ensureProfile(userId);

    const { data: existing } = await supabase
      .from("user_lesson_progress")
      .select("attempts, status")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: "completed",
        score: Number.isFinite(score) ? score : 0,
        attempts: (existing?.attempts ?? 0) + 1,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
    if (error) return { error: toUserFacingError(error.message) };

    const { data: steps } = await supabase
      .from("lesson_steps")
      .select("book_code, chapter, verse_start, verse_end, translation_slug")
      .eq("lesson_id", lessonId)
      .not("book_code", "is", null)
      .not("chapter", "is", null)
      .not("verse_start", "is", null);

    if (steps && steps.length > 0) {
      const rows = [];
      for (const s of steps) {
        if (!s.book_code || s.chapter == null || s.verse_start == null) continue;
        const end = s.verse_end ?? s.verse_start;
        for (let v = s.verse_start; v <= end; v++) {
          rows.push({
            user_id: userId,
            book_code: s.book_code,
            chapter: s.chapter,
            verse: v,
            translation_slug: s.translation_slug ?? "eng-kjv",
            mastery_score: 100,
          });
        }
      }
      if (rows.length > 0) {
        await supabase.from("mastered_verses").upsert(rows, {
          onConflict: "user_id,book_code,chapter,verse,translation_slug",
          ignoreDuplicates: true,
        });
      }
    }

    const xp = existing?.status === "completed" ? 0 : lesson.xp_reward;
    await supabase.rpc("record_learning_activity", { p_xp: xp });
    await supabase.rpc("evaluate_achievements");

    const { data: nextUnits } = await supabase
      .from("learning_units")
      .select("id")
      .eq("unlock_after_unit_id", lesson.unit_id);
    if (nextUnits && nextUnits.length > 0) {
      await supabase.from("user_path_unlocks").upsert(
        nextUnits.map((u) => ({ user_id: userId, unit_id: u.id })),
        { onConflict: "user_id,unit_id", ignoreDuplicates: true }
      );
    }

    revalidatePath("/me");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : undefined;
    return { error: toUserFacingError(message) };
  }
}

export async function startLesson(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const lessonId = String(formData.get("lesson_id") ?? "").trim();
  if (!lessonId) return { error: "Missing lesson id." };

  const auth = await requireUser();
  if ("error" in auth) {
    return { ok: true };
  }

  try {
    await ensureProfile(auth.userId);
    const supabase = await createClient();
    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: auth.userId,
        lesson_id: lessonId,
        status: "in_progress",
      },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
    );
    if (error) return { error: toUserFacingError(error.message) };
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : undefined;
    return { error: toUserFacingError(message) };
  }
}
