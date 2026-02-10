import { EditTourPage } from '@/components/shared/edit-tour-page';

export default function AdminEditTourPage() {
    return (
        <EditTourPage
            apiBase="/api/admin/tours"
            backLink="/admin/tours"
            successRedirect="/admin/tours"
            showFeaturedToggle={true}
        />
    );
}
