import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAgentRequest } from "../../hooks/useAgentRequest";
import { AgentRegistrationForm } from "@/components/agent/AgentRegistrationForm";
import { AgentRequestStatus } from "@/components/agent/AgentRequestStatus";

interface AgentRegistrationSectionProps {
  user: { id: string; phone?: string } | null;
  onSuccess: () => void;
}

export function AgentRegistrationSection({ user, onSuccess }: AgentRegistrationSectionProps) {
  const { request, isLoading, fetchMyRequest, cancelRequest } = useAgentRequest();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyRequest();
  }, [fetchMyRequest]);

  const handleCancel = async () => {
    const success = await cancelRequest();
    if (success) {
      toast({
        title: "Demande annulée",
        description: "Votre demande a été annulée avec succès.",
      });
      setShowForm(true);
    }
  };

  const handleRetry = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchMyRequest();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // Show request status if user has a request and doesn't want to show form
  if (request && !showForm) {
    return (
      <AgentRequestStatus
        request={request}
        onCancel={request.status === "pending" ? handleCancel : undefined}
        onRetry={request.status === "rejected" ? handleRetry : undefined}
        isLoading={isLoading}
      />
    );
  }

  // Show registration form
  return (
    <AgentRegistrationForm
      onSuccess={handleFormSuccess}
      defaultValues={{
        full_name: "",
        phone: user?.phone || "",
      }}
    />
  );
}
