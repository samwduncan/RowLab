import { useMemo } from 'react';
import { useAthleteAttendance } from '@v2/hooks/useAttendance';
import type { AttendanceStatus } from '@v2/types/athletes';

interface AttendanceHistoryProps {
  athleteId: string;
  athleteName: string;
  startDate?: string;
  endDate?: string;
}

const statusConfig: Record<AttendanceStatus, { label: string; color: string; bgColor: string }> = {
  present: { label: 'Present', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  late: { label: 'Late', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  excused: { label: 'Excused', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  unexcused: { label: 'Unexcused', color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

export function AttendanceHistory({
  athleteId,
  athleteName,
  startDate,
  endDate,
}: AttendanceHistoryProps) {
  const { data: attendance, isLoading } = useAthleteAttendance(athleteId, {
    startDate,
    endDate,
  });

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!attendance) return null;

    const counts = { present: 0, late: 0, excused: 0, unexcused: 0, total: 0 };
    attendance.forEach((record) => {
      counts[record.status]++;
      counts.total++;
    });

    const attendanceRate = counts.total > 0
      ? ((counts.present + counts.late) / counts.total * 100).toFixed(1)
      : '0';

    return { ...counts, attendanceRate };
  }, [attendance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-interactive-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-txt-primary">
          {athleteName} - Attendance History
        </h3>
        {stats && (
          <span className="text-sm text-txt-secondary">
            {stats.attendanceRate}% attendance rate
          </span>
        )}
      </div>

      {/* Summary cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
            const config = statusConfig[status];
            return (
              <div
                key={status}
                className={`p-3 rounded-lg ${config.bgColor}`}
              >
                <div className={`text-2xl font-bold ${config.color}`}>
                  {stats[status]}
                </div>
                <div className="text-xs text-txt-secondary mt-1">
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History list */}
      {attendance && attendance.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {attendance.map((record) => {
            const config = statusConfig[record.status];
            const date = new Date(record.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-bg-surface-elevated rounded-lg"
              >
                <span className="text-txt-primary">{date}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-txt-secondary">
          No attendance records found for this period.
        </div>
      )}
    </div>
  );
}
