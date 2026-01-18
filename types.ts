
export type Language = 'en' | 'he' | 'zh' | 'hi' | 'de' | 'es' | 'fr';

export type FontSize = 'small' | 'medium' | 'large';

export interface Translation {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  jsTitle: string;
  tsTitle: string;
  goTitle: string;
  pyTitle: string;
  qtTitle: string;
  rbTitle: string;
  nodeTitle: string;
  jsDesc: string;
  tsDesc: string;
  goDesc: string;
  startLearning: string;
  footerRights: string;
  feedback: string;
  clearInput: string;
  exportSearch: string;
  offlineMode: string;
  ttsEnable: string;
  shortcutsInfo: string;
  surveyLinkText: string;
  copyLabel: string;
  shareLabel: string;
  exportCodeLabel: string;
  accessibilityTitle: string;
  accessibilityContent: string;
  closeLabel: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  code?: string;
}

export interface Course {
  id: string;
  title: string;
  category: 'JS' | 'TS' | 'GO' | 'PY' | 'QT' | 'RB' | 'NODE';
  modules: ContentItem[];
}
