import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/workshop";
import WorkshopList from "@/components/workshop/WorkshopList";

export const dynamic = "force-dynamic";

export default async function WorkshopPage() {
  // Render the client-side WorkshopList with static fallback data to match the reference layout.
  return (
    <WorkshopList />
  );
}
