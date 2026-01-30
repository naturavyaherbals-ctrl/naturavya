import { ActivityEvent } from '@/types/crm';
import { cn } from '@/utils/cn';
import {
  Activity,
  MessageCircle,
  Phone,
  Package,
  CheckCircle2,
  PlusCircle,
  UserCheck,
  FileText,
  ArrowRightLeft,
  Clock,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityEvent[];
}

const activityConfig: Record<string, { icon: typeof Activity; color: string; bg: string }> = {
  status_change: { icon: ArrowRightLeft, color: 'text-blue-600', bg: 'bg-blue-100' },
  task_created: { icon: PlusCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  task_completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  order_created: { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
  order_updated: { icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
  call: { icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  whatsapp: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-100' },
  note: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
  assignment: { icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-100' },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const groupActivitiesByDate = (activities: ActivityEvent[]) => {
    const groups: { date: string; items: ActivityEvent[] }[] = [];
    let currentDate = '';

    activities.forEach((activity) => {
      const activityDate = new Date(activity.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (activityDate !== currentDate) {
        currentDate = activityDate;
        groups.push({ date: activityDate, items: [] });
      }

      groups[groups.length - 1].items.push(activity);
    });

    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          Activity Timeline
        </h2>
        {activities.length > 0 && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {activities.length} events
          </span>
        )}
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedActivities.map((group, groupIdx) => (
              <div key={groupIdx}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-medium text-gray-500 px-2">
                    {group.date}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Activities */}
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

                  <div className="space-y-4">
                    {group.items.map((activity) => {
                      const config = activityConfig[activity.type] || activityConfig.note;
                      const Icon = config.icon;

                      return (
                        <div key={activity.id} className="relative flex items-start gap-4 pl-2">
                          {/* Icon */}
                          <div className={cn(
                            'relative z-10 w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-white',
                            config.bg
                          )}>
                            <Icon className={cn('w-3.5 h-3.5', config.color)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.title}
                                </p>
                                {activity.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatTime(activity.created_at)}
                              </span>
                            </div>
                            {activity.agent_name && (
                              <p className="text-xs text-gray-400 mt-1">
                                by {activity.agent_name}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
