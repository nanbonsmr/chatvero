import DashboardLayout from "@/components/DashboardLayout";
import { DashboardPricing as PricingSection } from "@/components/dashboard/DashboardPricing";
import { useSubscription } from "@/hooks/useSubscription";

const DashboardPricingPage = () => {
  const { data: subscription } = useSubscription();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Pricing & Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your subscription and upgrade your plan
          </p>
        </div>

        <PricingSection currentPlan={subscription?.plan} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPricingPage;
