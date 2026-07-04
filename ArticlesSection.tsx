/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, Sparkles, Heart, Download, ExternalLink, Library } from "lucide-react";
import { Article, Book } from "../types";

export default function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, bookRes] = await Promise.all([
          fetch("/api/articles"),
          fetch("/api/books")
        ]);
        
        const artData = await artRes.json();
        const bookData = await bookRes.json();

        if (artData.success && artData.list && artData.list.length > 0) {
          setArticles(artData.list);
        } else {
          // Fallback static articles
          setArticles([
            {
              id: "art1",
              title: "أسس اختيار شريك الحياة في الإسلام والزواج الشرعي السعيد",
              image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop",
              content: "الزواج في الإسلام هو ميثاق غليظ يقوم على السكن والمودة والرحمة. واختيار شريك الحياة يعد الخطوة الأهم لبناء بيت مسلم مستقر ومستدام. يوصينا نبينا الكريم صلى الله عليه وسلم بالتركيز على الدين والخلق كمعيارين أساسيين: 'إذا جاءكم من ترضون دينه وخلقه فزوجوه'، والتركيز على ذات الدين للرجال: 'فاظفر بذات الدين تربت يداك'. يجب كذلك مراعاة التقارب الفكري والاجتماعي لتحقيق التفاهم المطلق وتجنب الخلافات المستمرة.",
              publishDate: "2026-06-25"
            },
            {
              id: "art2",
              title: "الخطبة الشرعية: الضوابط والأحكام الشرعية لتحقيق المودة",
              image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop",
              content: "تعتبر الخطبة وعداً بالزواج وليست زواجاً فعلياً، ومن ثم فإن للخاطب والمخطوبة حدوداً شرعية واضحة يجب مراعاتها لضمان بركة هذا الميثاق. يشرع الخروج في اللقاءات الشرعية بوجود المحرم، والتحدث في الأمور العامة التي تكشف ملامح الشخصية والأهداف من الزواج. يجب تجنب الخلوة أو تجاوز الحدود اللفظية أو المادية ليكون الزواج مباركاً ومحاطاً برضا الله سبحانه وتعالى.",
              publishDate: "2026-06-26"
            },
            {
              id: "art3",
              title: "سبيل المودة والرحمة وتجاوز عقبات السنة الأولى من الزواج",
              image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop",
              content: "السنة الأولى من الزواج هي مرحلة انتقالية هامة يجري فيها التوافق الفعلي واكتشاف الطباع اليومية للطرفين. يتطلب النجاح فيها قدراً كبيراً من التغاضي، والتفاهم، والصبر، ومبدأ الشورى داخل البيت. على الزوجين وضع مخافة الله أساساً لتعاملهما، وأن يدركا أن الاختلافات طبيعية ويمكن حلها بالحوار الهادئ دون إدخال الأطراف الخارجية إلا للضرورة القصوى.",
              publishDate: "2026-06-27"
            }
          ]);
        }

        if (bookData.success && bookData.list && bookData.list.length > 0) {
          setBooks(bookData.list);
        } else {
          // Fallback static books
          setBooks([
            {
              id: "book1",
              title: "تحفة العروس أو الزواج الإسلامي السعيد",
              coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop",
              description: "كتاب رائع وقيم يتناول أحكام الزواج في الإسلام، وآداب الزفاف، وكيفية التعامل بين الزوجين لبناء أسرة سعيدة قائمة على أسس متينة من الشرع المطهر.",
              downloadUrl: "https://archive.org/details/TohafAtAros"
            },
            {
              id: "book2",
              title: "الزواج الإسلامي السعيد: ضوابط وحقوق",
              coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&auto=format&fit=crop",
              description: "دراسة شرعية مبسطة وموثقة للحقوق والواجبات المتبادلة بين الزوجين، ونصائح عملية لتجاوز خلافات البيوت المعاصرة بهدي السلف الصالح.",
              downloadUrl: "https://archive.org/details/IslamicHappyMarriage"
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load articles/books", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <section id="articles" className="py-20 bg-stone-50 border-t border-bento-medium/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Headings */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-bento-medium/10 text-bento-primary border border-bento-medium/20 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            تثقيف وإرشاد أسري رسمي
          </div>
          <h2 className="text-3xl font-display font-black text-bento-primary sm:text-4xl tracking-tight">
            المكتبة الثقافية والإرشاد الأسري
          </h2>
          <p className="mt-4 text-bento-dark/80 text-lg leading-relaxed font-medium">
            نقدم لكم دليلاً غنياً بالمعارف والنصائح الشرعية والاجتماعية المعتمدة لمساعدتكم في بناء أسرة صالحة على كتاب الله وسنة رسوله.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-bento-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Articles List */}
            <div>
              <div className="flex items-center gap-3 mb-8 border-r-4 border-bento-primary pr-3">
                <BookOpen className="w-6 h-6 text-bento-primary" />
                <h3 className="text-2xl font-black text-bento-primary">أحدث المقالات والتوجيهات</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <div 
                    key={article.id} 
                    id={`article-card-${article.id}`}
                    className="bg-white rounded-3xl border border-bento-medium/20 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="h-48 w-full overflow-hidden relative">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-bento-primary/90 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        تثقيف شرعي
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-xs text-bento-medium mb-3 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          ٥ دقائق قراءة
                        </span>
                      </div>

                      <h4 className="font-display font-black text-base text-bento-dark mb-3 leading-snug">
                        {article.title}
                      </h4>

                      <p className="text-bento-dark/80 text-xs leading-relaxed flex-grow font-medium line-clamp-4">
                        {article.content}
                      </p>

                      <div className="border-t border-bento-medium/10 pt-4 mt-4">
                        <button 
                          onClick={() => {
                            alert(`العنوان: ${article.title}\n\n${article.content}`);
                          }}
                          className="text-xs font-bold text-bento-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          قراءة المقال بالكامل <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Books List (Newly Added Books Section) */}
            <div>
              <div className="flex items-center gap-3 mb-8 border-r-4 border-bento-primary pr-3">
                <Library className="w-6 h-6 text-bento-primary" />
                <h3 className="text-2xl font-black text-bento-primary">كتب ومؤلفات مفيدة للتحميل والقراءة</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {books.map((book) => (
                  <div 
                    key={book.id} 
                    id={`book-card-${book.id}`}
                    className="bg-white rounded-3xl border border-bento-medium/20 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6"
                  >
                    <div className="w-full sm:w-36 h-48 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200 shadow-sm relative">
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <span className="inline-block bg-bento-medium/10 text-bento-primary text-[10px] font-bold px-2.5 py-0.5 rounded-md mb-2">
                          إصدار قيم
                        </span>
                        <h4 className="font-display font-black text-base text-bento-dark mb-2 leading-snug">
                          {book.title}
                        </h4>
                        <p className="text-bento-dark/70 text-xs leading-relaxed font-medium line-clamp-3 mb-4">
                          {book.description}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <a 
                          href={book.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-bento-primary hover:bg-[#344227] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل الكتاب</span>
                        </a>
                        <button 
                          onClick={() => {
                            alert(`تفاصيل الكتاب: ${book.title}\n\nالوصف: ${book.description}\n\nرابط المصدر: ${book.downloadUrl}`);
                          }}
                          className="bg-bento-medium/10 hover:bg-bento-medium/20 text-bento-primary text-xs font-bold p-2.5 rounded-xl cursor-pointer transition-colors"
                          title="عرض تفاصيل ومعلومات الكتاب"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Marriage Quote / Core Message */}
        <div className="mt-20 bg-bento-primary rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center relative overflow-hidden border border-bento-medium/20">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-5">
            <Heart className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-bento-light font-extrabold text-xs tracking-wider uppercase mb-3">
              من هدي الوحيين لبيوت هادئة ومستقرة
            </p>
            <p className="font-display text-xl sm:text-2xl font-bold leading-relaxed italic">
              &ldquo;وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً&rdquo;
            </p>
            <p className="text-bento-light/80 text-xs mt-3 font-semibold">— سورة الروم، الآية ٢١</p>
          </div>
        </div>

      </div>
    </section>
  );
}
