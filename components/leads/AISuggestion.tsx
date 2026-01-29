import { Sparkles } from 'lucide-react';

interface Props {
  suggestion: string | null | undefined;
  message?: string | null | undefined;
}

export function AISuggestion({ suggestion, message }: Props) {
  if (!suggestion && !message) return null;

  return (
    <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          {suggestion && (
            <p className="text-sm font-medium text-amber-800">{suggestion}</p>
          )}
          {message && (
            <p className="text-xs text-amber-600 mt-1 italic">"{message}"</p>
          )}
        </div>
      </div>
    </div>
  );
}
