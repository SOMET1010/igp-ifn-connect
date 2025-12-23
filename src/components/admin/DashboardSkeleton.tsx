import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from '@/components/shared/DashboardHeader';

interface DashboardSkeletonProps {
  title?: string;
  subtitle?: string;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  title = "Administration IFN",
  subtitle = "Direction Générale des Entreprises"
}) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <DashboardHeader
        title={title}
        subtitle={subtitle}
        onSignOut={() => {}}
      />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="card-institutional">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-8 w-20 mt-2" />
                <Skeleton className="h-3 w-12 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart skeleton */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-40 w-full rounded" />
          </CardContent>
        </Card>

        {/* Navigation cards skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="card-institutional">
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced tools skeleton */}
        <Skeleton className="h-5 w-32 mt-2" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="card-institutional">
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
