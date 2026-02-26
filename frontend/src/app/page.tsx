'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button, Card } from '@/components/ui';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'counselor') {
        router.push('/counselor');
      } else {
        router.push('/client');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Consultancy MS</h1>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold text-white mb-6">
            Your Journey to<br />
            <span className="text-yellow-300">International Education</span><br />
            Starts Here
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Track applications, manage documents, book appointments, and get AI-powered guidance - all in one place.
          </p>
          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                Start Free Today
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="bg-white/10 backdrop-blur border-0 text-white">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Track Applications</h3>
            <p className="text-blue-100">Real-time updates on your visa and admission status</p>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-0 text-white">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Book Consultations</h3>
            <p className="text-blue-100">Schedule online or offline meetings with counselors</p>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-0 text-white">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-blue-100">Get instant answers to your study abroad questions</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
