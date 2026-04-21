import type { ApiError } from "@/lib/types";

export function ErrorBanner({ error }: { error: ApiError | null }) {
  if (!error?.error) return null;

  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
      <div className="font-semibold">Request failed</div>
      <div className="mt-1">{error.error}</div>

      {Array.isArray(error.steps) && error.steps.length > 0 && (
        <div className="mt-3">
          <div className="font-medium">Steps</div>
          <ul className="ml-5 mt-1 list-disc">
            {error.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
