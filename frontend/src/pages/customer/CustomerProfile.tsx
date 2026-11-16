type Props = Record<string, any>;

export default function CustomerProfile(props: Props) {
  const { customerProfile, profileEditing, profileLoading, profileError, profileSuccess, profileForm, profileSaving, setProfileForm, setProfileError, setProfileSuccess, setProfileEditing, loadCustomerProfile, saveCustomerProfile, initials } = props;

  return (
<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Account settings</p>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">My Profile</h2>
      <p className="mt-2 text-sm text-slate-500">View and manage your personal information.</p>
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
        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Edit Profile
      </button>
    )}
  </div>

  {profileError && (
    <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {profileError}
      <button type="button" onClick={() => void loadCustomerProfile()} className="ml-2 font-bold underline">Retry</button>
    </div>
  )}
  {profileSuccess && (
    <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
      {profileSuccess}
    </div>
  )}

  {profileLoading ? (
    <div className="mt-8 rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">Loading your profile...</div>
  ) : customerProfile ? (
    <div className="mt-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-emerald-50 p-6 sm:flex-row">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-2xl font-extrabold text-white">
          {initials(customerProfile.name)}
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-slate-900">{customerProfile.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{customerProfile.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            {customerProfile.role}
          </span>
        </div>
      </div>

      {profileEditing ? (
        <form onSubmit={saveCustomerProfile} className="mt-8 space-y-5">
          <div>
            <label htmlFor="customer-profile-name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
            <input
              id="customer-profile-name"
              type="text"
              required
              maxLength={100}
              value={profileForm.name}
              onChange={(event) => setProfileForm((current: { name: string; phone: string }) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label htmlFor="customer-profile-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
            <input
              id="customer-profile-email"
              type="email"
              readOnly
              value={customerProfile.email}
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed here because it identifies your active login session.</p>
          </div>
          <div>
            <label htmlFor="customer-profile-phone" className="mb-2 block text-sm font-semibold text-slate-700">Phone number</label>
            <input
              id="customer-profile-phone"
              type="tel"
              maxLength={20}
              value={profileForm.phone}
              onChange={(event) => setProfileForm((current: { name: string; phone: string }) => ({ ...current, phone: event.target.value }))}
              placeholder="Enter your phone number"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={profileSaving || !profileForm.name.trim()}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Full name</p>
            <p className="mt-2 font-semibold text-slate-800">{customerProfile.name}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email address</p>
            <p className="mt-2 break-all font-semibold text-slate-800">{customerProfile.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone number</p>
            <p className="mt-2 font-semibold text-slate-800">{customerProfile.phone || "Not provided"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Account type</p>
            <p className="mt-2 font-semibold text-slate-800">{customerProfile.role}</p>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
      Profile information is unavailable.
    </div>
  )}
</section>
  );
}
