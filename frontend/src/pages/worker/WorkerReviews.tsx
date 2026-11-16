import { Star, ShieldCheck } from "lucide-react";
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
    <>
<section id="reviews" className="scroll-mt-28">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                CUSTOMER FEEDBACK
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Customer Reviews
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Real feedback submitted by customers after completed bookings.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Average rating</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
                  </span>
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={17}
                          className={
                            index < Math.round(averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Based on customer feedback</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total reviews</p>
                <p className="mt-3 text-4xl font-extrabold text-gray-900">{reviewCount}</p>
                <p className="mt-1 text-xs text-gray-500">Reviews received from customers</p>
              </div>
            </div>

            {reviewsError && (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {reviewsError}
              </div>
            )}

            {reviewsLoading ? (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
                Loading customer reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <Star size={34} className="mx-auto text-gray-300" />
                <h3 className="mt-3 font-bold text-gray-900">No reviews yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Customer reviews will appear here after customers review completed jobs.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                          {(review.customerId ? `C${review.customerId}` : "C").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Customer #{review.customerId}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <ShieldCheck size={20} className="text-emerald-600" />
                    </div>

                    <div className="mt-5 flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={16}
                          className={
                            index < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                      <span className="ml-2 text-xs font-semibold text-gray-500">
                        {review.rating}/5 · Booking #{review.bookingId}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {review.comment || "The customer did not leave a written comment."}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
    </>
  );
}
