import { SchedulePage } from '@/components/shared/schedule-page';

export default function AdminSchedulePage() {
    return (
        <SchedulePage
            apiBase="/api/admin/tours"
            backLink="/admin/tours"
        />
    );
}
