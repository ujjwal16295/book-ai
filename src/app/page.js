"use client"
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [bookTitle, setBookTitle] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_BOOK; // Replace with your Google Books API key

  // Handle clicking outside suggestions to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch book suggestions from Google Books API
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (bookTitle.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(bookTitle)}&key=${encodeURIComponent(apiKey)}`
        );
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const bookSuggestions = data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || '/book.png'
          }));
          setSuggestions(bookSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching book suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(() => {
      if (bookTitle.trim()) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [bookTitle]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (bookTitle.trim()) {
      navigateToSummary(bookTitle);
    }
  };

  const navigateToSummary = (title) => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      window.location.href = `/summary?title=${encodeURIComponent(title)}`;
    }, 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    setBookTitle(suggestion.title);
    setShowSuggestions(false);
    navigateToSummary(suggestion.title);
  };

  const handleInputChange = (e) => {
    setBookTitle(e.target.value);
    // Only show suggestions if user is actively typing something new
    if (e.target.value.trim().length >= 3) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    // Only show suggestions on focus if there's content and suggestions available
    if (bookTitle.trim().length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
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
              src="/book.png" 
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
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Discover the essence of any book</h2>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative">
              <div className="flex-grow relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter a book title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-700"
                  value={bookTitle}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  required
                />
                {isLoading && (
                  <div className="absolute right-3 top-3">
                    <span className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}
                
                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                  >
                    {suggestions.map((suggestion) => (
                      <div 
                        key={suggestion.id}
                        className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="relative h-12 w-8 flex-shrink-0 mr-3">
                          <Image
                            src={suggestion.thumbnail}
                            alt={suggestion.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-gray-800">{suggestion.title}</p>
                          <p className="text-sm text-gray-600">{suggestion.authors}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No suggestions found message */}
                {showSuggestions && bookTitle.trim().length >= 3 && suggestions.length === 0 && !isLoading && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                  >
                    <p className="text-gray-600">No books found with that title. Please enter the full book name.</p>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center md:w-auto"
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
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-700">Why BookBrief?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-700">Quick Insights</h3>
              <p className="text-gray-600">Get the core message of any book in just 100 words. Save time without missing the essence.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-700">AI-Powered</h3>
              <p className="text-gray-600">Our advanced AI technology distills books into precise, meaningful summaries with remarkable accuracy.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-700">Vast Library</h3>
              <p className="text-gray-600">Access summaries from thousands of books across all genres, from classics to the latest bestsellers.</p>
            </div>
          </div>
        </section>

       {/* Popular Books Section */}
<section className="mb-16">
  <h2 className="text-2xl font-bold text-center mb-8 text-gray-700">Popular Summaries</h2>
  <div className="grid md:grid-cols-4 gap-6">
    {[
      { title: "Atomic Habits", author: "James Clear", cover: "/atomic.png" },
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", cover: "/thinking.png" },
      { title: "Sapiens", author: "Yuval Noah Harari", cover: "/sapiens.png" },
      { title: "The Psychology of Money", author: "Morgan Housel", cover: "/money.png" }
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
          <h3 className="font-semibold text-lg text-gray-700">{book.title}</h3>
          <p className="text-gray-600 text-sm">{book.author}</p>
          <button 
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => {
              window.location.href = `/summary?title=${encodeURIComponent(book.title)}`;
            }}
          >
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
  <button 
    className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg transition-colors duration-200"
    onClick={() => {
      const searchSection = document.querySelector('.max-w-2xl.mx-auto.mb-16');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' });
        // Optional: Focus on the input field after scrolling
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]');
          if (searchInput) searchInput.focus();
        }, 800); // Small delay to ensure scroll completes first
      }
    }}
  >
    Try BookBrief Now
  </button>
</section>
      </main>

  
    </div>
  );
}