import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Trophy, 
  Clock, 
  AlertTriangle,
  Flame
} from 'lucide-react';
import type { StaffPerformance } from '@/types';

interface StaffPerformanceTableProps {
  staff: StaffPerformance[];
}

export function StaffPerformanceTable({ staff }: StaffPerformanceTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Staff Performance Leaderboard
        </CardTitle>
        <Badge variant="info">Today</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agent</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Leads</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Conversions</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Conv. Rate</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Avg Response</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staff.map((member, index) => (
                <tr key={member.team_member_id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <RankBadge rank={index + 1} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Flame className="w-3 h-3 text-red-500" />
                          {member.hot_leads} hot leads
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div>
                      <p className="font-semibold">{member.leads_assigned}</p>
                      <p className="text-xs text-gray-500">{member.leads_contacted} contacted</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-green-600">{member.leads_converted}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge 
                      variant={member.conversion_rate >= 25 ? 'success' : member.conversion_rate >= 15 ? 'warning' : 'danger'}
                    >
                      {member.conversion_rate}%
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className={member.avg_response_time <= 10 ? 'text-green-600' : member.avg_response_time <= 20 ? 'text-yellow-600' : 'text-red-600'}>
                        {member.avg_response_time} min
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-900">
                    ₹{member.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {member.pending_follow_ups > 5 ? (
                      <Badge variant="danger" className="animate-pulse">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {member.pending_follow_ups}
                      </Badge>
                    ) : (
                      <Badge variant="default">{member.pending_follow_ups}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
        <Trophy className="w-4 h-4 text-yellow-600" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-bold text-gray-600">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-bold text-orange-600">3</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
      <span className="text-sm text-gray-500">{rank}</span>
    </div>
  );
}
