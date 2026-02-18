
import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  History, 
  Image as ImageIcon,
  Send,
  Wand2,
  RefreshCcw,
  Camera
} from 'lucide-react';
import { Button } from './components/Button';
import { geminiService } from './services/geminiService';
import { MemeImage, AppStatus } from './types';

const SUGGESTED_PROMPTS = [
  "Add a retro 90s filter",
  "Replace the background with a futuristic city",
  "Make this look like a painting",
  "Add dramatic movie lighting",
  "Remove the background",
  "Turn characters into zombies",
  "Add a cinematic motion blur",
  "Add explosions in the background",
];

const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<MemeImage[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(AppStatus.UPLOADING);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setCurrentImage(b64);
      setEditedImage(null);
      setStatus(AppStatus.IDLE);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentImage || !prompt.trim()) return;

    setStatus(AppStatus.GENERATING);
    setErrorMessage(null);

    try {
      const result = await geminiService.editImage(currentImage, prompt);
      if (result) {
        setEditedImage(result);
        const newMeme: MemeImage = {
          id: Date.now().toString(),
          url: result,
          originalUrl: currentImage,
          prompt: prompt,
          timestamp: Date.now()
        };
        setHistory(prev => [newMeme, ...prev]);
        setStatus(AppStatus.IDLE);
      } else {
        throw new Error("Failed to generate image. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong during generation.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setCurrentImage(null);
    setEditedImage(null);
    setPrompt('');
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `meme-${Date.now()}.png`;
    link.click();
  };

  const selectFromHistory = (meme: MemeImage) => {
    setEditedImage(meme.url);
    setCurrentImage(meme.originalUrl || meme.url);
    setPrompt(meme.prompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 pb-10">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              MemeGenius Lab
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-indigo-400" /> Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Editing Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Image Stage */}
            <div className="relative aspect-video bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700 overflow-hidden group flex flex-col items-center justify-center">
              {status === AppStatus.GENERATING && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Nano Banana is Cooking...</h3>
                    <p className="text-sm text-slate-400 mt-1">Applying filters, removing backgrounds, and adding the magic sauce.</p>
                  </div>
                </div>
              )}

              {editedImage || currentImage ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={editedImage || currentImage || ''} 
                    alt="Current work" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="secondary" size="sm" className="bg-slate-900/80 backdrop-blur p-2" onClick={handleReset}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {!editedImage && (
                    <div className="absolute bottom-4 left-4 bg-indigo-600/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Original
                    </div>
                  )}
                  {editedImage && (
                    <div className="absolute bottom-4 left-4 bg-emerald-600/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Gemini Edited
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300">Upload your movie frame</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                    Select a screen capture from a movie or TV show to start memeing.
                  </p>
                  <Button 
                    className="mt-6" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
            </div>

            {/* Controls */}
            <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 shadow-xl space-y-4">
              <form onSubmit={handleGenerate} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold">What should we change?</h3>
                </div>
                
                <textarea
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none min-h-[100px] resize-none"
                  placeholder="e.g. 'Add a retro 80s movie filter and remove the people in the background'..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!currentImage || status === AppStatus.GENERATING}
                />
                
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={!currentImage || !prompt.trim() || status === AppStatus.GENERATING}
                      className="px-8"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Magic
                    </Button>
                    
                    {editedImage && (
                      <Button variant="secondary" onClick={handleDownload}>
                        <Download className="w-4 h-4" /> Save
                      </Button>
                    )}
                  </div>

                  <Button variant="ghost" type="button" onClick={() => setPrompt('')} disabled={!prompt}>
                    Clear prompt
                  </Button>
                </div>
              </form>

              {/* Suggestions */}
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(p)}
                      disabled={!currentImage || status === AppStatus.GENERATING}
                      className="text-xs bg-slate-700/50 hover:bg-indigo-500/20 hover:text-indigo-300 border border-slate-600/50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-30"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Sidebar / History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" /> Recent Lab Runs
                </h3>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-700">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm">Your generation history will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((meme) => (
                    <button
                      key={meme.id}
                      onClick={() => selectFromHistory(meme)}
                      className="group relative aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all"
                    >
                      <img src={meme.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <p className="text-[10px] text-white font-medium text-center line-clamp-2">
                          {meme.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {history.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-6 text-xs"
                  onClick={() => setHistory([])}
                >
                  Clear History
                </Button>
              )}
            </div>

            {/* Pro Tip */}
            <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-6">
              <h4 className="font-bold text-indigo-300 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> Pro Tip
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                For the best movie memes, try prompts like: <br/>
                <span className="text-white italic mt-1 block">"Make it look like a blockbuster movie poster"</span>
                <span className="text-white italic mt-1 block">"Add subtitles that say: [Your Joke Here]"</span>
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MemeGenius. Powered by Nano Banana Image Intelligence.</p>
      </footer>

      {/* Persistent Floating Action (Mobile only) */}
      <div className="lg:hidden fixed bottom-6 right-6 flex flex-col gap-3">
        {currentImage && (
          <Button 
            className="w-14 h-14 rounded-full shadow-2xl p-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <RefreshCcw className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default App;
