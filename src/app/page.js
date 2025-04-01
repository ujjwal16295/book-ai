import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [bookTitle, setBookTitle] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (bookTitle.trim()) {
      setIsSearching(true);
      // In a real implementation, this would redirect to results or summary page
      setTimeout(() => {
        setIsSearching(false);
        window.location.href = `/summary?title=${encodeURIComponent(bookTitle)}`;
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Head>
        <title>BookBrief | 100-Word Book Summaries</title>
        <meta name="description" content="Get concise 100-word summaries of your favorite books" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center mb-12 pt-8">
          <div className="relative w-16 h-16 mb-4">
            <Image 
              src="/logo-placeholder.png" 
              alt="BookBrief Logo"
              layout="fill"
              className="rounded-full"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">BookBrief</h1>
          <p className="text-xl text-gray-600">Any book. 100 words. Infinite knowledge.</p>
        </header>

        {/* Search Section */}
        <section className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-center mb-6">Discover the essence of any book</h2>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter a book title..."
                className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : null}
                {isSearching ? 'Searching...' : 'Get Summary'}
              </button>
            </form>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why BookBrief?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick Insights</h3>
              <p className="text-gray-600">Get the core message of any book in just 100 words. Save time without missing the essence.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-gray-600">Our advanced AI technology distills books into precise, meaningful summaries with remarkable accuracy.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Vast Library</h3>
              <p className="text-gray-600">Access summaries from thousands of books across all genres, from classics to the latest bestsellers.</p>
            </div>
          </div>
        </section>

        {/* Popular Books Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Summaries</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Atomic Habits", author: "James Clear", cover: "/book1-placeholder.png" },
              { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", cover: "/book2-placeholder.png" },
              { title: "Sapiens", author: "Yuval Noah Harari", cover: "/book3-placeholder.png" },
              { title: "The Psychology of Money", author: "Morgan Housel", cover: "/book4-placeholder.png" }
            ].map((book, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="relative h-56 w-full bg-gray-200">
                  <Image 
                    src={book.cover}
                    alt={book.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{book.title}</h3>
                  <p className="text-gray-600 text-sm">{book.author}</p>
                  <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Read Summary →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white rounded-xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Start exploring books like never before</h2>
          <p className="mb-6 max-w-2xl mx-auto">Get to the heart of any book in just seconds. Expand your knowledge without the time investment.</p>
          <button className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg transition-colors duration-200">
            Try BookBrief Now
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">BookBrief</h2>
              <p className="text-gray-400">© 2025 BookBrief. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">About</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}