import { CreateTourWizard } from '@/components/shared/create-tour-wizard';

export default function DashboardCreateTourPage() {
    return (
        <CreateTourWizard
            apiEndpoint="/api/operator/tours"
            backLink="/dashboard/tours"
            successRedirect="/dashboard/tours"
            showFeaturedToggle={false}
        />
    );
}
