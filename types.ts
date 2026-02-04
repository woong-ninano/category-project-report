
export interface ContentItem {
  id?: string;
  category?: string;
  title: string;
  description: string;
  subDescription?: string;
  images: string[];
}

export interface SiteConfig {
  headerLogoUrl: string;
  headerProjectTitle: string;
  headerTopText: string;
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc1: string;
  heroDesc2: string;
  contentItemsMO: ContentItem[]; // 기존 contentItems 대체
  contentItemsPC: ContentItem[]; // PC 전용 컨텐츠 추가
  adminPassword?: string;
}

export interface SectionData {
  id: string;
  items: ContentItem[];
  viewMode: 'MO' | 'PC'; // 뷰 모드 추가
}

export interface MetricData {
  name: string;
  value: number;
}
