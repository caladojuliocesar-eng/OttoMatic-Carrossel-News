"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, MessageCircle, Zap, Sparkles } from 'lucide-react';

const MAX_CAROUSEL_CREDITS = 2;
const MAX_IMAGE_CREDITS = 25;
const LS_TOKEN_KEY = 'vip_token';
const LS_CAROUSELS_KEY = 'vip_carousels_v2';
const LS_IMAGES_KEY = 'vip_images_v2';

export default function AccessGate({ children }) {
    const [accessState, setAccessState] = useState('loading'); // 'loading' | 'granted' | 'blocked' | 'expired'
    const [carouselCredits, setCarouselCredits] = useState(0);
    const [imageCredits, setImageCredits] = useState(0);

    useEffect(() => {
        const init = async () => {
            // 1. Check URL for token param
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('token');

            if (tokenFromUrl) {
                // Validate token on the server
                try {
                    const res = await fetch('/api/validate-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: tokenFromUrl })
                    });
                    const data = await res.json();

                    if (data.valid) {
                        if (data.isOwner) {
                            localStorage.setItem(LS_TOKEN_KEY, tokenFromUrl);
                            localStorage.setItem(LS_CAROUSELS_KEY, '-1');
                            localStorage.setItem(LS_IMAGES_KEY, '-1');
                            setCarouselCredits(-1);
                            setImageCredits(-1);
                            setAccessState('granted');
                        } else {
                            // Check if this token already has saved credits
                            const savedToken = localStorage.getItem(LS_TOKEN_KEY);
                            const savedCarousels = parseInt(localStorage.getItem(LS_CAROUSELS_KEY) || '0', 10);
                            const savedImages = parseInt(localStorage.getItem(LS_IMAGES_KEY) || '0', 10);

                            if (savedToken === tokenFromUrl && savedCarousels > 0) {
                                // Same token, resume credits
                                setCarouselCredits(savedCarousels);
                                setImageCredits(savedImages);
                                setAccessState('granted');
                            } else if (savedToken === tokenFromUrl && savedCarousels <= 0) {
                                // Same token, already used all credits
                                setCarouselCredits(0);
                                setImageCredits(savedImages);
                                setAccessState('expired');
                            } else {
                                // New token, fresh credits
                                localStorage.setItem(LS_TOKEN_KEY, tokenFromUrl);
                                localStorage.setItem(LS_CAROUSELS_KEY, String(MAX_CAROUSEL_CREDITS));
                                localStorage.setItem(LS_IMAGES_KEY, String(MAX_IMAGE_CREDITS));
                                setCarouselCredits(MAX_CAROUSEL_CREDITS);
                                setImageCredits(MAX_IMAGE_CREDITS);
                                setAccessState('granted');
                            }
                        }
                    } else {
                        setAccessState('blocked');
                    }
                } catch {
                    setAccessState('blocked');
                }

                // Clean the URL to look professional
                window.history.replaceState({}, '', '/');
                return;
            }

            // 2. No token in URL — check localStorage for a previous session
            const savedToken = localStorage.getItem(LS_TOKEN_KEY);
            if (savedToken) {
                const savedCarousels = parseInt(localStorage.getItem(LS_CAROUSELS_KEY) || '0', 10);
                const savedImages = parseInt(localStorage.getItem(LS_IMAGES_KEY) || '0', 10);
                
                if (savedCarousels === -1) {
                    setCarouselCredits(-1);
                    setImageCredits(-1);
                    setAccessState('granted');
                } else if (savedCarousels > 0) {
                    setCarouselCredits(savedCarousels);
                    setImageCredits(savedImages);
                    setAccessState('granted');
                } else {
                    setCarouselCredits(0);
                    setImageCredits(savedImages);
                    setAccessState('expired');
                }
                return;
            }

            // 3. No token anywhere — block access by default!
            setAccessState('blocked');
        };

        init();
    }, []);

    const consumeCarouselCredit = useCallback(() => {
        // Owner mode (no token = unlimited)
        if (carouselCredits === -1) return true;

        if (carouselCredits <= 0) {
            setAccessState('expired');
            return false;
        }

        const newCredits = carouselCredits - 1;
        setCarouselCredits(newCredits);
        localStorage.setItem(LS_CAROUSELS_KEY, String(newCredits));

        // We DO NOT set expired here immediately! We want them to see the final carousel.
        // It will only set expired if they try to consume when it's already 0 (caught by the if above).
        
        return true;
    }, [carouselCredits]);

    const consumeImageCredit = useCallback(() => {
        if (carouselCredits === -1 || imageCredits === -1) return true;

        // Block generation if no image credits left, but do NOT expire the main UI
        if (imageCredits <= 0) {
            return false;
        }

        const newCredits = imageCredits - 1;
        setImageCredits(newCredits);
        localStorage.setItem(LS_IMAGES_KEY, String(newCredits));

        return true;
    }, [carouselCredits, imageCredits]);

    // Loading state
    if (accessState === 'loading') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="w-10 h-10 text-blue-500 animate-pulse" />
                    <p className="text-zinc-400 text-sm">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    // Blocked state (invalid token)
    if (accessState === 'blocked') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Esta ferramenta é de uso exclusivo para convidados.
                            Se você recebeu um link de convite, verifique se o endereço está correto.
                        </p>
                    </div>
                    <a
                        href="https://wa.me/5511999731501?text=Julio%2C%20quero%20falar%20do%20Carrossel%20News!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Solicitar Acesso VIP
                    </a>
                </div>
            </div>
        );
    }

    // Expired state (credits used up)
    if (accessState === 'expired') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Teste Concluído!</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Seus créditos de teste acabaram. Gostou do que viu?
                            <br />
                            Fale conosco para ter acesso ilimitado com a identidade visual da sua marca.
                        </p>
                    </div>
                    <a
                        href="https://wa.me/5511999731501?text=Julio%2C%20quero%20falar%20do%20Carrossel%20News!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Falar no WhatsApp
                    </a>
                    <p className="text-zinc-600 text-xs">
                        Setup a partir de R$ 300 · Carrosséis ilimitados com sua marca
                    </p>
                </div>
            </div>
        );
    }

    // Granted — render the app with credit badge and consumeCredit function
    return (
        <div className="relative">
            {/* Credit badge for VIP users (not owner) */}
            {carouselCredits !== -1 && (
                <div className="fixed top-4 right-4 z-50 bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">
                        ✨ {carouselCredits} Carross{carouselCredits === 1 ? 'el' : 'éis'} Restante{carouselCredits === 1 ? '' : 's'}
                    </span>
                </div>
            )}
            {/* Render CarouselEngine with consumeCredit injected */}
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child, { 
                        onBeforeCarouselGenerate: consumeCarouselCredit,
                        onBeforeImageGenerate: consumeImageCredit,
                        carouselCredits,
                        imageCredits,
                        isOwner: carouselCredits === -1
                    })
                    : child
            )}
        </div>
    );
}
