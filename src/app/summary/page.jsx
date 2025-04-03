"use client"
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Link from 'next/link';

// Create a wrapper component that uses search params
function SummaryContent() {
  const searchParams = useSearchParams();
  const bookTitle = searchParams.get('title') || '';
  
  const [bookData, setBookData] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Check for speech synthesis support and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
      
      // Function to handle when voices are available
      const handleVoicesChanged = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoicesLoaded(true);
          console.log('Voices loaded:', availableVoices);
        }
      };
      
      // Add event listener for voices changed
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Initial check in case voices are already loaded
      handleVoicesChanged();
      
      // Cleanup
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Fetch book details from Google Books API
  useEffect(() => {
    async function fetchBookDetails() {
      if (!bookTitle) {
        setError('No book title provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}&maxResults=1`
        );
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const book = data.items[0].volumeInfo;
          setBookData({
            title: book.title,
            authors: book.authors ? book.authors.join(', ') : 'Unknown Author',
            description: book.description || 'No description available',
            pageCount: book.pageCount || 'Unknown',
            publishedDate: book.publishedDate || 'Unknown',
            categories: book.categories ? book.categories.join(', ') : 'Unknown',
            thumbnail: book.imageLinks?.thumbnail || '/book.png',
            averageRating: book.averageRating || null,
            ratingsCount: book.ratingsCount || 0
          });
          setLoading(false);
          // Automatically generate summary when book data is loaded
          generateSummary(book.title, book.authors ? book.authors.join(', ') : 'Unknown Author');
        } else {
          setError('Book not found');
          setLoading(false);
        }
      } catch (err) {
        setError('Error fetching book details');
        setLoading(false);
      }
    }

    fetchBookDetails();
  }, [bookTitle]);

  async function generateSummary(title, author) {
    setGenerating(true);
    try {
      // Get API key from environment variables
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      // Initialize the API client
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Create the prompt
      const prompt = `Generate a concise 100-word summary of the book "${title}" by ${author}.
        Focus on the main themes, key insights, and core message.
        Make the summary informative yet engaging, capturing the essence of the book.
        Limit the summary to exactly 100 words.`;
      
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        setSummary(text);
      } else {
        setSummary("We couldn't generate a summary for this book. Please try another book.");
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummary("There was an error generating the summary. Please try again later.");
    } finally {
      setGenerating(false);
    }
  }

  // Text-to-speech function
   function  speakSummary() {
    if (!speechSupported || !summary || !voicesLoaded) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(summary);
    
    // Set voice and properties if needed
    utterance.rate = 1.0;  // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    // console.log(voices)

    if (voices.length > 0) {
      // Try to find a good English voice - can customize this
      const englishVoice =  voices.find(voice => voice.name.includes('Martha'));
      if (englishVoice) {
        console.log(englishVoice)
        utterance.voice = englishVoice;
      }
    }
    
    // Handle speech events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }

  // Function to stop speaking
  function stopSpeaking() {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  // Clean up speech on component unmount
  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  // Function to generate star rating display
  const renderStarRating = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    
    return (
      <div className="flex items-center">
        <div className="flex mr-1">{stars}</div>
        <span className="text-sm text-gray-600">({bookData.ratingsCount})</span>
      </div>
    );
  };

  // Sample theme colors
  const themeColors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
  ];

  // Get random theme color
  const getRandomThemeColor = () => {
    return themeColors[Math.floor(Math.random() * themeColors.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center mb-8 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Search
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading book details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-red-800 mb-2">{error}</h2>
            <p className="text-red-600 mb-6">Please try searching for a different book.</p>
            <Link 
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        ) : bookData ? (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Book header with background blur */}
            <div className="relative bg-gray-900 text-white p-8">
              <div className="absolute inset-0 opacity-20 overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
                <Image 
                  src={bookData.thumbnail}
                  alt={bookData.title}
                  layout="fill"
                  objectFit="cover"
                  className="opacity-50"
                />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row">
                <div className="md:w-1/4 flex justify-center md:justify-start mb-6 md:mb-0">
                  <div className="relative h-64 w-48 rounded-lg overflow-hidden shadow-lg border-4 border-white">
                    <Image 
                      src={bookData.thumbnail}
                      alt={bookData.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
                <div className="md:w-3/4 md:pl-8">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{bookData.title}</h1>
                  <p className="text-xl text-gray-300 mb-4">by {bookData.authors}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bookData.categories.split(',').map((category, index) => (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${getRandomThemeColor()}`}>
                        {category.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {bookData.averageRating && (
                      <div>
                        <p className="text-gray-400">Rating</p>
                        {renderStarRating(bookData.averageRating)}
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400">Published</p>
                      <p className="font-medium">{bookData.publishedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Pages</p>
                      <p className="font-medium">{bookData.pageCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book summary section with TTS button */}
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  100-Word Summary
                </h2>

                {generating ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <p className="text-gray-600">Generating your concise book summary...</p>
                  </div>
                ) : summary ? (
                  <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-gray-800 text-lg leading-relaxed">{summary}</p>
                      {speechSupported && (
                        <button
                          onClick={isSpeaking ? stopSpeaking : speakSummary}
                          className={`flex items-center justify-center ml-4 p-2 rounded-full ${
                            isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                          } text-white transition-colors flex-shrink-0 ${!voicesLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isSpeaking ? 'Stop speaking' : 'Listen to summary'}
                          disabled={!voicesLoaded}
                        >
                          {isSpeaking ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Summary generated by AI. May contain inaccuracies.
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">Unable to generate summary. Please try again.</p>
                    <button
                      onClick={() => generateSummary(bookData.title, bookData.authors)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Book description */}
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">About the Book</h2>
                  <div className="prose max-w-none text-gray-700">
                    <p>{bookData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Popular Books Section */}
        <section className="mt-12">
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
      </div>
    </div>
  );
}

// Loading fallback component
function SummaryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading book summary...</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Summary() {
  return (
    <Suspense fallback={<SummaryLoading />}>
      <SummaryContent />
    </Suspense>
  );
}