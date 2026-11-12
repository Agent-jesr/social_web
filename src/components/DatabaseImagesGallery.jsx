import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, RefreshCw, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_BASE_URL } from './config'; 

export default function DatabaseImagesGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6; 

  const fetchImages = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/images?page=${page}&limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('فشل جلب الصور:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(currentPage);
  }, [currentPage]);

  return (
    <div dir="rtl" className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-indigo-400" />
          معرض الصور والمنشورات
        </h2>
        <button 
          onClick={() => fetchImages(currentPage)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> تحديث القائمة
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">جاري تحميل البيانات من قاعدة البيانات...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-slate-500">لا توجد سجلات مخزنة في قاعدة البيانات حالياً.</div>
      ) : (
        <>
          {/* شبكة عرض الصور */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                
                {/* صورة المعاينة */}
                <div className="w-full h-52 bg-slate-950 relative overflow-hidden border-b border-slate-800 flex items-center justify-center p-2">
                  <img 
                    src={item.url || item.imageBase64} 
                    alt={item.title} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow ${
                    item.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.status === 'published' ? 'تم النشر' : 'قيد الانتظار'}
                  </span>
                </div>

                {/* تفاصيل المنشور */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.prompt || 'لا يوجد وصف مضاف...'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>وقت الجدولة: {item.publishAt ? new Date(item.publishAt).toLocaleString('ar-EG') : 'فورى'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a 
                      href={item.url || item.imageBase64} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-medium transition"
                    >
                      عرض الصورة الكاملة ↗
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* أزرار الـ Pagination في الأسفل */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" /> الصفحة السابقة
            </button>

            <span className="text-xs text-slate-400">
              صفحة <span className="text-indigo-400 font-bold">{currentPage}</span> من <span className="font-bold">{totalPages || 1}</span>
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium disabled:opacity-40 transition cursor-pointer"
            >
              الصفحة التالية <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}