
import {
  Star,
  MessageSquare,
  Sparkles,
  CalendarDays,
  Quote,
  Heart,
} from "lucide-react";
import type { Review } from "../CustomerDashboard";

type Props = {
  myReviews: Review[];
  reviewsError: string;
  reviewsLoading: boolean;
};

export default function CustomerReviews(props: Props) {
  const { myReviews, reviewsError, reviewsLoading } = props;

  const averageRating =
    myReviews.length > 0
      ? (
          myReviews.reduce((total, review) => total + review.rating, 0) /
          myReviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              <Heart size={14} />
              Your experience matters
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              My Reviews
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
              Your feedback helps service professionals grow and helps
              other customers make better decisions.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
              <Star size={25} className="fill-amber-300" />
            </div>

            <div>
              <p className="text-xs font-medium text-emerald-100/70">
                Average rating
              </p>
              <p className="text-2xl font-extrabold">
                {averageRating}
                <span className="ml-1 text-sm font-medium text-emerald-100/70">
                  / 5
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-7 flex items-center gap-2 border-t border-white/15 pt-5 text-sm text-emerald-100/80">
          <MessageSquare size={16} />
          <span>
            You've shared <strong className="text-white">{myReviews.length}</strong>{" "}
            {myReviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      </section>

      {/* Reviews section */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Your feedback history
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              All the reviews you've submitted for completed services.
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {myReviews.length} reviews
          </span>
        </div>

        {/* Error state */}
        {reviewsError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <MessageSquare size={18} className="mt-0.5 shrink-0" />
            <p>{reviewsError}</p>
          </div>
        )}

        {/* Loading state */}
        {reviewsLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-5 h-4 w-28 rounded bg-slate-200" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-4/5 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : myReviews.length === 0 ? (
          /* Empty state */
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Star size={30} />
            </div>

            <h3 className="mt-5 text-xl font-extrabold text-slate-900">
              No reviews yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once a booking is completed, you can share your experience
              and leave a review from the My Bookings section.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm">
              <Sparkles size={14} className="text-amber-500" />
              Your feedback makes a difference
            </div>
          </div>
        ) : (
          /* Review cards */
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {myReviews.map((review) => (
              <article
                key={review.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                {/* Worker information */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-extrabold text-emerald-700">
                      {(review.workerName || `W${review.workerId}`)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-extrabold text-slate-900">
                        {review.workerName || `Worker #${review.workerId}`}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Booking #{review.bookingId}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl bg-amber-50 px-3 py-2 text-sm font-extrabold text-amber-700">
                    {review.rating}/5
                  </div>
                </div>

                {/* Stars */}
                <div className="mt-5 flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={17}
                      className={
                        index < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }
                    />
                  ))}

                  <span className="ml-2 text-xs font-semibold text-slate-500">
                    {review.rating === 5
                      ? "Excellent"
                      : review.rating === 4
                        ? "Very good"
                        : review.rating === 3
                          ? "Good"
                          : review.rating === 2
                            ? "Fair"
                            : "Needs improvement"}
                  </span>
                </div>

                {/* Comment */}
                <div className="relative mt-4 min-h-24 rounded-xl bg-slate-50 p-4">
                  <Quote
                    size={19}
                    className="mb-2 text-emerald-300"
                  />

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {review.comment || "No written comment."}
                  </p>
                </div>

                {/* Date */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
                  <CalendarDays size={14} />
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
