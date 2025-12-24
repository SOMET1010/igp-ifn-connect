import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { agentService } from "../services/agentService";
import type { AgentRequest, AgentRequestInput } from "../types/agent.types";

export function useAgentRequest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<AgentRequest | null>(null);

  const fetchMyRequest = useCallback(async () => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      const data = await agentService.getAgentRequest(user.id);
      setRequest(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const submitRequest = useCallback(async (input: AgentRequestInput) => {
    if (!user) {
      setError("Vous devez être connecté");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await agentService.submitAgentRequest(user.id, input);
      setRequest(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la soumission";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const cancelRequest = useCallback(async () => {
    if (!user || !request) {
      setError("Aucune demande à annuler");
      return false;
    }

    if (request.status !== "pending") {
      setError("Seules les demandes en attente peuvent être annulées");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await agentService.cancelAgentRequest(request.id, user.id);
      setRequest(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'annulation";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, request]);

  return {
    request,
    isLoading,
    error,
    fetchMyRequest,
    submitRequest,
    cancelRequest,
  };
}
