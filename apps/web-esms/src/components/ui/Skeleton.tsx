import ReactLoadingSkeleton, { type SkeletonProps, SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export interface CustomSkeletonProps extends SkeletonProps {
  className?: string;
}

export const Skeleton = ({
  baseColor = '#f1f5f9',
  highlightColor = '#e2e8f0',
  borderRadius = '0.75rem',
  className = '',
  ...props
}: CustomSkeletonProps) => {
  return (
    <ReactLoadingSkeleton
      baseColor={baseColor}
      highlightColor={highlightColor}
      borderRadius={borderRadius}
      className={className}
      {...props}
    />
  );
};

export { SkeletonTheme };
