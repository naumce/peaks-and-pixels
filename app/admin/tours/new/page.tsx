import { CreateTourWizard } from '@/components/shared/create-tour-wizard';

export default function AdminCreateTourPage() {
    return (
        <CreateTourWizard
            apiEndpoint="/api/admin/tours"
            backLink="/admin/tours"
            successRedirect="/admin/tours"
            showFeaturedToggle={true}
        />
    );
}
