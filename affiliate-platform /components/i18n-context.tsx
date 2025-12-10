'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  dashboard: { en: 'Dashboard', fr: 'Tableau de bord' },
  referralLinkGenerator: {
    en: 'Referral Link Generator',
    fr: 'Générateur de lien de parrainage',
  },
  activeCampaigns: { en: 'Active Campaigns', fr: 'Campagnes actives' },
  customLinkGenerator: {
    en: 'Custom Link Generator',
    fr: 'Générateur de lien personnalisé',
  },
  earningsReports: { en: 'Earnings Reports', fr: 'Rapports de revenus' },
  commissionEarnings: {
    en: 'Commission Earnings',
    fr: 'Revenus de commission',
  },
  affiliateLeaderboard: {
    en: 'Affiliate Leaderboard',
    fr: 'Classement des affiliés',
  },
  walletPayouts: { en: 'Wallet & Payouts', fr: 'Portefeuille et paiements' },
  settings: { en: 'Settings', fr: 'Paramètres' },
  helpCenter: { en: 'Help Center', fr: "Centre d'aide" },
  compliance: { en: 'Compliance', fr: 'Conformité' },
  viewReports: { en: 'View Reports', fr: 'Voir les rapports' },
  requestPayout: { en: 'Request Payout', fr: 'Demander un paiement' },
  totalEarnings: { en: 'Total Earnings', fr: 'Revenus totaux' },
  totalReferrals: { en: 'Total Referrals', fr: 'Total des parrainages' },
  clicks: { en: 'Clicks', fr: 'Clics' },
  conversions: { en: 'Conversions', fr: 'Conversions' },
  conversionRate: { en: 'Conversion Rate', fr: 'Taux de conversion' },
  epc: { en: 'EPC (Earnings Per Click)', fr: 'EPC (Revenus par clic)' },
  initialVsReload: { en: 'Initial vs Reload', fr: 'Initial vs Rechargement' },
  mainMenu: { en: 'MAIN MENU', fr: 'MENU PRINCIPAL' },
  earnings: { en: 'EARNINGS', fr: 'REVENUS' },
  affiliateProgram: { en: 'AFFILIATE PROGRAM', fr: "PROGRAMME D'AFFILIATION" },
  preference: { en: 'PREFERENCE', fr: 'PRÉFÉRENCE' },
  logout: { en: 'Logout', fr: 'Déconnexion' },
  mot: { en: 'MOT', fr: 'MOT' },
  quizWidget: {
    en: 'Quiz Widget',
    fr: 'Widget de quiz',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
