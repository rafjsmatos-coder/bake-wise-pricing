import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const COUPON_ID = "d9LqbCVP";
const PROMO_SLOTS_TOTAL = 25;

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const coupon = await stripe.coupons.retrieve(COUPON_ID);

    const slotsUsed = coupon.times_redeemed || 0;
    const slotsRemaining = Math.max(0, PROMO_SLOTS_TOTAL - slotsUsed);
    const isActive = slotsRemaining > 0 && coupon.valid;

    return new Response(
      JSON.stringify({
        slotsUsed,
        slotsTotal: PROMO_SLOTS_TOTAL,
        slotsRemaining,
        isActive,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PROMO-STATUS] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ isActive: false, slotsRemaining: 0, slotsTotal: PROMO_SLOTS_TOTAL, slotsUsed: PROMO_SLOTS_TOTAL }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
