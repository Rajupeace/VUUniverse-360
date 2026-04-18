const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb+srv://bobbyteja4_db_user:4ZltK5qmHHCxuFt6@cluster0.im2uv.mongodb.net/fbn_xai_system?appName=Cluster0';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('fbn_xai_system');
        const feeCollection = db.collection('CollegeFees');

        const sids = ['231fa04A17', 'STU001']; // Add common demo SIDs

        for (const sid of sids) {
            console.log(`Seeding fee data for SID: ${sid}...`);
            await feeCollection.updateOne(
                { studentId: sid },
                { $set: {
                    studentId: sid,
                    totalFee: 156000,
                    paidAmount: 85000,
                    dueAmount: 71000,
                    academicYear: '2024-25',
                    semester: 'Odd',
                    transactions: [
                        { transactionId: 'TXN_' + Date.now().toString().slice(-6), amount: 50000, method: 'Net Banking', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                        { transactionId: 'TXN_' + (Date.now() + 1).toString().slice(-6), amount: 35000, method: 'UPI', date: new Date() }
                    ],
                    updatedAt: new Date()
                }},
                { upsert: true }
            );
        }

        console.log('✅ Fee database updated.');

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await client.close();
    }
}

run();
