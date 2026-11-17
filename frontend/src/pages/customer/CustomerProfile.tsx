
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Save,
  X,
  RefreshCw,
  UserCircle,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";

type Props = Record<string, any>;

export default function CustomerProfile(props: Props) {
  const {
    customerProfile,
    profileEditing,
    profileLoading,
    profileError,
    profileSuccess,
    profileForm,
    profileSaving,
    setProfileForm,
    setProfileError,
    setProfileSuccess,
    setProfileEditing,
    loadCustomerProfile,
    saveCustomerProfile,
    initials,
  } = props;

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              <UserCircle size={14} />
              Account settings
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              My Profile
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
              Manage your personal information and keep your account details
              up to date.
            </p>
          </div>

          {!profileEditing && (
            <button
              type="button"
              onClick={() => {
                setProfileForm({
                  name: customerProfile?.name ?? "",
                  phone: customerProfile?.phone ?? "",
                });
                setProfileError("");
                setProfileSuccess("");
                setProfileEditing(true);
              }}
              disabled={!customerProfile || profileLoading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={16} />
              Edit profile
            </button>
          )}
        </div>
      </section>

      {/* Error message */}
      {profileError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>{profileError}</p>
            <button
              type="button"
              onClick={() => void loadCustomerProfile()}
              className="mt-2 font-bold underline underline-offset-4"
            >
              Retry loading profile
            </button>
          </div>
        </div>
      )}

      {/* Success message */}
      {profileSuccess && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          {profileSuccess}
        </div>
      )}

      {/* Loading state */}
      {profileLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-3 w-52 max-w-full rounded bg-slate-100" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      ) : customerProfile ? (
        <>
          {/* Identity card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-3xl font-extrabold text-white shadow-lg shadow-emerald-700/20">
                    {initials(customerProfile.name)}
                  </div>
                  <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white">
                    <CheckCircle2 size={15} />
                  </span>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Your account
                  </p>

                  <h3 className="mt-1 break-words text-2xl font-extrabold text-slate-900">
                    {customerProfile.name}
                  </h3>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {customerProfile.email}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <ShieldCheck size={14} />
                    {customerProfile.role}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Profile details / edit form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <UserRound size={20} />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900">
                  Personal information
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Your basic account details.
                </p>
              </div>
            </div>

            {profileEditing ? (
              <form
                onSubmit={saveCustomerProfile}
                className="mt-6 space-y-5"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="customer-profile-name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <UserRound
                      size={18}
                      className="shrink-0 text-slate-400"
                    />
                    <input
                      id="customer-profile-name"
                      type="text"
                      required
                      maxLength={100}
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm(
                          (current: { name: string; phone: string }) => ({
                            ...current,
                            name: event.target.value,
                          }),
                        )
                      }
                      placeholder="Enter your full name"
                      className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="customer-profile-email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4">
                    <Mail
                      size={18}
                      className="shrink-0 text-slate-400"
                    />
                    <input
                      id="customer-profile-email"
                      type="email"
                      readOnly
                      value={customerProfile.email}
                      className="w-full cursor-not-allowed bg-transparent py-3.5 text-sm text-slate-500 outline-none"
                    />
                    <LockKeyhole
                      size={16}
                      className="shrink-0 text-slate-400"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Your email identifies your active login session and
                    cannot be changed here.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="customer-profile-phone"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Phone number
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <Phone
                      size={18}
                      className="shrink-0 text-slate-400"
                    />
                    <input
                      id="customer-profile-phone"
                      type="tel"
                      maxLength={20}
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm(
                          (current: { name: string; phone: string }) => ({
                            ...current,
                            phone: event.target.value,
                          }),
                        )
                      }
                      placeholder="Enter your phone number"
                      className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Form actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileEditing(false);
                      setProfileForm({
                        name: customerProfile.name,
                        phone: customerProfile.phone ?? "",
                      });
                      setProfileError("");
                    }}
                    disabled={profileSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      profileSaving || !profileForm.name.trim()
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Full name */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-emerald-200">
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserRound size={16} />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Full name
                    </p>
                  </div>
                  <p className="mt-3 break-words font-bold text-slate-800">
                    {customerProfile.name}
                  </p>
                </div>

                {/* Email */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-emerald-200">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail size={16} />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Email address
                    </p>
                  </div>
                  <p className="mt-3 break-all font-bold text-slate-800">
                    {customerProfile.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-emerald-200">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone size={16} />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Phone number
                    </p>
                  </div>
                  <p className="mt-3 break-words font-bold text-slate-800">
                    {customerProfile.phone || "Not provided"}
                  </p>
                </div>

                {/* Role */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-emerald-200">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck size={16} />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Account type
                    </p>
                  </div>
                  <p className="mt-3 font-bold text-slate-800">
                    {customerProfile.role}
                  </p>
                </div>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <UserCircle
            size={36}
            className="mx-auto text-slate-300"
          />
          <h3 className="mt-4 font-extrabold text-slate-800">
            Profile unavailable
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            We couldn't retrieve your profile information.
          </p>
          <button
            type="button"
            onClick={() => void loadCustomerProfile()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
