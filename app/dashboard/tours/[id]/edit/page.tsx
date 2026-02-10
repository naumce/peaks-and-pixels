import { EditTourPage } from '@/components/shared/edit-tour-page';

export default function DashboardEditTourPage() {
    return (
        <EditTourPage
            apiBase="/api/operator/tours"
            backLink="/dashboard/tours"
            successRedirect="/dashboard/tours"
            showFeaturedToggle={false}
        />
    );
}
