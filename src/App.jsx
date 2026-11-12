import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  RefreshCw,
  CheckCircle2,
  Download,
  Clock,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { API_BASE_URL } from './config';
import DatabaseImagesGallery from './components/DatabaseImagesGallery';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [caption, setCaption] = useState('');
  const [notification, setNotification] = useState('');

  const [isScheduled, setIsScheduled] = useState(false);
  const [publishAt, setPublishAt] = useState('');
  const [previewPlatform, setPreviewPlatform] = useState('facebook');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const getLocalImageUrl = (url, base64) => {
    if (url) {
      const uploadIndex = url.indexOf('/uploads/');
      if (uploadIndex !== -1) {
        return `${API_BASE_URL}${url.substring(uploadIndex)}`;
      }
      return url;
    }
    return base64;
  };

  const handleDownloadImage = async () => {
    if (!generatedImage) return;
    try {
      showNotification('جاري تحميل الصورة...');
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showNotification('تم تحميل الصورة بنجاح!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      showNotification('الرجاء إدخال وصف الصورة أولاً!');
      return;
    }

    try {
      setIsGenerating(true);
      showNotification('جاري توليد الصورة مع دمج الشعار...');

      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio })
      });

      const data = await response.json();

      if (response.ok && (data.imageUrl || data.success || data.imageBase64)) {
        let base64Source = data.imageBase64;
        if (base64Source && !base64Source.startsWith('data:image')) {
          base64Source = `data:image/png;base64,${base64Source}`;
        }
        setOriginalImageUrl(data.imageUrl || null);
        setGeneratedImage(getLocalImageUrl(data.imageUrl, base64Source));
        setImageBase64(data.imageBase64 || null);
        setCaption(data.caption || `✨ تصميم احترافي مع الشعار: ${prompt}`);
        showNotification('تم توليد وتعديل الصورة بنجاح!');
      } else {
        showNotification(data.error || 'حدث خطأ أثناء التوليد.');
      }
    } catch (err) {
      console.error(err);
      showNotification('تعذر الاتصال بـ Backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishOrSchedule = async () => {
    if (!caption.trim()) {
      showNotification('يرجى إدخال نص الكابشن أو توليده أولاً!');
      return;
    }

    if (isScheduled && !publishAt) {
      showNotification('يرجى تحديد تاريخ ووقت الجدولة!');
      return;
    }

    try {
      setIsPublishing(true);
      const endpoint = isScheduled ? `${API_BASE_URL}/api/schedule-image` : `${API_BASE_URL}/api/publish-all`;

      const payload = {
        title: prompt || 'منشور جديد',
        message: caption,
        caption: caption,
        imageUrl: originalImageUrl || generatedImage,
        imageBase64: imageBase64,
        ...(isScheduled && { publishAt })
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok || data.success || data.status === 'completed') {
        showNotification(isScheduled ? 'تمت جدولة المنشور بنجاح!' : 'تم نشر الرسالة بنجاح!');
      } else {
        showNotification(data.error || 'فشل في إتمام العملية.');
      }
    } catch (err) {
      console.error(err);
      showNotification('تعذر الاتصال بالسيرفر.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {notification && (
        <div className="fixed bottom-5 left-5 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-lg font-bold">توليد ونشر محتوى بالذكاء الاصطناعي مع دمج الشعار</h2>
        
        <div className="flex items-center gap-3">
          {currentView === 'home' ? (
            <button
              onClick={() => setCurrentView('gallery')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition shadow-lg shadow-indigo-600/20"
            >
              <Layers className="w-4 h-4" /> عرض معرض الصور والمنشورات السابقة
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> العودة لصفحة التوليد والنشر
            </button>
          )}

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            متصل
          </span>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full flex-1">
        {currentView === 'home' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                توليد وتعديل الصورة بالشعار التلقائي
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">صف الصورة والفكرة التي تريدها:</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="مثال: إعلان تسويقي لشركة تقنية..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">أبعاد الصورة:</label>
                <div className="grid grid-cols-3 gap-3">
                  {['1:1', '16:9', '9:16'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAspectRatio(val)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                        aspectRatio === val ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'جاري التوليد والدمج...' : 'توليد الصورة ودمج الشعار'}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">معاينة المنشور</h3>
                    {generatedImage && (
                      <button
                        onClick={handleDownloadImage}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition"
                      >
                        <Download className="w-3.5 h-3.5" /> تحميل
                      </button>
                    )}
                  </div>

                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPreviewPlatform('facebook')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        previewPlatform === 'facebook' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
                      }`}
                    >
                      فيسبوك
                    </button>
                    <button
                      onClick={() => setPreviewPlatform('telegram')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        previewPlatform === 'telegram' ? 'bg-sky-500 text-white shadow' : 'text-slate-400'
                      }`}
                    >
                      تيليجرام
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner overflow-hidden">
                  <div className="w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center relative p-2 min-h-[200px]">
                    {isGenerating ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                    ) : generatedImage ? (
                      <img src={generatedImage} alt="Post Preview" className="w-full h-auto max-h-[300px] object-contain rounded-md" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">النص الترويجي (الكابشن):</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="اكتب أو عدل النص هنا..."
                    className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none text-sm"
                  />
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      تفعيل جدولة المنشور؟
                    </label>
                    <input 
                      type="checkbox" 
                      checked={isScheduled} 
                      onChange={(e) => setIsScheduled(e.target.checked)} 
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  {isScheduled && (
                    <div className="pt-2 border-t border-slate-900">
                      <input
                        type="datetime-local"
                        value={publishAt}
                        onChange={(e) => setPublishAt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={handlePublishOrSchedule}
                  disabled={!caption.trim() || isPublishing || isGenerating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20"
                >
                  {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isPublishing ? 'جاري المعالجة...' : isScheduled ? 'جدولة المنشور' : 'نشر فوري'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <DatabaseImagesGallery />
        )}
      </main>
    </div>
  );
}
