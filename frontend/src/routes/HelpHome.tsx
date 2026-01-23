import { useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import { getSeoMetadata } from "../lib/seo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const glossary = [
  {
    term: "Crosses (x)",
    definition:
      "How many times a spoke crosses other spokes from the hub to the rim.",
  },
  {
    term: "DS / NDS",
    definition:
      "Drive-side and non-drive-side flanges on a rear hub.",
  },
  {
    term: "Heads in / heads out",
    definition:
      "Whether the spoke head sits inside or outside the hub flange.",
  },
  {
    term: "Valve reference",
    definition:
      "Which rim hole is used as the start point next to the valve.",
  },
  {
    term: "Rim indexing",
    definition:
      "Keeping track of rim hole order so spokes land in the intended holes.",
  },
];

export default function HelpHome() {
  const location = useLocation();
  const seo = getSeoMetadata({ pathname: location.pathname });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <Seo {...seo} />
      <Card>
        <CardHeader>
          <CardTitle>Wheelbuilding basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            Wheel Weaver focuses on spoke order and rim indexing. The goal is to
            keep your build organized so you always know which spoke comes next.
          </p>
          <p>
            Pick a method, set your hub and rim parameters, and use the table
            and diagram together. The table gives precise hole numbers, while
            the diagram provides a visual check for crossings and valve
            clearance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Core concepts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-slate-900">
              Reference spokes
            </h3>
            <p>
              Most methods start by anchoring a few reference spokes near the
              valve. These define the rim indexing for every other spoke.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-slate-900">
              Odd/even sets
            </h3>
            <p>
              Hubs are split into odd and even holes. Building one set at a
              time helps keep crossings consistent and reduces mistakes.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-slate-900">
              Cross count
            </h3>
            <p>
              Crosses determine how many times a spoke overlaps others. Higher
              cross counts are common on larger wheels, but the builder will
              clamp to what is supported for each hole count.
            </p>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Glossary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <dl className="space-y-3">
            {glossary.map((item) => (
              <div key={item.term}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.term}
                </dt>
                <dd className="mt-1">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
