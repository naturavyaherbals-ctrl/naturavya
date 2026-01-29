import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  AlertTriangle, 
  ArrowRight,
  Lightbulb,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import type { LeakagePoint } from '@/types';

interface LeakageDetectorProps {
  leakagePoints: LeakagePoint[];
}

export function LeakageDetector({ leakagePoints }: LeakageDetectorProps) {
  const totalLoss = leakagePoints.reduce((sum, lp) => sum + lp.potential_revenue_loss, 0);

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          🚨 Pipeline Leakage Detector
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="danger" size="md">
            <DollarSign className="w-4 h-4 mr-1" />
            ₹{totalLoss.toLocaleString('en-IN')} Potential Loss
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-red-800 text-sm">
            ⚠️ <strong>Owner Alert:</strong> Yeh areas mein revenue leak ho raha hai. 
            Immediate action lena chahiye!
          </p>
        </div>

        <div className="divide-y">
          {leakagePoints.map((leakage, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                {/* Stage Flow */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                    {leakage.from_count}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm">
                    {leakage.to_count}
                  </div>
                  <span className="text-sm font-medium text-gray-700 ml-2">
                    {leakage.stage}
                  </span>
                </div>

                {/* Drop Rate */}
                <div className="flex items-center gap-3">
                  <Badge variant="danger" className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {leakage.drop_rate}% Drop
                  </Badge>
                  <span className="text-red-600 font-semibold">
                    -₹{leakage.potential_revenue_loss.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-amber-600 font-medium mb-1">🤖 AI Suggestion:</p>
                    <p className="text-sm text-amber-800">{leakage.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Summary */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t">
          <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Top 3 Priority Actions:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-indigo-700">
            <li>Hot leads ko same day close karo - ₹42,330 bach sakta hai</li>
            <li>New leads pe auto WhatsApp lagao - 18 leads miss ho rahe hain</li>
            <li>Team ko follow-up training do - 43 leads interested nahi ho rahe</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
