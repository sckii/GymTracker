import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { fetchWgerExerciseDetail } from '../lib/wgerClient';

const ENGLISH_LANGUAGE_ID = 2;

export default function ExerciseDetailModal({ exercise, onClose }) {
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageIndex, setImageIndex] = useState(0);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    useEffect(() => {
        if (!exercise) return;
        setDetail(null);
        setIsLoading(true);
        setImageIndex(0);
        setIsPlayingVideo(false);

        fetchWgerExerciseDetail(exercise.id).then(data => {
            setDetail(data);
            setIsLoading(false);
        });
    }, [exercise?.id]);

    const backdropRef = useRef(null);
    const scrollBodyRef = useRef(null);

    // Block all touchmove on backdrop (non-passive), allow only inside scroll container
    useEffect(() => {
        if (!exercise) return;
        const backdrop = backdropRef.current;
        if (!backdrop) return;

        const blockTouch = (e) => e.preventDefault();
        backdrop.addEventListener('touchmove', blockTouch, { passive: false });
        return () => backdrop.removeEventListener('touchmove', blockTouch);
    }, [exercise]);

    if (!exercise) return null;

    const englishTranslation =
        detail?.translations?.find(t => t.language === ENGLISH_LANGUAGE_ID)
        ?? detail?.translations?.[0];

    const description = englishTranslation?.description
        ? englishTranslation.description.replace(/<[^>]*>/g, '').trim()
        : '';

    const aliases = englishTranslation?.aliases ?? [];
    const images = detail?.images ?? [];
    const videos = detail?.videos ?? [];
    const primaryMuscles = detail?.muscles ?? [];
    const secondaryMuscles = detail?.muscles_secondary ?? [];

    const currentImage = images[imageIndex];
    const mainVideo = videos[0];

    const openYouTube = () => {
        const parts = [exercise.name];
        if (exercise.category?.name) parts.push(exercise.category.name);
        const topMuscle = primaryMuscles[0]?.name_en || primaryMuscles[0]?.name;
        if (topMuscle) parts.push(topMuscle);
        parts.push('exercise tutorial');
        window.open(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(parts.join(' '))}`,
            '_blank'
        );
    };

    const content = (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full sm:max-w-lg bg-brand-gray rounded-2xl sm:rounded-2xl shadow-2xl border border-brand-border/50 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-4 border-b border-brand-border/50 flex justify-between items-start bg-brand-light-gray shrink-0">
                    <div className="flex-1 pr-3 min-w-0">
                        <h2 className="text-lg font-bold text-gray-100 truncate">{exercise.name}</h2>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {[exercise.category?.name, ...(exercise.equipment?.map(e => e.name) ?? [])].filter(Boolean).join(' • ')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-brand-gray/50 rounded-full text-gray-400 hover:text-white transition-colors shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div
                    ref={scrollBodyRef}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="overflow-y-auto flex-1 custom-scrollbar overscroll-none"
                >
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
                            <Loader2 size={28} className="animate-spin text-brand-primary" />
                            <p className="text-sm font-medium">Loading details...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Image Carousel */}
                            {images.length > 0 ? (
                                <div className="relative bg-black/50 shrink-0">
                                    <img
                                        src={currentImage.image}
                                        alt={exercise.name}
                                        className="w-full h-56 object-contain"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                onClick={() => setImageIndex(i => (i + 1) % images.length)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {images.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setImageIndex(i)}
                                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIndex ? 'bg-brand-primary' : 'bg-white/30 hover:bg-white/60'}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : <></>}

                            {/* Video */}
                            {mainVideo && (
                                <div className="p-4 border-b border-brand-border/30">
                                    {isPlayingVideo ? (
                                        <video
                                            src={mainVideo.video}
                                            controls
                                            autoPlay
                                            className="w-full rounded-xl max-h-48 bg-black"
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setIsPlayingVideo(true)}
                                            className="w-full py-3 bg-brand-light-gray hover:bg-brand-gray border border-brand-border rounded-xl flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors"
                                        >
                                            <Play size={16} className="text-brand-primary fill-brand-primary" />
                                            <span className="text-sm font-medium">Play Tutorial Video</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Muscles */}
                            {(primaryMuscles.length > 0 || secondaryMuscles.length > 0) && (
                                <div className="p-4 border-b border-brand-border/30">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Muscles</h3>
                                    {primaryMuscles.length > 0 && (
                                        <p className="text-sm mb-1">
                                            <span className="text-brand-primary font-semibold text-xs uppercase">Primary </span>
                                            <span className="text-gray-300">{primaryMuscles.map(m => m.name_en || m.name).join(', ')}</span>
                                        </p>
                                    )}
                                    {secondaryMuscles.length > 0 && (
                                        <p className="text-sm">
                                            <span className="text-gray-500 font-semibold text-xs uppercase">Secondary </span>
                                            <span className="text-gray-400">{secondaryMuscles.map(m => m.name_en || m.name).join(', ')}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Aliases */}
                            {aliases.length > 0 && (
                                <div className="px-4 py-3 border-b border-brand-border/30">
                                    <p className="text-xs text-gray-500">
                                        <span className="font-semibold text-gray-400">Also known as: </span>
                                        {aliases.map(a => a.alias).join(', ')}
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            {description && (
                                <div className="p-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-brand-border/50 bg-brand-light-gray shrink-0">
                    <button
                        onClick={openYouTube}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                        Search on YouTube
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
}
