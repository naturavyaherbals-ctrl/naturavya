interface Props {
  score: number | null | undefined;
}

export function LeadScoreBadge({ score }: Props) {
  if (score === null || score === undefined) return null;

  let bgColor = 'bg-gray-100 text-gray-700';
  if (score >= 75) {
    bgColor = 'bg-green-100 text-green-700';
  } else if (score >= 50) {
    bgColor = 'bg-yellow-100 text-yellow-700';
  } else if (score >= 25) {
    bgColor = 'bg-orange-100 text-orange-700';
  } else {
    bgColor = 'bg-red-100 text-red-700';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      Score: {score}/100
    </span>
  );
}
