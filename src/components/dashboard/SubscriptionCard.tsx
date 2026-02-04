import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Calendar, ArrowUpRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription, useCancelSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PricingModal } from "./PricingModal";

const planDetails: Record<string, { name: string; color: string; gradient: string }> = {
  starter: {
    name: "Starter",
    color: "text-blue-500",
    gradient: "from-blue-500 to-cyan-500",
  },
  growth: {
    name: "Growth",
    color: "text-primary",
    gradient: "from-primary to-accent",
  },
  business: {
    name: "Business",
    color: "text-purple-500",
    gradient: "from-purple-500 to-pink-500",
  },
};

export const SubscriptionCard = () => {
  const { data: subscription, isLoading, refetch } = useSubscription();
  const { cancelSubscription } = useCancelSubscription();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      await refetch();
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-4 sm:p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </motion.div>
    );
  }

  // No active subscription
  if (!subscription) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl sm:rounded-2xl border border-dashed border-border bg-card/50 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">Free Plan</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upgrade to unlock more features
                </p>
              </div>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80" onClick={() => setPricingOpen(true)}>
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          </div>
        </motion.div>
        <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
      </>
    );
  }

  const plan = planDetails[subscription.plan] || planDetails.starter;
  const daysRemaining = getDaysRemaining(subscription.expires_at);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card"
      >
        {/* Gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient}`} />

        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Plan info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg sm:text-xl">{plan.name} Plan</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Expires: {formatDate(subscription.expires_at)}
                  </span>
                  {daysRemaining !== null && daysRemaining <= 7 && (
                    <span className="flex items-center gap-1 text-amber-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {daysRemaining} days left
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {subscription.plan !== "business" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPricingOpen(true)}
                  className="text-xs sm:text-sm"
                >
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive text-xs sm:text-sm">
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription will remain active until {formatDate(subscription.expires_at)}.
                      After that, you'll lose access to {plan.name} features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-destructive text-destructive-foreground"
                      disabled={cancelling}
                    >
                      {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Subscription"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Subscription details */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Started</p>
              <p className="text-sm font-medium">{formatDate(subscription.started_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Next Billing</p>
              <p className="text-sm font-medium">{formatDate(subscription.expires_at)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
              <p className="text-sm font-medium font-mono truncate">
                {subscription.dodo_transaction_id || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <PricingModal 
        open={pricingOpen} 
        onOpenChange={setPricingOpen} 
        currentPlan={subscription.plan}
      />
    </>
  );
};
