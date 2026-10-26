import express from 'express';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getUserTransactions,
  addTransaction,
  deleteTransaction,
  toggleTransactionPaid,
  getUserBudget,
  saveUserBudget,
} from './src/db/queries.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  app.get('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const transactions = await getUserTransactions(req.user.uid);
      res.json(transactions);
    } catch (error: any) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
    }
  });

  app.post('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id, type, title, amount, category, date, isPaid, dueDate, note } = req.body;
      const tx = await addTransaction({
        id,
        userUid: req.user.uid,
        type,
        title,
        amount: parseFloat(amount),
        category,
        date,
        isPaid,
        dueDate,
        note,
      });
      res.json(tx);
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      res.status(500).json({ error: error.message || 'Failed to add transaction' });
    }
  });

  app.delete('/api/transactions/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      await deleteTransaction(req.user.uid, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: error.message || 'Failed to delete transaction' });
    }
  });

  app.patch('/api/transactions/:id/toggle-paid', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const updated = await toggleTransactionPaid(req.user.uid, req.params.id);
      res.json(updated);
    } catch (error: any) {
      console.error('Error toggling paid state:', error);
      res.status(500).json({ error: error.message || 'Failed to toggle paid state' });
    }
  });

  app.get('/api/budget', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const monthKey = (req.query.monthKey as string) || new Date().toISOString().slice(0, 7);
      const budget = await getUserBudget(req.user.uid, monthKey);
      res.json(budget);
    } catch (error: any) {
      console.error('Error getting budget:', error);
      res.status(500).json({ error: error.message || 'Failed to get budget' });
    }
  });

  app.post('/api/budget', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { monthKey, amount, cautionPercent, alertEnabled } = req.body;
      const budget = await saveUserBudget({
        userUid: req.user.uid,
        monthKey,
        amount: parseFloat(amount),
        cautionPercent,
        alertEnabled,
      });
      res.json(budget);
    } catch (error: any) {
      console.error('Error saving budget:', error);
      res.status(500).json({ error: error.message || 'Failed to save budget' });
    }
  });

  // Vite Integration for frontend rendering
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
