import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import type { Campaign } from '@/types';

interface CampaignROIProps {
  campaigns: Campaign[];
}

export function CampaignROITable({ campaigns }: CampaignROIProps) {
  const sortedCampaigns = [...campaigns].sort((a, b) => b.roi - a.roi);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Campaign ROI Tracker
        </CardTitle>
        <Badge variant="info">Last 30 Days</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Campaign</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Platform</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Spend</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Leads</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CPL</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Conversions</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">CPA</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                      {campaign.adset_name && (
                        <p className="text-xs text-gray-500">{campaign.adset_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={campaign.platform === 'meta' ? 'info' : 'warning'}>
                      {campaign.platform === 'meta' ? '📘 Meta' : '🔍 Google'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">
                    ₹{campaign.spend.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{campaign.leads_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={campaign.cpl <= 150 ? 'success' : campaign.cpl <= 200 ? 'warning' : 'danger'}>
                      ₹{campaign.cpl}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-600">{campaign.conversions}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={campaign.cpa <= 600 ? 'success' : campaign.cpa <= 800 ? 'warning' : 'danger'}>
                      ₹{campaign.cpa}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-green-600">
                    ₹{campaign.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ROIBadge roi={campaign.roi} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 border-t grid grid-cols-4 gap-4">
          <SummaryCard
            label="Total Spend"
            value={`₹${campaigns.reduce((sum, c) => sum + c.spend, 0).toLocaleString('en-IN')}`}
            icon={DollarSign}
            color="text-red-600"
          />
          <SummaryCard
            label="Total Leads"
            value={campaigns.reduce((sum, c) => sum + c.leads_count, 0).toString()}
            icon={Users}
            color="text-blue-600"
          />
          <SummaryCard
            label="Total Conversions"
            value={campaigns.reduce((sum, c) => sum + c.conversions, 0).toString()}
            icon={Target}
            color="text-green-600"
          />
          <SummaryCard
            label="Total Revenue"
            value={`₹${campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString('en-IN')}`}
            icon={TrendingUp}
            color="text-purple-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ROIBadge({ roi }: { roi: number }) {
  const isPositive = roi > 100;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold text-sm ${
      roi >= 200 ? 'bg-green-100 text-green-700' :
      roi >= 100 ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
    }`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {roi}%
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
        <Icon className={`w-3 h-3 ${color}`} />
        {label}
      </div>
      <p className={`font-bold text-lg ${color}`}>{value}</p>
    </div>
  );
}
