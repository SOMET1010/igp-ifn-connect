/**
 * Hook pour la gestion des membres de coopérative
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchCooperativeMembers, 
  calculateMemberStats, 
  addMember, 
  updateMember, 
  deleteMember 
} from '../services/memberService';
import type { AddMemberFormData } from '../types/member.types';

export function useCooperativeMembers(cooperativeId: string | undefined, cooperativeName: string | undefined) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['cooperative-members', cooperativeId, cooperativeName],
    queryFn: async () => {
      if (!cooperativeId || !cooperativeName) return [];
      const { data, error } = await fetchCooperativeMembers(cooperativeId, cooperativeName);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!cooperativeId && !!cooperativeName,
    staleTime: 60 * 1000,
  });

  const stats = membersQuery.data ? calculateMemberStats(membersQuery.data) : {
    total: 0,
    withCMU: 0,
    withCNPS: 0,
    withBoth: 0,
  };

  const addMemberMutation = useMutation({
    mutationFn: (memberData: AddMemberFormData) => {
      if (!cooperativeId || !cooperativeName) {
        return Promise.reject(new Error('Coopérative non définie'));
      }
      return addMember(cooperativeId, cooperativeName, memberData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-members', cooperativeId, cooperativeName] });
        toast.success('Membre ajouté avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de l\'ajout');
      }
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout du membre');
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, updates }: { memberId: string; updates: Partial<AddMemberFormData> }) => 
      updateMember(memberId, updates),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-members', cooperativeId, cooperativeName] });
        toast.success('Membre modifié');
      } else {
        toast.error(result.error || 'Erreur lors de la modification');
      }
    },
    onError: () => {
      toast.error('Erreur lors de la modification');
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: string) => deleteMember(memberId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-members', cooperativeId, cooperativeName] });
        toast.success('Membre supprimé');
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    members: membersQuery.data || [],
    stats,
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    refetch: membersQuery.refetch,
    addMember: addMemberMutation.mutate,
    isAdding: addMemberMutation.isPending,
    updateMember: updateMemberMutation.mutate,
    isUpdating: updateMemberMutation.isPending,
    deleteMember: deleteMemberMutation.mutate,
    isDeleting: deleteMemberMutation.isPending,
  };
}
