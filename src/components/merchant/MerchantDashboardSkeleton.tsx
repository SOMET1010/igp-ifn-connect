import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MerchantDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Merchant info skeleton */}
      <div className="text-center">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Big number card skeleton */}
      <Card className="card-institutional overflow-hidden">
        <CardContent className="p-6 text-center">
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <Skeleton className="h-12 w-40 mx-auto mb-2" />
        </CardContent>
      </Card>

      {/* Action buttons skeleton */}
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Sales chart skeleton */}
      <Card className="card-institutional overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-8 w-48 mt-2" />
        </CardHeader>
        <CardContent className="pb-4 px-2">
          <div className="h-40 w-full flex items-end justify-between gap-2 px-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <Skeleton 
                  className="w-full rounded" 
                  style={{ height: `${20 + Math.random() * 80}px` }} 
                />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action cards skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="card-institutional">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick guide skeleton */}
      <Card className="card-institutional">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
