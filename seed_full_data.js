const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding rich local data for Siam...');
    const email = 'siamrahman7466@gmail.com';
    const password = process.env.DEFAULT_PASSWORD || 'siam12345';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword, name: 'Siam Rahman' },
        create: {
            id: 'default-user-id',
            email,
            name: 'Siam Rahman',
            password: hashedPassword,
        }
    });

    const userId = user.id;
    console.log('User active:', userId);

    // 1. Seed Habits
    const habitsData = [
        { name: 'Morning Code & AI Architecture', frequency: 'DAILY', color: '#8b5cf6', description: 'Review models, test Hermes agent tools' },
        { name: 'Gym & Fitness Routine', frequency: 'DAILY', color: '#10b981', description: '1 hour strength & cardio workout' },
        { name: 'Study Sales & Business Literature', frequency: 'DAILY', color: '#3b82f6', description: 'Continuous learning on negotiation & strategy' },
        { name: 'Client Outreach & Lead Hunting', frequency: 'DAILY', color: '#f59e0b', description: 'Scrape, verify, and draft contractor DMs' },
        { name: 'Deep Focus Block (2 Hours)', frequency: 'DAILY', color: '#ec4899', description: 'Zero distractions flow state execution' }
    ];

    const today = new Date();
    for (const h of habitsData) {
        let habit = await prisma.habit.findFirst({
            where: { userId, name: h.name }
        });

        if (!habit) {
            habit = await prisma.habit.create({
                data: {
                    userId,
                    name: h.name,
                    frequency: h.frequency,
                    color: h.color,
                    description: h.description
                }
            });
        }

        // Add logs for last 7 days
        for (let i = 0; i < 7; i++) {
            const logDate = new Date();
            logDate.setDate(today.getDate() - i);
            logDate.setHours(12, 0, 0, 0);

            const existingLog = await prisma.habitLog.findFirst({
                where: { habitId: habit.id, date: logDate }
            });

            if (!existingLog) {
                await prisma.habitLog.create({
                    data: {
                        habitId: habit.id,
                        date: logDate,
                        completed: i !== 1 && i !== 4, // 80% completion consistency
                        score: 100
                    }
                });
            }
        }
    }
    console.log('Habits seeded successfully!');

    // 2. Seed Tasks
    const tasks = [
        { title: 'Overhaul Siam Management Dashboard', description: 'Local PostgreSQL setup, Hermes agent sync, fast animations', status: 'DONE', priority: 'HIGH', tags: ['System', 'Hermes', 'Next.js'] },
        { title: 'ShopReg Flutter POS App Mobile Build', description: 'Production APK tested with SQLite and barcode scanning', status: 'IN_PROGRESS', priority: 'HIGH', tags: ['ShopReg', 'Flutter', 'POS'] },
        { title: 'Scale Silent Social Reactivation ($200/mo)', description: 'Target 27 high-ticket kitchen & remodeling contractors in Texas', status: 'IN_PROGRESS', priority: 'MEDIUM', tags: ['Agency', 'Sales', 'Clients'] },
        { title: 'Luminar Weddings Production cPanel Deploy', description: 'Live verified on luminarweddings.com with zero dynamic file overwrite', status: 'DONE', priority: 'HIGH', tags: ['Luminar', 'cPanel', 'Production'] },
        { title: 'Setup Auto Task Sync with Hermes Telegram Bot', description: 'Bidirectional sync so Hermes fetches and updates web management tasks', status: 'IN_PROGRESS', priority: 'HIGH', tags: ['Hermes', 'Integration', 'API'] },
        { title: 'Review TourMate Live Sync with MP & Tour Members', description: 'Sajek 2026 expense persistence and live Firestore tracker', status: 'PENDING', priority: 'LOW', tags: ['TourMate', 'Fintech'] }
    ];

    for (const t of tasks) {
        const existing = await prisma.task.findFirst({
            where: { userId, title: t.title }
        });
        if (!existing) {
            await prisma.task.create({
                data: {
                    userId,
                    title: t.title,
                    description: t.description,
                    status: t.status,
                    priority: t.priority,
                    tags: t.tags
                }
            });
        }
    }
    console.log('Tasks seeded successfully!');

    // 3. Seed Financial Data
    const finances = [
        { type: 'income', amount: 45000, category: 'Web Development Retainer', date: new Date(today.getTime() - 2 * 86400000) },
        { type: 'income', amount: 35000, category: 'AI Agent Architecture & Setup', date: new Date(today.getTime() - 5 * 86400000) },
        { type: 'expense', amount: 4500, category: 'Hardware (512GB TEAM SSD)', date: new Date(today.getTime() - 1 * 86400000), description: 'C: Drive Upgrade' },
        { type: 'expense', amount: 2500, category: 'High-Speed Broadband & Cloud', date: new Date(today.getTime() - 4 * 86400000), description: 'Monthly Internet' },
        { type: 'saving', amount: 25000, category: 'Agency Reserve Fund', date: new Date(today.getTime() - 3 * 86400000), description: 'Wise/Payoneer Reserve' }
    ];

    for (const f of finances) {
        if (f.type === 'income') {
            const ex = await prisma.income.findFirst({ where: { userId, source: f.category } });
            if (!ex) await prisma.income.create({ data: { userId, amount: f.amount, source: f.category, date: f.date } });
        } else if (f.type === 'expense') {
            const ex = await prisma.expense.findFirst({ where: { userId, description: f.description } });
            if (!ex) await prisma.expense.create({ data: { userId, amount: f.amount, category: f.category, description: f.description, date: f.date } });
        } else if (f.type === 'saving') {
            const ex = await prisma.saving.findFirst({ where: { userId, purpose: f.category } });
            if (!ex) await prisma.saving.create({ data: { userId, amount: f.amount, purpose: f.category, date: f.date } });
        }
    }
    console.log('Finances seeded successfully!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
