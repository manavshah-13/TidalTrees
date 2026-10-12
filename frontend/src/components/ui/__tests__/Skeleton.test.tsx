import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Skeleton,
  CardSkeleton,
  StatCardSkeleton,
  TableRowSkeleton,
} from '../Skeleton';

describe('Skeleton Suite Components', () => {
  it('renders base Skeleton with custom class and attributes', () => {
    const { container } = render(
      <Skeleton className="h-6 w-32 custom-skeleton" data-testid="test-skeleton" />
    );

    const skeletonEl = container.querySelector('.skeleton');
    expect(skeletonEl).toBeInTheDocument();
    expect(skeletonEl).toHaveClass('h-6');
    expect(skeletonEl).toHaveClass('w-32');
    expect(skeletonEl).toHaveClass('custom-skeleton');
  });

  it('renders CardSkeleton with mock layout placeholders', () => {
    const { container } = render(<CardSkeleton className="custom-card-skeleton" />);

    const cardEl = container.querySelector('.report-card');
    expect(cardEl).toBeInTheDocument();
    expect(cardEl).toHaveClass('custom-card-skeleton');

    // Should contain multiple skeleton shimmer blocks
    const skeletonBlocks = container.querySelectorAll('.skeleton');
    expect(skeletonBlocks.length).toBeGreaterThanOrEqual(6);
  });

  it('renders StatCardSkeleton with mock metric placeholders', () => {
    const { container } = render(<StatCardSkeleton className="custom-stat-skeleton" />);

    const statCardEl = container.querySelector('.stat-card');
    expect(statCardEl).toBeInTheDocument();
    expect(statCardEl).toHaveClass('custom-stat-skeleton');

    const skeletonBlocks = container.querySelectorAll('.skeleton');
    expect(skeletonBlocks.length).toBeGreaterThanOrEqual(3);
  });

  it('renders TableRowSkeleton with correct number of columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton columns={5} className="custom-table-row" />
        </tbody>
      </table>
    );

    const tr = container.querySelector('tr');
    expect(tr).toBeInTheDocument();
    expect(tr).toHaveClass('custom-table-row');

    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(5);

    const skeletonsInCells = container.querySelectorAll('td .skeleton');
    expect(skeletonsInCells.length).toBe(5);
  });
});
