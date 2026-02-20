interface SkeletonRowProps {
  rows?: number;
}

export default function SkeletonRow({ rows = 3 }: SkeletonRowProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td className="tw-p-4 tw-border-b tw-border-blue-gray-50">
            <div className="tw-animate-pulse tw-flex tw-flex-col tw-gap-2">
              <div className="tw-h-4 tw-w-40 tw-bg-blue-gray-100 tw-rounded"></div>
              <div className="tw-h-3 tw-w-72 tw-bg-blue-gray-100 tw-rounded"></div>
            </div>
          </td>

          <td className="tw-p-4 tw-border-b tw-border-blue-gray-50">
            <div className="tw-animate-pulse tw-h-4 tw-w-24 tw-bg-blue-gray-100 tw-rounded"></div>
          </td>

          <td className="tw-p-4 tw-border-b tw-border-blue-gray-50">
            <div className="tw-animate-pulse tw-h-8 tw-w-8 tw-bg-blue-gray-100 tw-rounded"></div>
          </td>
        </tr>
      ))}
    </>
  );
}
