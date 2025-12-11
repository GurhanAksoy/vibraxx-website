import { supabase } from "./supabaseClient";

/**
 * Updates or creates an active session record for a user
 * This tracks where users are currently active in the platform
 * 
 * @param userId - The user's UUID from Supabase auth
 * @param location - Current location: "LOGIN" | "HOME" | "LOBBY" | "QUIZ" | etc.
 * @returns Promise<void>
 */
export async function updateActiveSession(
  userId: string,
  location: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("active_sessions")
      .upsert(
        {
          user_id: userId,
          location: location,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: "user_id", // Update if user_id already exists
        }
      );

    if (error) {
      console.error("❌ Active session update error:", error);
      // Don't throw - this is non-critical for user experience
      return;
    }

    console.log(`✅ Active session updated: ${userId} @ ${location}`);
  } catch (err) {
    console.error("❌ Active session unexpected error:", err);
    // Don't throw - graceful degradation
  }
}

/**
 * Removes a user's active session (called on logout)
 * 
 * @param userId - The user's UUID
 * @returns Promise<void>
 */
export async function removeActiveSession(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("active_sessions")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Active session removal error:", error);
      return;
    }

    console.log(`✅ Active session removed: ${userId}`);
  } catch (err) {
    console.error("❌ Active session removal unexpected error:", err);
  }
}

/**
 * Gets count of active users in a specific location
 * 
 * @param location - Optional location filter
 * @param minutesThreshold - Consider users active if seen within this many minutes (default: 5)
 * @returns Promise<number>
 */
export async function getActiveUserCount(
  location?: string,
  minutesThreshold: number = 5
): Promise<number> {
  try {
    // Calculate cutoff time
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - minutesThreshold);

    let query = supabase
      .from("active_sessions")
      .select("user_id", { count: "exact", head: true })
      .gte("last_seen", cutoff.toISOString());

    // Add location filter if provided
    if (location) {
      query = query.eq("location", location);
    }

    const { count, error } = await query;

    if (error) {
      console.error("❌ Active user count error:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("❌ Active user count unexpected error:", err);
    return 0;
  }
}

