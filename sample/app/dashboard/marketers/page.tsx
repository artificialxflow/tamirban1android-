import { listMarketers } from "@/lib/services/marketers.service";
import { MarketerPageClient } from "@/components/marketers/marketer-page-client";

type MarketersPageProps = {
  searchParams: Promise<{
    region?: string;
    isActive?: string;
    page?: string;
  }>;
};

export default async function MarketersPage({ searchParams }: MarketersPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 9; // 3 rows × 3 columns = 9 cards

  let isActive: boolean | undefined;
  if (params.isActive === "true") {
    isActive = true;
  } else if (params.isActive === "false") {
    isActive = false;
  }

  const result = await listMarketers({
    region: params.region,
    isActive,
    page,
    limit,
  });

  return <MarketerPageClient initialMarketers={result.data} initialTotal={result.total} initialPage={result.page} initialLimit={result.limit} />;
}
