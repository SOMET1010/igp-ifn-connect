/**
 * Carte d'un membre de coopérative
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, Shield, Building2, Trash2 } from 'lucide-react';
import type { CooperativeMember } from '../../types/member.types';

interface MemberCardProps {
  member: CooperativeMember;
  onDelete?: (memberId: string) => void;
  isDeleting?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onDelete,
  isDeleting 
}) => {
  const hasCMU = member.cmu_status && member.cmu_status.toLowerCase() !== 'non';
  const hasCNPS = member.cnps_status && member.cnps_status.toLowerCase() !== 'non';

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{member.full_name}</h3>
              {member.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" />
                  {member.phone}
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                {hasCMU && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                    <Shield className="h-3 w-3 mr-1" />
                    CMU
                  </Badge>
                )}
                {hasCNPS && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                    <Building2 className="h-3 w-3 mr-1" />
                    CNPS
                  </Badge>
                )}
                {!hasCMU && !hasCNPS && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Aucune affiliation
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(member.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
