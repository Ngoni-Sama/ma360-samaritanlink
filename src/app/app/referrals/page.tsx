import { PageHeader } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/session";
import { ReferralTracker } from "@/components/app/workflow/ReferralTracker";
import { ReferralContinuity } from "@/components/app/workflow/ReferralContinuity";

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  const canCreate = user?.role === "professional" || user?.role === "health_worker" || user?.role === "admin";
  const from = user?.providerId || "SL-DR-000245";

  return (
    <>
      <PageHeader
        title="Referrals"
        subtitle="Track every referral from creation to follow-up. When a patient stops progressing, record why and respond, so no one falls through the gaps."
      />
      <div className="space-y-4">
        <ReferralContinuity />
        <ReferralTracker canCreate={canCreate} from={from} />
      </div>
    </>
  );
}
