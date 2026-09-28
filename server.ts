import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory data store with sensible initial seed for couples
let usersStore = [
  {
    id: 'user_marcelo',
    name: 'Marcelo Augusto',
    shortName: 'Marcelo',
    email: 'marceloaugustolima2003@gmail.com',
    avatarColor: '#0E1B25',
    neonColor: '#00F0FF',
    avatarInitial: 'M',
    bankName: 'Nubank',
    primaryCard: 'Nubank Ultravioleta',
    accountNumber: 'Ag 0001 • C/C 48291-3',
    monthlySalary: 8200.0,
    initialBalance: 4650.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_zayra_partner',
    name: 'Gabriela Duarte',
    shortName: 'Gabi',
    email: 'gabi.duarte@email.com',
    avatarColor: '#23121E',
    neonColor: '#FF70A6',
    avatarInitial: 'G',
    bankName: 'Inter',
    primaryCard: 'Inter Black Mastercard',
    accountNumber: 'Ag 0001 • C/C 39102-8',
    monthlySalary: 7400.0,
    initialBalance: 3900.0,
    createdAt: new Date().toISOString(),
  },
];

let transactionsStore = [
  {
    id: 'tx_seed_1',
    userId: 'user_marcelo',
    description: 'Supermercado Pão de Açúcar (Casal)',
    amount: 382.4,
    type: 'expense',
    category: 'Mercado',
    categoryIcon: '🛒',
    categoryColor: '#FF7A00',
    date: 'Hoje, 14:20',
    cardName: 'Nubank',
    note: 'Compras semanais do casal',
  },
  {
    id: 'tx_seed_2',
    userId: 'user_marcelo',
    description: 'Salário Tech & Consultoria',
    amount: 8200.0,
    type: 'income',
    category: 'Salário',
    categoryIcon: '💼',
    categoryColor: '#39FF14',
    date: 'Ontem',
    cardName: 'Nubank',
  },
  {
    id: 'tx_seed_3',
    userId: 'user_marcelo',
    description: 'Pet Shop Zayra (Ração & Banho)',
    amount: 249.9,
    type: 'expense',
    category: 'Pet Shop',
    categoryIcon: '🐾',
    categoryColor: '#FF70A6',
    date: '26/09',
    cardName: 'Nubank',
    note: 'Itens da nossa Spitz Zayra',
  },
  {
    id: 'tx_seed_4',
    userId: 'user_zayra_partner',
    description: 'Jantar Romântico Bistrô',
    amount: 295.0,
    type: 'expense',
    category: 'Restaurante',
    categoryIcon: '🥂',
    categoryColor: '#00F0FF',
    date: 'Ontem',
    cardName: 'Inter',
    note: 'Comemoração mensal',
  },
  {
    id: 'tx_seed_5',
    userId: 'user_zayra_partner',
    description: 'Salário & Dividendos',
    amount: 7400.0,
    type: 'income',
    category: 'Salário',
    categoryIcon: '💼',
    categoryColor: '#39FF14',
    date: 'Ontem',
    cardName: 'Inter',
  },
  {
    id: 'tx_seed_6',
    userId: 'user_zayra_partner',
    description: 'Condomínio & Energia',
    amount: 890.0,
    type: 'expense',
    category: 'Moradia',
    categoryIcon: '🏠',
    categoryColor: '#0066FF',
    date: '25/09',
    cardName: 'Inter',
  },
];

let goalsStore = [
  {
    id: 'goal_m1',
    userId: 'user_marcelo',
    title: 'Alimentação & Mercado',
    spent: 850,
    limit: 1800,
    percentage: 47,
    color: '#FF7A00',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    icon: '🛒',
  },
  {
    id: 'goal_m2',
    userId: 'user_marcelo',
    title: 'Moradia & Contas Fixas',
    spent: 1200,
    limit: 2500,
    percentage: 48,
    color: '#0066FF',
    glowColor: 'rgba(0, 102, 255, 0.45)',
    icon: '🏠',
  },
  {
    id: 'goal_m3',
    userId: 'user_marcelo',
    title: 'Lazer do Casal & Viagens',
    spent: 620,
    limit: 1400,
    percentage: 44,
    color: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    icon: '🥂',
  },
  {
    id: 'goal_m4',
    userId: 'user_marcelo',
    title: 'Reserva & Aportes',
    spent: 1800,
    limit: 2200,
    percentage: 82,
    color: '#39FF14',
    glowColor: 'rgba(57, 255, 20, 0.45)',
    icon: '📈',
  },
  {
    id: 'goal_g1',
    userId: 'user_zayra_partner',
    title: 'Alimentação & Mercado',
    spent: 720,
    limit: 1600,
    percentage: 45,
    color: '#FF7A00',
    glowColor: 'rgba(255, 122, 0, 0.45)',
    icon: '🛒',
  },
  {
    id: 'goal_g2',
    userId: 'user_zayra_partner',
    title: 'Moradia & Contas',
    spent: 980,
    limit: 2200,
    percentage: 44,
    color: '#0066FF',
    glowColor: 'rgba(0, 102, 255, 0.45)',
    icon: '🏠',
  },
  {
    id: 'goal_g3',
    userId: 'user_zayra_partner',
    title: 'Pet Zayra & Cuidados',
    spent: 310,
    limit: 600,
    percentage: 51,
    color: '#FF70A6',
    glowColor: 'rgba(255, 112, 166, 0.45)',
    icon: '🐾',
  },
];

let recurringStore = [
  {
    id: 'rec_seed_1',
    userId: 'user_marcelo',
    description: 'Salário Tech & Consultoria',
    amount: 8200.0,
    type: 'income',
    category: 'Salário',
    categoryIcon: '💼',
    categoryColor: '#39FF14',
    frequency: 'monthly',
    dayOfMonth: 5,
    cardName: 'Nubank',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-05',
    nextDueDate: '2026-10-05',
  },
  {
    id: 'rec_seed_2',
    userId: 'user_marcelo',
    description: 'Netflix 4K Ultra HD (Casal)',
    amount: 55.9,
    type: 'expense',
    category: 'Lazer',
    categoryIcon: '🎬',
    categoryColor: '#FF0055',
    frequency: 'monthly',
    dayOfMonth: 10,
    cardName: 'Nubank Ultravioleta',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-10',
    nextDueDate: '2026-10-10',
  },
  {
    id: 'rec_seed_3',
    userId: 'user_marcelo',
    description: 'Spotify Premium Duo',
    amount: 34.9,
    type: 'expense',
    category: 'Lazer',
    categoryIcon: '🎵',
    categoryColor: '#39FF14',
    frequency: 'monthly',
    dayOfMonth: 15,
    cardName: 'Nubank Ultravioleta',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-15',
    nextDueDate: '2026-10-15',
  },
  {
    id: 'rec_seed_4',
    userId: 'user_zayra_partner',
    description: 'Salário & Dividendos',
    amount: 7400.0,
    type: 'income',
    category: 'Salário',
    categoryIcon: '💼',
    categoryColor: '#39FF14',
    frequency: 'monthly',
    dayOfMonth: 5,
    cardName: 'Inter',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-05',
    nextDueDate: '2026-10-05',
  },
  {
    id: 'rec_seed_5',
    userId: 'user_zayra_partner',
    description: 'Condomínio Residencial',
    amount: 890.0,
    type: 'expense',
    category: 'Moradia',
    categoryIcon: '🏠',
    categoryColor: '#0066FF',
    frequency: 'monthly',
    dayOfMonth: 1,
    cardName: 'Inter Black Mastercard',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-01',
    nextDueDate: '2026-10-01',
  },
  {
    id: 'rec_seed_6',
    userId: 'user_zayra_partner',
    description: 'Plano Saúde & Cuidados Zayra Pet',
    amount: 180.0,
    type: 'expense',
    category: 'Pet Shop',
    categoryIcon: '🐾',
    categoryColor: '#FF70A6',
    frequency: 'monthly',
    dayOfMonth: 20,
    cardName: 'Inter Black Mastercard',
    active: true,
    autoPost: true,
    createdAt: new Date().toISOString(),
    lastProcessedDate: '2026-09-20',
    nextDueDate: '2026-10-20',
  },
];

// ================= API ROUTES =================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    usersCount: usersStore.length,
    transactionsCount: transactionsStore.length,
  });
});

// Users
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(usersStore);
});

app.post('/api/users', (req: Request, res: Response) => {
  const user = req.body;
  if (!user || !user.id) {
    res.status(400).json({ error: 'User id is required' });
    return;
  }
  const existingIndex = usersStore.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    usersStore[existingIndex] = { ...usersStore[existingIndex], ...user };
  } else {
    usersStore.push(user);
  }
  res.json(user);
});

// Transactions
app.get('/api/transactions', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (userId && typeof userId === 'string') {
    const filtered = transactionsStore.filter((t) => t.userId === userId);
    res.json(filtered);
    return;
  }
  res.json(transactionsStore);
});

app.post('/api/transactions', (req: Request, res: Response) => {
  const tx = req.body;
  if (!tx || !tx.id || !tx.userId) {
    res.status(400).json({ error: 'Invalid transaction payload' });
    return;
  }
  // Upsert
  const existingIdx = transactionsStore.findIndex((t) => t.id === tx.id);
  if (existingIdx >= 0) {
    transactionsStore[existingIdx] = tx;
  } else {
    transactionsStore.unshift(tx);
  }
  res.json(tx);
});

app.delete('/api/transactions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  transactionsStore = transactionsStore.filter((t) => t.id !== id);
  res.json({ success: true, id });
});

// Batch Offline Sync Endpoint for PWA IndexedDB queue
app.post('/api/transactions/sync', (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Expected items array' });
    return;
  }

  const results: Array<{ id: string; success: boolean }> = [];

  for (const item of items) {
    try {
      if (item.action === 'create_transaction' && item.payload) {
        const tx = item.payload;
        // Clean any temporary offline flags
        delete tx._isOfflinePending;
        const idx = transactionsStore.findIndex((t) => t.id === tx.id);
        if (idx >= 0) {
          transactionsStore[idx] = tx;
        } else {
          transactionsStore.unshift(tx);
        }
        results.push({ id: item.id, success: true });
      } else if (item.action === 'delete_transaction' && item.payload?.id) {
        transactionsStore = transactionsStore.filter((t) => t.id !== item.payload.id);
        results.push({ id: item.id, success: true });
      } else if (item.action === 'update_goal' && item.payload) {
        const goal = item.payload;
        const gIdx = goalsStore.findIndex((g) => g.id === goal.id);
        if (gIdx >= 0) {
          goalsStore[gIdx] = goal;
        } else {
          goalsStore.push(goal);
        }
        results.push({ id: item.id, success: true });
      } else if (item.action === 'save_recurring' && item.payload) {
        const rec = item.payload;
        const rIdx = recurringStore.findIndex((r) => r.id === rec.id);
        if (rIdx >= 0) {
          recurringStore[rIdx] = rec;
        } else {
          recurringStore.push(rec);
        }
        results.push({ id: item.id, success: true });
      } else if (item.action === 'delete_recurring' && item.payload?.id) {
        recurringStore = recurringStore.filter((r) => r.id !== item.payload.id);
        results.push({ id: item.id, success: true });
      } else {
        results.push({ id: item.id, success: true });
      }
    } catch (e) {
      results.push({ id: item.id, success: false });
    }
  }

  res.json({
    success: true,
    syncedCount: results.filter((r) => r.success).length,
    results,
  });
});

// Couple Invites Store
let coupleInvitesStore: Array<{
  id: string;
  inviterId: string;
  partnerEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}> = [
  {
    id: 'invite_seed_1',
    inviterId: 'user_marcelo',
    partnerEmail: 'gabi.duarte@email.com',
    status: 'accepted',
    createdAt: new Date().toISOString(),
  },
];

// Couple endpoints
app.post('/api/couple/invite', (req: Request, res: Response) => {
  const { inviterId, partnerEmail } = req.body;
  if (!inviterId || !partnerEmail) {
    res.status(400).json({ error: 'inviterId e partnerEmail são obrigatórios' });
    return;
  }

  const cleanEmail = partnerEmail.toLowerCase().trim();
  const existingUser = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);

  let invite = coupleInvitesStore.find(
    (i) => i.inviterId === inviterId && i.partnerEmail.toLowerCase() === cleanEmail
  );

  if (existingUser) {
    if (!invite) {
      invite = {
        id: `invite_${Date.now()}`,
        inviterId,
        partnerEmail: cleanEmail,
        status: 'accepted',
        createdAt: new Date().toISOString(),
      };
      coupleInvitesStore.push(invite);
    } else {
      invite.status = 'accepted';
    }

    res.json({
      success: true,
      status: 'connected',
      partner: existingUser,
      message: `Conta de ${existingUser.name} vinculada com sucesso ao seu casal!`,
    });
    return;
  }

  // Create pending invitation
  const newInvite = {
    id: `invite_${Date.now()}`,
    inviterId,
    partnerEmail: cleanEmail,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  coupleInvitesStore.push(newInvite);

  res.json({
    success: true,
    status: 'pending',
    inviteId: newInvite.id,
    partnerEmail: cleanEmail,
    inviteLink: `${req.protocol}://${req.get('host')}/#register?coupleInvite=${newInvite.id}&inviter=${inviterId}`,
    message: `Convite de casal registrado para ${cleanEmail}. Link de convite pronto para envio!`,
  });
});

app.post('/api/couple/unlink', (req: Request, res: Response) => {
  const { inviterId } = req.body;
  coupleInvitesStore = coupleInvitesStore.filter((i) => i.inviterId !== inviterId);
  res.json({ success: true, message: 'Casal desvinculado com sucesso' });
});

app.get('/api/couple/status', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId obrigatório' });
    return;
  }
  const invite = coupleInvitesStore.find((i) => i.inviterId === userId);
  res.json({ invite });
});

// Goals
app.get('/api/goals', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (userId && typeof userId === 'string') {
    const filtered = goalsStore.filter((g) => g.userId === userId);
    res.json(filtered);
    return;
  }
  res.json(goalsStore);
});

app.post('/api/goals', (req: Request, res: Response) => {
  const goal = req.body;
  if (!goal || !goal.id) {
    res.status(400).json({ error: 'Invalid goal payload' });
    return;
  }
  const idx = goalsStore.findIndex((g) => g.id === goal.id);
  if (idx >= 0) {
    goalsStore[idx] = goal;
  } else {
    goalsStore.push(goal);
  }
  res.json(goal);
});

// Recurring Transactions Endpoints
app.get('/api/recurring', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (userId && typeof userId === 'string') {
    const filtered = recurringStore.filter((r) => r.userId === userId);
    res.json(filtered);
    return;
  }
  res.json(recurringStore);
});

app.post('/api/recurring', (req: Request, res: Response) => {
  const item = req.body;
  if (!item || !item.id || !item.userId || !item.description) {
    res.status(400).json({ error: 'Payload de transação recorrente inválido' });
    return;
  }
  const idx = recurringStore.findIndex((r) => r.id === item.id);
  if (idx >= 0) {
    recurringStore[idx] = item;
  } else {
    recurringStore.push(item);
  }
  res.json(item);
});

app.delete('/api/recurring/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  recurringStore = recurringStore.filter((r) => r.id !== id);
  res.json({ success: true, id });
});

// Process due recurring transactions (generating transactions if due)
app.post('/api/recurring/process', (_req: Request, res: Response) => {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const generated: any[] = [];

  for (const item of recurringStore) {
    if (!item.active || !item.autoPost) continue;

    // Check if already processed this month
    const lastProcessedMonth = item.lastProcessedDate?.substring(0, 7);
    if (lastProcessedMonth !== currentMonthYear) {
      // Create new transaction
      const newTx = {
        id: `tx_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: item.userId,
        description: `${item.description} (Recorrente)`,
        amount: item.amount,
        type: item.type,
        category: item.category,
        categoryIcon: item.categoryIcon,
        categoryColor: item.categoryColor,
        date: `Dia ${item.dayOfMonth} (${now.toLocaleDateString('pt-BR', { month: 'short' })})`,
        cardName: item.cardName,
        note: `Lançamento mensal automático • ${item.frequency}`,
        isRecurring: true,
        recurringId: item.id,
      };

      transactionsStore.unshift(newTx);
      generated.push(newTx);

      item.lastProcessedDate = now.toISOString().split('T')[0];
      // compute next due date
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, item.dayOfMonth);
      item.nextDueDate = nextMonth.toISOString().split('T')[0];
    }
  }

  res.json({
    success: true,
    generatedCount: generated.length,
    newTransactions: generated,
  });
});

// ================= FRONTEND / VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev: mount Vite middlewares inside Express, disabling HMR overlay to prevent [vite] connection errors in iframe
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zayra's Finances Express Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
