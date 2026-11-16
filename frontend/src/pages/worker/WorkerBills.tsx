import WorkerBillingPanel from "../WorkerBillingPanel";
import type { Booking } from "../WorkerDashboard";

interface WorkerBillsProps {
  bookings: Booking[];
}

/** Billing page for the worker workspace. */
export default function WorkerBills({ bookings }: WorkerBillsProps) {
  return <WorkerBillingPanel bookings={bookings} />;
}
