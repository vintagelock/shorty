import axios from "axios";

class URLShortenerAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Shortens a URL with an optional expiration date.
   * @param originalUrl - The original URL to shorten.
   * @param expirationDate - Optional expiration date in ISO format.
   * @returns A Promise that resolves with the shortened URL.
   */
  async shortenUrl(
    originalUrl: string,
    expirationDate?: string
  ): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/shorten`, {
        originalUrl,
        expirationDate,
      });
      return response.data.shortenedUrl;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to shorten URL");
    }
  }

  /**
   * Fetches analytics data for a shortened URL.
   * @param shortenedId - The unique ID of the shortened URL.
   * @returns A Promise that resolves with the analytics data.
   */
  async getAnalytics(shortenedId: string): Promise<{
    originalUrl: string;
    shortenedId: string;
    createdAt: string;
    expirationDate?: string;
    clickCount: number;
    analytics: { ip: string; timestamp: string; useragent: string }[];
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/analytics/${shortenedId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch analytics"
      );
    }
  }

  /**
   * Redirects to the original URL for a given shortened ID.
   * This method does not return anything as the backend handles the redirection.
   * @param shortenedId - The unique ID of the shortened URL.
   */
  async redirect(shortenedId: string): Promise<void> {
    try {
      await axios.get(`${this.baseUrl}/${shortenedId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to redirect to original URL"
      );
    }
  }
}

export default URLShortenerAPI;

// Usage example:
// const api = new URLShortenerAPI('http://localhost:3000');
// api.shortenUrl('https://example.com').then(console.log).catch(console.error);
