import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { getSeoMetadata } from "../lib/seo";
import { getMethod, normalizeMethodId } from "../methods/registry";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function MethodHelp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { method: methodParam } = useParams();
  const methodId = normalizeMethodId(methodParam);
  const method = getMethod(methodId);
  const seo = getSeoMetadata({ pathname: location.pathname });

  useEffect(() => {
    if (methodParam && methodParam === methodId) {
      return;
    }
    navigate(`/help/${methodId}`, { replace: true });
  }, [methodId, methodParam, navigate]);

  const help = method.help ?? {
    title: `${method.name} method`,
    sections: [
      {
        heading: "Overview",
        body: "Help content is being written for this method.",
      },
    ],
  };

  const toc = useMemo(
    () =>
      help.sections.map((section) => ({
        ...section,
        id: slugify(section.heading),
      })),
    [help.sections]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <Seo {...seo} />
      <Card>
        <CardHeader>
          <CardTitle>{help.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>{method.shortDescription}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">On this page</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              {toc.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {toc.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle id={section.id} className="text-base">
                  {section.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                {section.body
                  .split("\n")
                  .filter(Boolean)
                  .map((line, index) => (
                    <p key={`${section.id}-${index}`}>{line}</p>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
