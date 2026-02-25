import { ClipboardList, Store, Warehouse, ShieldCheck } from "lucide-react";
import { LoginRoleConfig, AdminLoginConfig } from "../types/login.types";
import { supabase } from "@/integrations/supabase/client";

export const merchantLoginConfig: LoginRoleConfig = {
  role: "merchant",
  redirectTo: "/marchand",
  headerSubtitle: "Espace des Marchands",
  backgroundIcon: Store,
  stepsConfig: {
    phone: { title: "Espace Marchand", subtitle: "Étape 1 · Numéro de téléphone" },
    otp: { title: "Vérification", subtitle: "Étape 2 · Code de sécurité" },
    register: { title: "Création de compte", subtitle: "Étape 3 · Informations marchand" },
  },
  registerFieldLabel: "Nom complet",
  registerFieldPlaceholder: "Ex: Kouamé Adjoua",
  registerButtonLabel: "Créer mon compte",
  successMessage: "Bienvenue sur l'espace Marchand",
  audioTexts: {
    phone: "Bienvenue espace marchand. Entrez votre numéro de téléphone.",
    otp: "Entrez le code de vérification à 6 chiffres.",
    register: "Créez votre compte en entrant votre nom complet.",
  },
  emailPattern: (phone) => `${phone.replace(/\s/g, "")}@marchand.igp.ci`,
  passwordPattern: () => "marchand123",
  roleRpcName: "assign_merchant_role",
  tableName: "merchants",
  createEntityData: (userId, phone, fullName) => ({
    user_id: userId,
    full_name: fullName,
    phone: phone.replace(/\s/g, ""),
    cmu_number: `CMU-${Date.now()}`,
    activity_type: "Détaillant",
    status: "validated",
  }),
  updateEntityOnLogin: async (userId, phone) => {
    await supabase
      .from("merchants")
      .update({ user_id: userId })
      .eq("phone", phone.replace(/\s/g, ""))
      .is("user_id", null);
  },
};

export const agentLoginConfig: LoginRoleConfig = {
  role: "agent",
  redirectTo: "/agent",
  headerSubtitle: "Accès Agent",
  backgroundIcon: ClipboardList,
  stepsConfig: {
    phone: { title: "Identification Agent", subtitle: "Étape 1 · Numéro de téléphone" },
    otp: { title: "Vérification", subtitle: "Étape 2 · Code de sécurité" },
    register: { title: "Création de compte", subtitle: "Étape 3 · Informations agent" },
  },
  registerFieldLabel: "Nom complet",
  registerFieldPlaceholder: "Kouassi Konan Jean",
  registerButtonLabel: "Créer mon compte",
  successMessage: "Bienvenue sur l'espace Agent",
  audioTexts: {
    phone: "Bienvenue agent terrain. Entrez votre numéro de téléphone pour vous identifier.",
    otp: "Entrez le code de vérification à 6 chiffres reçu par SMS.",
    register: "Créez votre compte agent en entrant votre nom complet.",
  },
  emailPattern: (phone) => `agent_${phone}@julaba.ci`,
  passwordPattern: (phone) => `agent_${phone}_secure`,
  roleRpcName: "assign_agent_role",
  tableName: "agents",
  createEntityData: (userId) => ({
    user_id: userId,
    employee_id: `AGT-${Date.now()}`,
    organization: "DGE",
    zone: "À définir",
    is_active: true,
  }),
  updateEntityOnLogin: async (userId) => {
    await supabase
      .from("agents")
      .update({ user_id: userId })
      .is("user_id", null);
  },
};

export const cooperativeLoginConfig: LoginRoleConfig = {
  role: "cooperative",
  redirectTo: "/cooperative",
  headerSubtitle: "Espace Coopérative",
  backgroundIcon: Warehouse,
  stepsConfig: {
    phone: { title: "Connexion Coopérative", subtitle: "Étape 1 · Numéro de téléphone" },
    otp: { title: "Vérification", subtitle: "Étape 2 · Code de sécurité" },
    register: { title: "Création de compte", subtitle: "Étape 3 · Informations coopérative" },
  },
  registerFieldLabel: "Nom de la coopérative",
  registerFieldPlaceholder: "Coopérative des Vivriers de Bouaké",
  registerButtonLabel: "Créer mon espace",
  successMessage: "Bienvenue sur l'espace Coopérative",
  audioTexts: {
    phone: "Bienvenue espace coopérative. Entrez votre numéro de téléphone pour vous connecter.",
    otp: "Entrez le code de vérification à 6 chiffres reçu par SMS.",
    register: "Créez votre espace coopérative en entrant le nom de votre coopérative.",
  },
  emailPattern: (phone) => `coop_${phone}@ifn.ci`,
  passwordPattern: (phone) => `coop_${phone}_secure`,
  roleRpcName: "assign_cooperative_role",
  tableName: "cooperatives",
  createEntityData: (userId, phone, fullName) => ({
    user_id: userId,
    name: fullName,
    code: `COOP-${phone.replace(/\s/g, "").slice(-6)}`,
    commune: "À définir",
    region: "À définir",
    phone: phone.replace(/\s/g, ""),
  }),
  updateEntityOnLogin: async (userId, phone) => {
    await supabase
      .from("cooperatives")
      .update({ user_id: userId })
      .eq("phone", phone.replace(/\s/g, ""))
      .is("user_id", null);
  },
};

export const adminLoginConfig: AdminLoginConfig = {
  role: "admin",
  redirectTo: "/admin",
  headerTitle: "Administration JÙLABA",
  headerSubtitle: "Plateforme Nationale des Acteurs du Vivrier Marchand",
  backgroundIcon: ShieldCheck,
  audioText: "Portail d'administration JÙLABA. Entrez votre email et mot de passe pour vous connecter.",
};
