import "server-only";

import { createClient } from "@/lib/supabase/server";

export type LearningPath = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type LearningUnit = {
  id: string;
  path_id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  unlock_after_unit_id: string | null;
};

export type Lesson = {
  id: string;
  unit_id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  estimated_minutes: number;
  xp_reward: number;
  is_guest_allowed: boolean;
};

export type LessonStep = {
  id: string;
  lesson_id: string;
  sort_order: number;
  step_type: "read" | "mcq" | "scramble";
  prompt: string;
  book_code: string | null;
  chapter: number | null;
  verse_start: number | null;
  verse_end: number | null;
  translation_slug: string | null;
  scramble_words: string[] | null;
};

export type LessonStepOptionPublic = {
  id: string;
  step_id: string;
  label: string;
  sort_order: number;
};

export async function listLearningPaths(): Promise<LearningPath[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_paths")
    .select("id, slug, title, description, sort_order")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as LearningPath[];
}

export async function getPathTree(pathSlug: string) {
  const supabase = await createClient();
  const { data: path, error: pathError } = await supabase
    .from("learning_paths")
    .select("id, slug, title, description, sort_order")
    .eq("slug", pathSlug)
    .eq("is_published", true)
    .maybeSingle();
  if (pathError) throw new Error(pathError.message);
  if (!path) return null;

  const { data: units, error: unitsError } = await supabase
    .from("learning_units")
    .select(
      "id, path_id, slug, title, description, sort_order, unlock_after_unit_id"
    )
    .eq("path_id", path.id)
    .order("sort_order");
  if (unitsError) throw new Error(unitsError.message);

  const unitIds = (units ?? []).map((u) => u.id);
  let lessons: Lesson[] = [];
  if (unitIds.length > 0) {
    const { data: lessonRows, error: lessonsError } = await supabase
      .from("lessons")
      .select(
        "id, unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed"
      )
      .in("unit_id", unitIds)
      .order("sort_order");
    if (lessonsError) throw new Error(lessonsError.message);
    lessons = (lessonRows ?? []) as Lesson[];
  }

  return {
    path: path as LearningPath,
    units: (units ?? []) as LearningUnit[],
    lessons,
  };
}

export async function getLessonWithSteps(lessonId: string) {
  const supabase = await createClient();
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select(
      "id, unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed"
    )
    .eq("id", lessonId)
    .maybeSingle();
  if (lessonError) throw new Error(lessonError.message);
  if (!lesson) return null;

  const { data: steps, error: stepsError } = await supabase
    .from("lesson_steps")
    .select(
      "id, lesson_id, sort_order, step_type, prompt, book_code, chapter, verse_start, verse_end, translation_slug, scramble_words"
    )
    .eq("lesson_id", lessonId)
    .order("sort_order");
  if (stepsError) throw new Error(stepsError.message);

  const stepIds = (steps ?? []).map((s) => s.id);
  let options: LessonStepOptionPublic[] = [];
  if (stepIds.length > 0) {
    const { data: optionRows, error: optionsError } = await supabase
      .from("lesson_step_options")
      .select("id, step_id, label, sort_order")
      .in("step_id", stepIds)
      .order("sort_order");
    if (optionsError) throw new Error(optionsError.message);
    options = (optionRows ?? []) as LessonStepOptionPublic[];
  }

  return {
    lesson: lesson as Lesson,
    steps: (steps ?? []) as LessonStep[],
    options,
  };
}

export async function getGuestAllowedLesson() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed"
    )
    .eq("is_guest_allowed", true)
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Lesson | null;
}

export type PathNodeView = {
  id: string;
  title: string;
  state: "done" | "active" | "locked";
  icon: string;
  href?: string;
  offset?: string;
  ctaLabel?: string;
};

const PATH_OFFSETS = ["", "-translate-x-12", "translate-x-16", "-translate-x-8"] as const;

function isUnitUnlocked(
  unit: LearningUnit,
  unlockedUnitIds: Set<string>,
  lessons: Lesson[],
  completedLessonIds: Set<string>
): boolean {
  if (!unit.unlock_after_unit_id) return true;
  if (unlockedUnitIds.has(unit.id)) return true;
  const prereq = lessons.filter((l) => l.unit_id === unit.unlock_after_unit_id);
  return (
    prereq.length > 0 && prereq.every((l) => completedLessonIds.has(l.id))
  );
}

/** Lesson nodes for the learner path tree, with unlock + progress state. */
export async function getUserPathProgress(
  userId: string,
  pathSlug = "gospel-of-john"
): Promise<{ path: LearningPath | null; nodes: PathNodeView[] }> {
  const tree = await getPathTree(pathSlug);
  if (!tree) return { path: null, nodes: [] };

  const supabase = await createClient();
  const lessonIds = tree.lessons.map((l) => l.id);

  const [progressRes, unlocksRes] = await Promise.all([
    lessonIds.length > 0
      ? supabase
          .from("user_lesson_progress")
          .select("lesson_id, status")
          .eq("user_id", userId)
          .in("lesson_id", lessonIds)
      : Promise.resolve({ data: [] as { lesson_id: string; status: string }[], error: null }),
    supabase
      .from("user_path_unlocks")
      .select("unit_id")
      .eq("user_id", userId),
  ]);

  if (progressRes.error) throw new Error(progressRes.error.message);
  if (unlocksRes.error) throw new Error(unlocksRes.error.message);

  const statusByLesson = new Map(
    (progressRes.data ?? []).map((row) => [row.lesson_id, row.status])
  );
  const completedLessonIds = new Set(
    [...statusByLesson.entries()]
      .filter(([, status]) => status === "completed")
      .map(([id]) => id)
  );
  const unlockedUnitIds = new Set(
    (unlocksRes.data ?? []).map((row) => row.unit_id)
  );

  const unitsById = new Map(tree.units.map((u) => [u.id, u]));
  const unitOrder = new Map(tree.units.map((u) => [u.id, u.sort_order]));

  const orderedLessons = [...tree.lessons].sort((a, b) => {
    const ua = unitOrder.get(a.unit_id) ?? 0;
    const ub = unitOrder.get(b.unit_id) ?? 0;
    if (ua !== ub) return ua - ub;
    return a.sort_order - b.sort_order;
  });

  let foundActive = false;
  const nodes: PathNodeView[] = orderedLessons.map((lesson, index) => {
    const unit = unitsById.get(lesson.unit_id);
    const unlocked = unit
      ? isUnitUnlocked(unit, unlockedUnitIds, tree.lessons, completedLessonIds)
      : false;
    const status = statusByLesson.get(lesson.id);
    const offset = PATH_OFFSETS[index % PATH_OFFSETS.length] || undefined;

    if (status === "completed") {
      return {
        id: lesson.id,
        title: lesson.title,
        state: "done" as const,
        icon: "check_circle",
        href: `/me/lessons/${lesson.id}`,
        offset,
      };
    }

    if (unlocked && !foundActive) {
      foundActive = true;
      return {
        id: lesson.id,
        title: lesson.title,
        state: "active" as const,
        icon: "menu_book",
        href: `/me/lessons/${lesson.id}`,
        offset,
        ctaLabel: status === "in_progress" ? "Continue" : "Start",
      };
    }

    return {
      id: lesson.id,
      title: lesson.title,
      state: "locked" as const,
      icon: "lock",
      offset,
    };
  });

  return { path: tree.path, nodes };
}

export async function getUserStreakAndStats(userId: string) {
  const supabase = await createClient();
  const [streak, stats] = await Promise.all([
    supabase.from("user_streaks").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  if (streak.error) throw new Error(streak.error.message);
  if (stats.error) throw new Error(stats.error.message);
  return { streak: streak.data, stats: stats.data };
}

export async function listUserAchievements(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_achievements")
    .select("id, unlocked_at, achievement:achievements(slug, title, description, icon_key)")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
