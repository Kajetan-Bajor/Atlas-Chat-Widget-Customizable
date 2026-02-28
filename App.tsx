import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'}`}>
      
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-6 right-6 p-3 rounded-full shadow-lg transition-all ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>

      <div className="max-w-2xl text-center space-y-6">
        <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Przykładowa Strona
        </h1>
        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          To jest wersja demonstracyjna Twojego widgetu. 
          Kliknij czarną ikonę w prawym dolnym rogu, aby otworzyć chat.
        </p>
        <div className={`text-sm p-4 rounded-lg shadow-sm border inline-block text-left ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200'}`}>
            <strong className={darkMode ? 'text-white' : 'text-gray-900'}>Instrukcja edycji:</strong><br/>
            1. Otwórz plik <code className={`px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>constants.ts</code><br/>
            2. Wklej swój webhook n8n w pole <code className={`px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>webhookUrl</code><br/>
            3. Zmień nazwy, kolory i logo w sekcji <code className={`px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>CONFIG</code>
        </div>
      </div>

      {/* The Widget Component */}
      <ChatWidget />
      
    </div>
  );
}

export default App;