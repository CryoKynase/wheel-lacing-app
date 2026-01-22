import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import { getSeoMetadata } from "../lib/seo";

export default function NotFound() {
  const location = useLocation();
  const seo = getSeoMetadata({ pathname: location.pathname });

  return (
    <section className="space-y-4">
      <Seo {...seo} />
      <div>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-1 text-sm text-slate-600">
          We could not find that page. Try the builder instead.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Go to Wheel Weaver
      </Link>
    </section>
  );
}
