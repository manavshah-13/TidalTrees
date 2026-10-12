import React from 'react';

// 1. Base Skeleton primitive
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`skeleton ${className}`}
      {...props}
    />
  );
};

// 2. CardSkeleton - Mock report or story card
export interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`report-card space-y-3 ${className}`}>
      {/* Mock Image Header */}
      <Skeleton className="h-40 w-full rounded-lg" />

      {/* Mock Badges Row */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>

      {/* Mock Title */}
      <Skeleton className="h-5 w-3/4 rounded" />

      {/* Mock Description Lines */}
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
      </div>

      {/* Mock Footer / Meta */}
      <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
};

// 3. StatCardSkeleton - Mock metric stat card
export interface StatCardSkeletonProps {
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-28 my-3 rounded" />
      <Skeleton className="h-3 w-36 rounded" />
    </div>
  );
};

// 4. TableRowSkeleton - Mock leaderboard or tabular row
export interface TableRowSkeletonProps {
  columns?: number;
  className?: string;
}

export const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({
  columns = 5,
  className = '',
}) => {
  return (
    <tr className={`border-b border-gray-800/40 ${className}`}>
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-4 px-4">
          <Skeleton
            className={`h-4 rounded ${
              idx === 0
                ? 'w-8'
                : idx === 1
                ? 'w-32'
                : idx === 2
                ? 'w-20 mx-auto'
                : 'w-24'
            }`}
          />
        </td>
      ))}
    </tr>
  );
};

export default Skeleton;
