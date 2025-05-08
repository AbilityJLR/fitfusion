import DbTest from '../db-test';

export const metadata = {
  title: 'Database Connection Test',
  description: 'Test connection to PostgreSQL database',
};

export default function DbTestPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-center">Database Connection Test</h1>
        <DbTest />
      </div>
    </main>
  );
} 