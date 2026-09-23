"use client";

import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/auth-provider";

export function UserProfileDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            Perfil do Usuário
          </DialogTitle>
          <DialogDescription>
            Suas informações pessoais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/80 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Nome</p>
              <p className="truncate text-sm font-medium">{user?.name || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/80 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="truncate text-sm font-medium">{user?.email || "—"}</p>
            </div>
          </div>

          
          </div>
        
       
        
      </DialogContent>
    </Dialog>
  );
}
