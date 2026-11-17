
import { Star, ShieldCheck, MessageSquare, Quote } from "lucide-react";
import type { Review } from "../WorkerDashboard";

interface WorkerReviewsProps {
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
  reviewsError: string;
  reviewsLoading: boolean;
}

export default function WorkerReviews({
  reviews,
  reviewCount,
  averageRating,
  reviewsError,
  reviewsLoading,
}: WorkerReviewsProps) {
  return (
    <section id="reviews" className="space-y-7 scroll-mt-28">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Customer feedback
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Reviews & Ratings
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          See how customers rate their experience with your services.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-600 p-6 text-white shadow-sm lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <p className="text-sm font-medium text-emerald-100">
            Your average rating
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <span className="text-6xl font-extrabold tracking-tight">
              {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
            </span>
            <div className="pb-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={20}
                    className={
                      index < Math.round(averageRating)
                        ? "fill-amber-300 text-amber-300"
                        : "text-white/30"
                    }
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-emerald-100">
                Based on customer feedback
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-emerald-100">
            <ShieldCheck size={17} />
            Customer-submitted reviews
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <MessageSquare size={22} />
          </div>
          <p className="mt-6 text-sm font-medium text-gray-500">
            Total reviews
          </p>
          <p className="mt-2 text-4xl font-extrabold text-gray-900">
            {reviewCount}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Reviews received from customers
          </p>
        </div>
      </div>

      {reviewsError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {reviewsError}
        </div>
      )}

      {reviewsLoading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6"
            >
              <div className="h-10 w-40 rounded bg-gray-100" />
              <div className="mt-6 h-4 w-28 rounded bg-gray-100" />
              <div className="mt-4 h-16 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <Star size={27} />
          </div>
          <h3 className="mt-4 font-bold text-gray-900">No reviews yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Customer reviews will appear here after customers review their
            completed bookings.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Customer testimonials
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Feedback from your completed jobs.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              {reviews.length} shown
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">
                      C{review.customerId}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-gray-900">
                        Customer #{review.customerId}
                      </h4>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <ShieldCheck size={20} className="shrink-0 text-emerald-600" />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={17}
                      className={
                        index < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-600">
                    {review.rating}/5
                  </span>
                </div>

                <div className="relative mt-5 rounded-xl bg-gray-50 p-4">
                  <Quote
                    size={18}
                    className="mb-2 text-emerald-600/60"
                  />
                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {review.comment ||
                      "The customer did not leave a written comment."}
                  </p>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-400">
                    Booking reference
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    #{review.bookingId}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
