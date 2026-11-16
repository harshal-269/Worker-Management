
type Props = Record<string, any>;

export default function CustomerSettings(props: Props) {
  const {  } = props;

  return (
<section className="rounded-3xl border border-slate-200 bg-white p-8">
  <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Customer workspace</p>
  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Settings</h2>
  <p className="mt-3 text-sm leading-6 text-slate-500">Account preferences will be available here in a later update.</p>
</section>
  );
}
