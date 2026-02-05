import DashboardLayout from "@/components/DashboardLayout";
import { DashboardPricing as PricingSection } from "@/components/dashboard/DashboardPricing";
import { useSubscription } from "@/hooks/useSubscription";

const DashboardPricingPage = () => {
  const { data: subscription } = useSubscription();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Plans & Pricing</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a plan that works for you
          </p>
        </div>

        <PricingSection currentPlan={subscription?.plan} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPricingPage;
