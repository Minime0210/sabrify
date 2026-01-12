import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REQUEST-ACCOUNT-DELETION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const user = userData.user;
    if (!user.email) {
      throw new Error("User email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Generate a secure deletion token (valid for 1 hour)
    const deletionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    // Store the deletion request (we'll use user metadata for simplicity)
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          deletion_token: deletionToken,
          deletion_expires_at: expiresAt,
        }
      }
    );

    if (updateError) {
      logStep("Error storing deletion token", { error: updateError.message });
      throw new Error("Failed to initiate deletion process");
    }

    logStep("Deletion token stored", { expiresAt });

    // Send confirmation email
    const resend = new Resend(resendKey);
    const origin = req.headers.get("origin") || "https://sabrify.lovable.app";
    const deletionLink = `${origin}/confirm-deletion?token=${deletionToken}&userId=${user.id}`;

    const emailResponse = await resend.emails.send({
      from: "Sabrify <onboarding@resend.dev>",
      to: [user.email],
      subject: "Confirm Account Deletion - Sabrify",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6741; margin-bottom: 24px;">Account Deletion Request</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Assalamu Alaikum,
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We received a request to delete your Sabrify account. If you made this request, 
            please click the button below to confirm.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${deletionLink}" 
               style="background-color: #dc2626; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; font-weight: 600;
                      display: inline-block;">
              Confirm Account Deletion
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            <strong>This link will expire in 1 hour.</strong>
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you did not request this deletion, please ignore this email. Your account will remain safe.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #999; font-size: 12px;">
            Sabrify - Islamic Wellbeing App<br />
            This is an automated message. Please do not reply.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      logStep("Resend error", { error: emailResponse.error });
      throw new Error(`Failed to send confirmation email: ${emailResponse.error.message}`);
    }

    logStep("Deletion confirmation email sent", { id: emailResponse.data?.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation email sent. Please check your inbox." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process deletion request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
