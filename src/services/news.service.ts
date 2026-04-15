import api from './api';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  category: string;
  url: string;
  source: string;
}

const newsService = {
  /**
   * Fetch automotive news articles from the backend proxy.
   * The backend caches results for 30 minutes.
   */
  async getAutomotiveNews(pageSize = 10): Promise<NewsItem[]> {
    const response = await api.get<{ success: boolean; data: NewsItem[] }>('/news', {
      params: { pageSize },
    });
    return response.data.data ?? [];
  },
};

export default newsService;
