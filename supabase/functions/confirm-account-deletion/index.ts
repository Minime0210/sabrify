import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-ACCOUNT-DELETION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { token, userId } = await req.json();

    if (!token || !userId) {
      throw new Error("Missing token or userId");
    }

    logStep("Processing deletion", { userId, tokenProvided: !!token });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the user to verify the token
    const { data: userData, error: getUserError } = await supabaseClient.auth.admin.getUserById(userId);

    if (getUserError || !userData.user) {
      logStep("User not found", { error: getUserError?.message });
      throw new Error("Invalid deletion request");
    }

    const user = userData.user;
    const storedToken = user.user_metadata?.deletion_token;
    const expiresAt = user.user_metadata?.deletion_expires_at;

    // Verify token matches
    if (!storedToken || storedToken !== token) {
      logStep("Token mismatch", { storedToken: !!storedToken });
      throw new Error("Invalid or expired deletion token");
    }

    // Check if token has expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      logStep("Token expired", { expiresAt });
      throw new Error("Deletion token has expired. Please request a new one.");
    }

    logStep("Token verified, proceeding with deletion", { userId: user.id });

    // Delete the user account
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      logStep("Error deleting user", { error: deleteError.message });
      throw new Error("Failed to delete account");
    }

    logStep("Account deleted successfully", { userId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your account has been permanently deleted." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete account" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
