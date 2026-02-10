import { SchedulePage } from '@/components/shared/schedule-page';

export default function DashboardSchedulePage() {
    return (
        <SchedulePage
            apiBase="/api/operator/tours"
            backLink="/dashboard/tours"
        />
    );
}
