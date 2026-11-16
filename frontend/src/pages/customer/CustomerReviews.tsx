import { Star } from "lucide-react";
import type { Review } from "../CustomerDashboard";

type Props = {
  myReviews: Review[];
  reviewsError: string;
  reviewsLoading: boolean;
};

export default function CustomerReviews(props: Props) {
  const { myReviews, reviewsError, reviewsLoading } = props;

  return (
<section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Your feedback</p>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900">My Reviews</h2>
      <p className="mt-2 text-sm text-slate-500">Reviews you have submitted for completed bookings.</p>
    </div>
    <span className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700">{myReviews.length} reviews</span>
  </div>
  {reviewsError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{reviewsError}</p>}
  {reviewsLoading ? (
    <p className="py-12 text-center text-sm text-slate-500">Loading your reviews...</p>
  ) : myReviews.length === 0 ? (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
      <Star size={34} className="mx-auto text-slate-300" />
      <h3 className="mt-3 font-bold text-slate-800">No reviews yet</h3>
      <p className="mt-2 text-sm text-slate-500">After a booking is completed, you can leave a review from My Bookings.</p>
    </div>
  ) : (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {myReviews.map((review) => (
        <article key={review.id} className="rounded-2xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">{review.workerName || `Worker #${review.workerId}`}</h3>
              <p className="mt-1 text-xs text-slate-400">Booking #{review.bookingId} · {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={16} className="fill-amber-400 text-amber-400" /> {review.rating}/5</div>
          </div>
          <div className="mt-4 flex gap-1">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} className={index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}</div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.comment || "No written comment."}</p>
        </article>
      ))}
    </div>
  )}
</section>
  );
}
