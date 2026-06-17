import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { SearchService } from '../services/search.service';

export class SearchController {
  private searchService = new SearchService();

  public globalSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Search query "q" is required' });
        return;
      }

      const results = await this.searchService.globalSearch(workspaceId as string, q);
      res.status(200).json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public semanticSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Search query "q" is required' });
        return;
      }

      const results = await this.searchService.semanticSearch(workspaceId as string, q);
      res.status(200).json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
