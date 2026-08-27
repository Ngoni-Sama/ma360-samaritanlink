import { getCurrentUser } from "@/lib/session";
import {
  AdminDashboard, HealthWorkerDashboard, PatientDashboard,
  PharmacyDashboard, ProfessionalDashboard,
} from "@/components/app/dashboards";

export default function DashboardHome() {
  const user = getCurrentUser();
  if (!user) return null; // layout guards this

  switch (user.role) {
    case "health_worker":
      return <HealthWorkerDashboard name={user.name} />;
    case "professional":
      return <ProfessionalDashboard name={user.name} />;
    case "pharmacy":
      return <PharmacyDashboard name={user.name} />;
    case "admin":
      return <AdminDashboard name={user.name} />;
    default:
      return <PatientDashboard name={user.name} />;
  }
}
