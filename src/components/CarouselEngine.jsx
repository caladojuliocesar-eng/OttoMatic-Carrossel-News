"use client";

import React, { useState, useEffect } from 'react';
import {
    Loader2,
    Send,
    Copy,
    CheckCircle2,
    AlertCircle,
    LayoutTemplate,
    Lightbulb,
    Image as ImageIcon,
    Upload,
    Sparkles,
    Settings2,
    Download,
    MoveVertical,
    Zap,
    FileText,
    Linkedin,
    Instagram,
    Link as LinkIcon
} from 'lucide-react';

export default function CarouselEngine() {
    const [theme, setTheme] = useState('');
    const [slides, setSlides] = useState([]);
    const [captions, setCaptions] = useState({ linkedin: '', instagram: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedCaption, setCopiedCaption] = useState(null);
    const [viewMode, setViewMode] = useState('visual');
    const [loadingImages, setLoadingImages] = useState({});
    const [slideCount, setSlideCount] = useState(6);
    
    // Controle Y das imagens
    const [imagePositions, setImagePositions] = useState({});

    // Brand Customization State (Ottomatic Default)
    const [brandHandle, setBrandHandle] = useState('@ottomatic.ai');
    const [brandProfileImage, setBrandProfileImage] = useState(null);
    const [brandSignature, setBrandSignature] = useState('Via Paulo Emediato | Ottomatic');
    const [impactColor, setImpactColor] = useState('#2563eb'); 
    
    // Novos CTAs Dinâmicos
    const [coverCta, setCoverCta] = useState('Deslize para ler ➔');
    const [finalCta, setFinalCta] = useState('Siga a @ottomatic.ai');
    
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    // Deteccao dinamica de URL
    const isUrlDetected = theme.trim().toLowerCase().startsWith('http');

    const exportAllToPNG = async () => {
        setIsExporting(true);

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        await document.fonts.ready;

        try {
            if (!window.htmlToImage) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            for (let i = 0; i < slides.length; i++) {
                const element = document.getElementById(`slide-card-${i}`);
                if (!element) continue;

                const dataUrl = await window.htmlToImage.toPng(element, {
                    pixelRatio: 3, 
                    backgroundColor: '#0a0a0a' 
                });
                const link = document.createElement('a');
                const safeHandle = brandHandle.replace('@', '');
                link.download = `${safeHandle}_slide_${i + 1}.png`;
                link.href = dataUrl;
                link.click();

                await new Promise(r => setTimeout(r, 600));
            }
        } catch (err) {
            console.error("Erro ao exportar:", err);
            setError("Deu BO na hora de gerar os PNGs. O navegador arregou.");
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPDF = async () => {
        setIsExportingPdf(true);

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        await document.fonts.ready;

        try {
            if (!window.htmlToImage) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            
            if (!window.jspdf) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            const { jsPDF } = window.jspdf;
            let pdf = null;

            for (let i = 0; i < slides.length; i++) {
                const element = document.getElementById(`slide-card-${i}`);
                if (!element) continue;

                const width = element.offsetWidth;
                const height = element.offsetHeight;

                const dataUrl = await window.htmlToImage.toPng(element, {
                    pixelRatio: 2, 
                    backgroundColor: '#0a0a0a' 
                });

                if (i === 0) {
                    pdf = new jsPDF({
                        orientation: width > height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [width, height]
                    });
                } else {
                    pdf.addPage([width, height], width > height ? 'landscape' : 'portrait');
                }

                pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
                await new Promise(r => setTimeout(r, 400));
            }

            if (pdf) {
                const safeHandle = brandHandle.replace('@', '');
                pdf.save(`${safeHandle}_linkedin_carousel.pdf`);
            }

        } catch (err) {
            console.error("Erro ao exportar PDF:", err);
            setError("Falhou a geração do PDF. O navegador esgotou a memória.");
        } finally {
            setIsExportingPdf(false);
        }
    };

    const handleProfileImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const imageUrl = URL.createObjectURL(file);
        setBrandProfileImage(imageUrl);
    };

    const handleImageUpload = (index, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setSlides(prev => prev.map((s, i) => i === index ? { ...s, imageUrl } : s));
        setImagePositions(prev => ({ ...prev, [index]: 50 })); 
    };

    const generateImageWithAI = async (index, prompt) => {
        setLoadingImages(prev => ({ ...prev, [index]: true }));
        setError('');
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            const imageUrl = data.imageUrl;

            setSlides(prev => prev.map((s, i) => i === index ? { ...s, imageUrl } : s));
            setImagePositions(prev => ({ ...prev, [index]: 50 })); 
        } catch (err) {
            console.error(err);
            setError(err.message || "Erro ao gerar imagem.");
        } finally {
            setLoadingImages(prev => ({ ...prev, [index]: false }));
        }
    };

    const handlePromptChange = (index, newValue) => {
        setSlides(prev => prev.map((s, i) => i === index ? { ...s, sugestao_visual: newValue } : s));
    };

    const handlePositionChange = (index, newValue) => {
        setImagePositions(prev => ({ ...prev, [index]: newValue }));
    };

    const generateCarousel = async () => {
        if (!theme.trim()) {
            setError('Joga um tema ou link de notícia aí, né? Não leio mentes.');
            return;
        }

        setIsGenerating(true);
        setError('');
        setSlides([]);
        setCaptions({ linkedin: '', instagram: '' });
        setImagePositions({}); 

        try {
            const response = await fetch('/api/generate-carousel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme, slideCount })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Falha na API: ${response.status}`);
            }

            const parsedData = await response.json();
                
            if (parsedData.slides && Array.isArray(parsedData.slides)) {
                setSlides(parsedData.slides);
                setCaptions({
                    linkedin: parsedData.legenda_linkedin || '',
                    instagram: parsedData.legenda_instagram || ''
                });

                // Magica UI: atualiza a barra de slides e injeta credito
                if (isUrlDetected) {
                    setSlideCount(parsedData.slides.length);
                    if (parsedData.credito_extraido && parsedData.credito_extraido.trim() !== "") {
                        // Mescla a assinatura do portal com a da marca
                        // ex: "Fonte: G1 | Ottomatic"
                        setBrandSignature(`${parsedData.credito_extraido} | Ottomatic`);
                    }
                }
            } else if (Array.isArray(parsedData)) {
                setSlides(parsedData);
            } else {
                throw new Error("A IA não retornou o formato esperado.");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Deu ruim na geração. Tenta de novo.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text, type) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            if (type === 'all') {
                setCopiedIndex('all');
                setTimeout(() => setCopiedIndex(null), 2000);
            } else {
                setCopiedCaption(type);
                setTimeout(() => setCopiedCaption(null), 2000);
            }
        } catch (err) { }
        document.body.removeChild(textArea);
    };

    const copyAll = () => {
        const allText = slides.map(s => `[Slide ${s.slide} - ${s.layout}]\nHeadline: ${s.titulo}\nTexto: ${s.texto_apoio}\nVisual: ${s.sugestao_visual}\n`).join('\n---\n\n');
        copyToClipboard(allText, 'all');
    };

    const renderVisualCard = (slide, index) => {
        const verticalPosition = imagePositions[index] !== undefined ? imagePositions[index] : 50;
        const isLastSlide = index === slides.length - 1;

        const Header = ({ isDark }) => (
            <div className={`flex justify-between items-center text-[9px] font-medium tracking-wide mb-4 z-20 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <span>{brandSignature}</span>
                <span>{brandHandle}</span>
                <span>{new Date().getFullYear()} //</span>
            </div>
        );

        const ImageBlock = ({ heightClass }) => (
            <div className={`w-full bg-zinc-800/50 relative overflow-hidden flex items-center justify-center ${heightClass}`}>
                {slide.imageUrl ? (
                    <img 
                        src={slide.imageUrl} 
                        alt="Visual" 
                        style={{
                            position: 'absolute',
                            minWidth: '100%',
                            minHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            left: '50%',
                            top: `${verticalPosition}%`,
                            transform: `translate(-50%, -${verticalPosition}%)`, 
                            objectFit: 'cover'
                        }}
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 p-4 text-center z-10">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">{slide.sugestao_visual ? "Pronto para Gerar/Subir" : "Imagem 16:9 Aqui"}</span>
                    </div>
                )}
            </div>
        );

        switch (slide.layout) {
            case 'capa':
                return (
                    <div className="aspect-[4/5] w-full flex flex-col pb-8 shadow-2xl overflow-hidden relative bg-white border border-zinc-200">
                        <div className="px-6 pt-6">
                            <Header isDark={true} />
                        </div>
                        <ImageBlock heightClass="h-[45%] mt-2 mb-6" />
                        
                        <div className="flex-1 flex flex-col px-6">
                            <div className="flex items-center gap-2 mb-3">
                                {brandProfileImage ? (
                                    <img 
                                        src={brandProfileImage} 
                                        alt="Avatar" 
                                        className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: impactColor }}>
                                        <Zap className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <span className="text-black font-bold text-xs tracking-tight">{brandHandle}</span>
                            </div>
                            
                            <h2 className="font-sans font-extrabold text-3xl leading-[1.05] tracking-tight text-black mb-3">
                                {slide.titulo}
                            </h2>
                            <p className="text-sm font-medium text-zinc-600 mb-auto">
                                {slide.texto_apoio}
                            </p>

                            {coverCta && (
                                <div className="border-2 border-black rounded-full py-2.5 px-4 text-center text-black text-xs font-bold w-full mt-4 uppercase tracking-wider">
                                    {coverCta}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'texto_imagem':
                return (
                    <div className="aspect-[4/5] w-full flex flex-col pb-8 shadow-2xl overflow-hidden relative bg-[#070707] border border-zinc-800">
                        <div className="px-6 pt-6 flex flex-col">
                            <Header isDark={false} />
                            <h2 className="font-serif text-[28px] leading-[1.15] text-[#f4f4dc] mb-5 mt-2">
                                {slide.titulo}
                            </h2>
                        </div>
                        
                        <ImageBlock heightClass="h-[40%] my-2" />
                        
                        <div className="flex-1 mt-6 px-6 flex flex-col">
                            <p className="text-[15px] leading-relaxed text-zinc-100 font-sans font-medium mb-auto">
                                {slide.texto_apoio}
                            </p>
                            
                            {isLastSlide && finalCta && (
                                <div className="mt-4 pt-4 flex justify-center w-full">
                                    <div className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg w-full text-center">
                                        {finalCta}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'so_texto':
                return (
                    <div className="aspect-[4/5] w-full flex flex-col p-8 pb-10 shadow-2xl overflow-hidden relative bg-[#050505] border border-zinc-800">
                        <Header isDark={false} />
                        <div className="flex-1 flex flex-col justify-center pt-2">
                            <h2 className="font-serif text-[38px] leading-[1.1] text-[#f4f4dc] mb-6">
                                {slide.titulo}
                            </h2>
                            <p className="text-lg leading-snug text-zinc-200 font-sans font-medium mb-auto">
                                {slide.texto_apoio}
                            </p>
                        </div>
                        {isLastSlide && finalCta && (
                            <div className="mt-auto pt-6 flex justify-center w-full">
                                <div className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg w-full text-center">
                                    {finalCta}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'impacto':
                return (
                    <div 
                        className="aspect-[4/5] w-full flex flex-col p-8 pb-10 shadow-2xl overflow-hidden relative"
                        style={{ backgroundColor: impactColor, borderColor: impactColor }}
                    >
                        <Header isDark={false} />
                        <div className="flex-1 flex flex-col justify-center">
                            <h2 className="font-serif text-5xl leading-[1.05] text-white mb-6 tracking-tight">
                                {slide.titulo}
                            </h2>
                            <p className="text-xl leading-tight text-white/90 font-serif font-medium underline decoration-white/40 underline-offset-4 mb-auto">
                                {slide.texto_apoio}
                            </p>
                        </div>
                        {isLastSlide && finalCta && (
                            <div className="mt-auto pt-6 flex justify-center w-full">
                                <div className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg w-full text-center">
                                    {finalCta}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                            <Zap className="w-8 h-8 text-blue-500" />
                            Ottomatic <span className="text-blue-500">Carousel Engine</span>
                        </h1>
                        <p className="text-zinc-400 mt-1">Geração estruturada e visual de carrosséis narrativos.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <div className="lg:col-span-4 space-y-6">
                        
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-blue-400" />
                                Setup da Marca (Brand Kit)
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex gap-3 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs text-zinc-500 mb-1">Handle (Instagram)</label>
                                        <input 
                                            type="text" 
                                            value={brandHandle}
                                            onChange={(e) => setBrandHandle(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Avatar</label>
                                        <label className="flex items-center justify-center h-[38px] px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-md cursor-pointer transition-colors border border-zinc-700">
                                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                                            {brandProfileImage ? 'OK' : 'Foto'}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 flex justify-between">
                                        Assinatura do Topo
                                        <span className="text-blue-500/80 text-[10px]">Auto-preenchido via Link</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={brandSignature}
                                        onChange={(e) => setBrandSignature(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">CTA da Capa</label>
                                        <input 
                                            type="text" 
                                            value={coverCta}
                                            onChange={(e) => setCoverCta(e.target.value)}
                                            placeholder="Ex: Deslize para ler"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">CTA Final</label>
                                        <input 
                                            type="text" 
                                            value={finalCta}
                                            onChange={(e) => setFinalCta(e.target.value)}
                                            placeholder="Ex: Siga a página"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Cor de Impacto</label>
                                    <div className="flex gap-2 items-center">
                                        <input 
                                            type="color" 
                                            value={impactColor}
                                            onChange={(e) => setImpactColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer bg-zinc-950 border border-zinc-800 p-0.5"
                                        />
                                        <span className="text-xs text-zinc-400 uppercase">{impactColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`border rounded-xl p-6 transition-all duration-300 ${isUrlDetected ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                                {isUrlDetected ? <LinkIcon className="w-4 h-4 text-indigo-400" /> : <Lightbulb className="w-4 h-4 text-blue-400" />}
                                {isUrlDetected ? 'Link Externo Detectado' : 'Tema ou Texto Base'}
                            </label>
                            <textarea
                                className={`w-full h-48 bg-zinc-950 border rounded-lg p-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-all resize-none ${isUrlDetected ? 'border-indigo-800 focus:border-indigo-500 focus:ring-indigo-500' : 'border-zinc-800 focus:border-blue-500 focus:ring-blue-500'}`}
                                placeholder="Cole a URL de uma reportagem, ou digite o tema livre..."
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                            />

                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-zinc-300">Quantidade de Slides</label>
                                    <span className={`font-bold px-2 py-0.5 rounded text-sm ${isUrlDetected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {isUrlDetected ? 'Automático pela IA' : slideCount}
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min="4" 
                                    max="10" 
                                    value={slideCount}
                                    onChange={(e) => setSlideCount(parseInt(e.target.value))}
                                    disabled={isUrlDetected}
                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isUrlDetected ? 'bg-indigo-900/50 accent-indigo-500 opacity-50' : 'bg-zinc-800 accent-blue-500'}`}
                                />
                                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                                    <span>4 (Curto)</span>
                                    <span>{isUrlDetected ? 'O Slider se moverá sozinho após gerar' : '10 (Bíblia)'}</span>
                                </div>
                            </div>
                            
                            {error && (
                                <div className="mt-4 p-3 bg-red-950/50 border border-red-900 rounded-lg flex items-start gap-3 text-red-200 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <button
                                onClick={generateCarousel}
                                disabled={isGenerating}
                                className={`mt-6 w-full text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isUrlDetected ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {isUrlDetected ? 'Extraindo e Arquitetando...' : 'Arquitetando Roteiro...'}
                                    </>
                                ) : (
                                    <>
                                        {isUrlDetected ? <Sparkles className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                                        {isUrlDetected ? 'Gerar via Link' : 'Gerar Roteiro'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        {slides.length === 0 && !isGenerating ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                                <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
                                <p>O roteiro e os cards vão aparecer aqui.</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-zinc-800 rounded-xl bg-zinc-900/20">
                                <Loader2 className={`w-12 h-12 animate-spin mb-4 ${isUrlDetected ? 'text-indigo-500' : 'text-blue-500'}`} />
                                <p className="text-zinc-400 font-medium animate-pulse">Consultando o oráculo do design...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <span className="text-zinc-300 font-medium">{slides.length} Slides</span>
                                        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                                            <button 
                                                onClick={() => setViewMode('visual')}
                                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'visual' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
                                            >
                                                Modo Edição Visual
                                            </button>
                                            <button 
                                                onClick={() => setViewMode('text')}
                                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'text' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
                                            >
                                                Modo Copy
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        {viewMode === 'visual' && slides.length > 0 && (
                                            <>
                                                <button 
                                                    onClick={exportToPDF}
                                                    disabled={isExportingPdf || isExporting}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 font-medium"
                                                >
                                                    {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                                    {isExportingPdf ? 'A Gerar PDF...' : 'PDF (LinkedIn)'}
                                                </button>
                                                <button 
                                                    onClick={exportAllToPNG}
                                                    disabled={isExporting || isExportingPdf}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 font-medium border border-zinc-700"
                                                >
                                                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                    {isExporting ? 'A Baixar...' : 'PNGs (Insta)'}
                                                </button>
                                            </>
                                        )}
                                        {viewMode === 'text' && (
                                            <button 
                                                onClick={copyAll}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors border border-zinc-700"
                                            >
                                                {copiedIndex === 'all' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                {copiedIndex === 'all' ? 'Copiado!' : 'Copiar Copy Slides'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {viewMode === 'text' ? (
                                    <div className="space-y-6">
                                        {(captions.linkedin || captions.instagram) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                {captions.linkedin && (
                                                    <div className="bg-[#0e1628] border border-blue-900/50 rounded-xl p-5 relative group shadow-lg">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                                                                <Linkedin className="w-4 h-4" /> Legenda LinkedIn
                                                            </span>
                                                            <button 
                                                                onClick={() => copyToClipboard(captions.linkedin, 'linkedin')}
                                                                className="text-zinc-400 hover:text-white transition-colors"
                                                            >
                                                                {copiedCaption === 'linkedin' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-zinc-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{captions.linkedin}</p>
                                                    </div>
                                                )}
                                                
                                                {captions.instagram && (
                                                    <div className="bg-[#1c0f1a] border border-pink-900/30 rounded-xl p-5 relative group shadow-lg">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider">
                                                                <Instagram className="w-4 h-4" /> Legenda Instagram
                                                            </span>
                                                            <button 
                                                                onClick={() => copyToClipboard(captions.instagram, 'instagram')}
                                                                className="text-zinc-400 hover:text-white transition-colors"
                                                            >
                                                                {copiedCaption === 'instagram' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-zinc-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{captions.instagram}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid gap-6">
                                            {slides.map((slide, index) => (
                                                <div key={index} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden shadow-xl relative group">
                                                    <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase">
                                                                Slide {slide.slide}
                                                            </span>
                                                            <span className="text-sm font-medium text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded bg-zinc-800/50">
                                                                Layout: {slide.layout}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 md:p-8 space-y-4">
                                                        <h2 className="text-2xl font-serif text-white">{slide.titulo}</h2>
                                                        <p className="text-zinc-300 font-sans">{slide.texto_apoio}</p>
                                                        {slide.layout === 'capa' && coverCta && <p className="text-blue-400 text-sm font-bold uppercase tracking-wider">CTA Capa: {coverCta}</p>}
                                                        {index === slides.length - 1 && finalCta && <p className="text-blue-400 text-sm font-bold uppercase tracking-wider">CTA Final: {finalCta}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        {slides.map((slide, index) => (
                                            <div key={`visual-${index}`} className="flex flex-col gap-4 w-[380px] shrink-0 snap-center">
                                                
                                                <div id={`slide-card-${index}`}>
                                                    {renderVisualCard(slide, index)}
                                                </div>
                                                
                                                {(slide.layout === 'capa' || slide.layout === 'texto_imagem') && (
                                                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
                                                        
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prompt da Imagem (Editável)</label>
                                                            <textarea 
                                                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-blue-500 focus:outline-none resize-none"
                                                                rows="2"
                                                                value={slide.sugestao_visual}
                                                                onChange={(e) => handlePromptChange(index, e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => generateImageWithAI(index, slide.sugestao_visual)}
                                                                disabled={loadingImages[index]}
                                                                className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 py-2 rounded-lg transition-colors font-medium border border-blue-600/30"
                                                            >
                                                                {loadingImages[index] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                                {loadingImages[index] ? 'Gerando...' : 'Gerar IA'}
                                                            </button>

                                                            <label className="flex-1 flex items-center justify-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg transition-colors font-medium cursor-pointer border border-zinc-700">
                                                                <Upload className="w-3.5 h-3.5" />
                                                                Upload
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(index, e)} />
                                                            </label>
                                                        </div>

                                                        {slide.imageUrl && (
                                                            <div className="pt-2 border-t border-zinc-800/50 flex flex-col gap-2">
                                                                <div className="flex justify-between items-center">
                                                                    <label className="text-[10px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                                                                        <MoveVertical className="w-3 h-3" />
                                                                        Enquadramento Vertical Y
                                                                    </label>
                                                                    <span className="text-[10px] text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded">{imagePositions[index] !== undefined ? imagePositions[index] : 50}%</span>
                                                                </div>
                                                                <input 
                                                                    type="range" 
                                                                    min="0" 
                                                                    max="100" 
                                                                    value={imagePositions[index] !== undefined ? imagePositions[index] : 50}
                                                                    onChange={(e) => handlePositionChange(index, e.target.value)}
                                                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
