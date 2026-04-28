// lib/platform-integrations.ts
// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM API INTEGRATION STUBS
// These are placeholder service files.
// NONE of these will execute unless the corresponding environment variables
// are configured AND the user explicitly triggers posting from an approved item.
//
// TODO: Before enabling any of these:
//  1. Obtain proper API credentials and developer approval from each platform
//  2. Complete legal and compliance review with the campaign team
//  3. Ensure all content has been human-approved in the review workflow
//  4. Add OAuth flow for user authentication
//  5. Never auto-post without explicit user action on an approved item
// ─────────────────────────────────────────────────────────────────────────────

export type PlatformPostResult =
  | { success: true; postId: string; platform: string }
  | { success: false; error: string; platform: string; notConfigured?: boolean };

// ─── Meta (Facebook/Instagram) ────────────────────────────────────────────
export async function postToFacebook(
  _caption: string,
  _assetUrl?: string
): Promise<PlatformPostResult> {
  if (
    !process.env.META_PAGE_ACCESS_TOKEN ||
    !process.env.META_PAGE_ID
  ) {
    return {
      success: false,
      error: "Meta API not configured. Set META_PAGE_ACCESS_TOKEN and META_PAGE_ID in .env",
      platform: "facebook",
      notConfigured: true,
    };
  }

  // TODO: Implement Meta Graph API posting
  // Requires: Page Access Token, Page ID, Facebook Developer App approval
  // API endpoint: POST https://graph.facebook.com/v20.0/{page-id}/feed
  // See: https://developers.facebook.com/docs/pages-api/posts
  throw new Error("Meta Facebook posting not yet implemented. Configure credentials first.");
}

export async function postToInstagram(
  _caption: string,
  _mediaUrl?: string
): Promise<PlatformPostResult> {
  if (
    !process.env.META_PAGE_ACCESS_TOKEN ||
    !process.env.META_PAGE_ID
  ) {
    return {
      success: false,
      error: "Meta API not configured. Set META_PAGE_ACCESS_TOKEN and META_PAGE_ID in .env",
      platform: "instagram",
      notConfigured: true,
    };
  }

  // TODO: Implement Instagram Graph API posting
  // Requires: Instagram Business Account, Meta App with instagram_basic + instagram_content_publish
  // Two-step process: create container, then publish
  // See: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
  throw new Error("Instagram posting not yet implemented. Configure credentials first.");
}

// ─── TikTok ───────────────────────────────────────────────────────────────
export async function postToTikTok(
  _caption: string,
  _videoUrl?: string
): Promise<PlatformPostResult> {
  if (!process.env.TIKTOK_ACCESS_TOKEN) {
    return {
      success: false,
      error: "TikTok API not configured. Set TIKTOK_ACCESS_TOKEN in .env",
      platform: "tiktok",
      notConfigured: true,
    };
  }

  // TODO: Implement TikTok Content Posting API
  // Requires: TikTok Developer account, app approval, video file (not text-only)
  // See: https://developers.tiktok.com/doc/content-posting-api-get-started
  throw new Error("TikTok posting not yet implemented. Configure credentials first.");
}

// ─── Buffer (scheduling export helper) ────────────────────────────────────
export async function sendToBuffer(
  _items: Array<{ caption: string; scheduledAt: string; platform: string }>
): Promise<PlatformPostResult> {
  if (!process.env.BUFFER_API_KEY) {
    return {
      success: false,
      error: "Buffer API not configured. Set BUFFER_API_KEY in .env. Use CSV export instead.",
      platform: "buffer",
      notConfigured: true,
    };
  }

  // TODO: Implement Buffer API integration
  // See: https://buffer.com/developers/api
  throw new Error("Buffer API not yet implemented. Use CSV export for manual scheduling.");
}

// ─── Status check ─────────────────────────────────────────────────────────
export function getPlatformIntegrationStatus(): Record<string, boolean> {
  return {
    facebook: !!(process.env.META_PAGE_ACCESS_TOKEN && process.env.META_PAGE_ID),
    instagram: !!(process.env.META_PAGE_ACCESS_TOKEN && process.env.META_PAGE_ID),
    tiktok: !!process.env.TIKTOK_ACCESS_TOKEN,
    buffer: !!process.env.BUFFER_API_KEY,
  };
}
