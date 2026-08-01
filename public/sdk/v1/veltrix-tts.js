(function () {
    if (window.VeltrixTTS) return;

    // Vector SVG Icons Helper (Lucide / React Icons Style)
    const Icons = {
        mic: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
        clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        volume: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
        zap: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        sparkles: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
        history: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,
        play: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
        pause: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
        download: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
        close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
    };

    class VeltrixVoiceSDK {
        constructor(config = {}) {
            this.apiKey = config.apiKey || '';
            this.serverUrl = config.serverUrl || this.detectServerUrl();
            this.targetSelector = config.target || '';
            this.voices = [];
            this.selectedVoice = 'vi-VN-HoaiMyNeural';
            this.rate = 1.0;
            this.pitch = 0;
            this.history = [];
            this.isHistoryOpen = false;

            if (this.apiKey) {
                this.init();
            }
        }

        detectServerUrl() {
            const currentScript = document.currentScript || Array.from(document.querySelectorAll('script')).find(s => s.src && s.src.includes('veltrix-tts.js'));
            if (currentScript && currentScript.src) {
                const url = new URL(currentScript.src);
                return url.origin;
            }
            return 'https://veltrixvoice.autos';
        }

        async init() {
            await this.fetchVoices();
            this.attachWidget();
        }

        async fetchVoices() {
            try {
                const res = await fetch(`${this.serverUrl}/api/sdk/voices`, {
                    headers: { 'x-api-key': this.apiKey }
                });
                const data = await res.json();
                if (data.success && data.voices) {
                    this.voices = data.voices;
                    if (this.voices.length > 0) {
                        this.selectedVoice = this.voices[0].voiceId;
                    }
                }
            } catch (e) {
                console.error('[Veltrix Voice SDK] Cannot fetch voices:', e);
            }
        }

        async fetchHistory(container) {
            try {
                const res = await fetch(`${this.serverUrl}/api/sdk/history`, {
                    headers: { 'x-api-key': this.apiKey }
                });
                const data = await res.json();
                if (data.success && data.history) {
                    this.history = data.history;
                    this.renderHistoryList(container);
                }
            } catch (e) {
                console.error('[Veltrix Voice SDK] Cannot fetch history:', e);
            }
        }

        formatTime(secs) {
            if (isNaN(secs) || secs < 0) return '00:00';
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        }

        renderHistoryList(container) {
            const listEl = container.querySelector('.veltrix-history-list');
            if (!listEl) return;

            if (this.history.length === 0) {
                listEl.innerHTML = `<div style="text-align: center; color: #94a3b8; font-size: 11.5px; padding: 10px;">Chưa có bài đọc nào trong lịch sử</div>`;
                return;
            }

            listEl.innerHTML = this.history.map(item => {
                const title = item.title || item.text.slice(0, 30) + '...';
                const audioUrl = item.audioUrl.startsWith('http') ? item.audioUrl : `${this.serverUrl}${item.audioUrl}`;
                const date = new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
                return `
                    <div class="veltrix-history-item">
                        <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <div style="font-weight: 700; color: #fff; font-size: 12px;">${title}</div>
                            <div style="font-size: 10.5px; color: #94a3b8;">${date} • ${item.charactersCount || 0} ký tự</div>
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button class="veltrix-btn-micro veltrix-play-history-btn" data-url="${audioUrl}" type="button">
                                ${Icons.play} <span style="margin-left:2px;">Phát</span>
                            </button>
                            <a href="${audioUrl}" target="_blank" download="audio.mp3" class="veltrix-btn-micro" style="text-decoration: none; display: flex; align-items: center; gap: 4px;">
                                ${Icons.download} Tải
                            </a>
                        </div>
                    </div>
                `;
            }).join('');

            listEl.querySelectorAll('.veltrix-play-history-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const url = e.currentTarget.getAttribute('data-url');
                    this.loadAudio(container, url);
                });
            });
        }

        loadAudio(container, url) {
            const playerArea = container.querySelector('.veltrix-player-area');
            const audioElement = container.querySelector('.veltrix-audio-element');
            const downloadBtn = container.querySelector('.veltrix-dl-btn');

            if (playerArea && audioElement) {
                playerArea.style.display = 'flex';
                audioElement.src = url;
                audioElement.play();
                if (downloadBtn) {
                    downloadBtn.href = url;
                }
            }
        }

        attachWidget() {
            const targetEl = this.targetSelector ? document.querySelector(this.targetSelector) : null;
            
            // Container Widget Veltrix Voice (REACT ICONS VECTOR SVG & DARK THEME)
            const container = document.createElement('div');
            container.className = 'veltrix-widget-container';
            container.innerHTML = `
                <style>
                    .veltrix-widget-container {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        background: #121319;
                        color: #f3f4f6;
                        border: 1px solid #2a2d3d;
                        border-radius: 14px;
                        padding: 14px 18px;
                        margin: 12px 0;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                        box-sizing: border-box;
                        resize: vertical;
                        overflow: auto;
                        min-height: 100px;
                    }
                    .veltrix-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #2a2d3d;
                    }
                    .veltrix-title {
                        font-weight: 700;
                        font-size: 13px;
                        color: #c084fc;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .veltrix-brand {
                        font-size: 11px;
                        color: #06b6d4;
                        text-decoration: none;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        transition: opacity 0.2s;
                    }
                    .veltrix-brand:hover {
                        opacity: 0.8;
                        text-decoration: underline;
                    }
                    .veltrix-controls-row {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        align-items: center;
                        margin-bottom: 10px;
                    }
                    .veltrix-select {
                        background: #1a1c26;
                        color: #f3f4f6;
                        border: 1px solid #2a2d3d;
                        border-radius: 8px;
                        padding: 7px 10px;
                        font-size: 12px;
                        outline: none;
                    }
                    .veltrix-btn {
                        background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        padding: 7px 14px;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        transition: transform 0.1s ease, box-shadow 0.2s ease;
                    }
                    .veltrix-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
                    }
                    .veltrix-btn-sec {
                        background: #2a2d3d;
                        color: #e5e7eb;
                        border: 1px solid #374151;
                    }
                    .veltrix-btn-sec:hover {
                        background: #374151;
                        box-shadow: none;
                    }
                    .veltrix-btn-micro {
                        background: rgba(255, 255, 255, 0.08);
                        color: #38bdf8;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        padding: 5px 11px;
                        border-radius: 8px;
                        font-size: 11.5px;
                        font-weight: 700;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        transition: all 0.2s ease;
                    }
                    .veltrix-btn-micro:hover {
                        background: rgba(56, 189, 248, 0.2);
                        color: #fff;
                    }

                    /* 🎧 CUSTOM DARK PLAYER BAR */
                    .veltrix-player-area {
                        margin-top: 10px;
                        display: none;
                        align-items: center;
                        gap: 12px;
                        background: #181a26;
                        border: 1px solid #2e3248;
                        border-radius: 10px;
                        padding: 8px 14px;
                    }
                    .veltrix-play-btn {
                        background: #8b5cf6;
                        color: #fff;
                        border: none;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        flex-shrink: 0;
                        transition: transform 0.15s ease;
                    }
                    .veltrix-play-btn:hover {
                        transform: scale(1.08);
                        background: #a855f7;
                    }
                    .veltrix-time-display {
                        font-size: 11.5px;
                        font-weight: 700;
                        color: #c084fc;
                        font-family: Consolas, Monaco, monospace;
                        flex-shrink: 0;
                        min-width: 90px;
                    }
                    .veltrix-seek-bar {
                        flex: 1;
                        height: 6px;
                        accent-color: #06b6d4;
                        cursor: pointer;
                        border-radius: 3px;
                    }
                    .veltrix-dl-btn {
                        background: rgba(6, 182, 212, 0.15);
                        color: #06b6d4;
                        border: 1px solid rgba(6, 182, 212, 0.3);
                        padding: 5px 12px;
                        border-radius: 8px;
                        font-size: 11.5px;
                        font-weight: bold;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        flex-shrink: 0;
                        transition: all 0.2s ease;
                    }
                    .veltrix-dl-btn:hover {
                        background: rgba(6, 182, 212, 0.3);
                        color: #fff;
                    }

                    .veltrix-history-drawer {
                        margin-top: 12px;
                        padding-top: 12px;
                        border-top: 1px dashed #2a2d3d;
                        display: none;
                    }
                    .veltrix-history-list {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        max-height: 180px;
                        overflow-y: auto;
                        padding-right: 4px;
                    }
                    .veltrix-history-item {
                        background: #181a24;
                        border: 1px solid #282b3d;
                        border-radius: 8px;
                        padding: 8px 12px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 10px;
                    }
                </style>

                <div class="veltrix-header">
                    <div class="veltrix-title">
                        ${Icons.mic} <span>Veltrix Voice AI Studio Tool</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button class="veltrix-btn-micro veltrix-history-toggle-btn" type="button">
                            ${Icons.history} <span>Lịch Sử Bài Đọc</span>
                        </button>
                        <a href="https://veltrixvoice.autos" target="_blank" class="veltrix-brand">
                            ${Icons.sparkles} <span>Powered by VeltrixVoice.autos</span>
                        </a>
                    </div>
                </div>

                <div class="veltrix-controls-row">
                    <select class="veltrix-select veltrix-voice-select">
                        ${this.voices.map(v => `<option value="${v.voiceId}">${v.name} (${v.gender === 'Female' ? 'Nữ' : 'Nam'})</option>`).join('')}
                    </select>

                    <button class="veltrix-btn veltrix-btn-sec veltrix-pause-btn" type="button" title="Thêm tạm ngắt 0.5s">
                        ${Icons.clock} <span>+ Ngắt 0.5s</span>
                    </button>

                    <button class="veltrix-btn veltrix-btn-sec veltrix-preview-btn" type="button">
                        ${Icons.volume} <span class="veltrix-preview-txt">Nghe thử</span>
                    </button>

                    <button class="veltrix-btn veltrix-generate-btn" type="button">
                        ${Icons.zap} <span class="veltrix-generate-txt">Tạo Audio MP3</span>
                    </button>
                </div>

                <!-- 🎧 CUSTOM DARK MODE VELTRIX AUDIO PLAYER -->
                <div class="veltrix-player-area">
                    <button class="veltrix-play-btn" type="button">${Icons.play}</button>
                    <span class="veltrix-time-display">00:00 / 00:00</span>
                    <input type="range" class="veltrix-seek-bar" value="0" min="0" max="100" step="0.1">
                    <a class="veltrix-dl-btn" href="#" target="_blank" download="audio.mp3">
                        ${Icons.download} <span>Tải MP3</span>
                    </a>
                    <audio class="veltrix-audio-element" style="display:none;"></audio>
                </div>

                <div class="veltrix-history-drawer">
                    <div style="font-size: 11.5px; font-weight: 700; color: #c084fc; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="display: flex; align-items: center; gap: 6px;">
                            ${Icons.history} Bài đọc gần đây (Đồng bộ với API Key)
                        </span>
                        <span style="cursor: pointer; opacity: 0.7; display: flex; align-items: center; gap: 4px;" class="veltrix-close-history">
                            ${Icons.close} Đóng
                        </span>
                    </div>
                    <div class="veltrix-history-list"></div>
                </div>
            `;

            if (targetEl && targetEl.parentNode) {
                targetEl.parentNode.insertBefore(container, targetEl);
            } else {
                document.body.appendChild(container);
            }

            // Gán sự kiện cho Widget
            const voiceSelect = container.querySelector('.veltrix-voice-select');
            const pauseBtn = container.querySelector('.veltrix-pause-btn');
            const previewBtn = container.querySelector('.veltrix-preview-btn');
            const previewTxt = container.querySelector('.veltrix-preview-txt');
            const generateBtn = container.querySelector('.veltrix-generate-btn');
            const generateTxt = container.querySelector('.veltrix-generate-txt');
            const historyToggleBtn = container.querySelector('.veltrix-history-toggle-btn');
            const closeHistoryBtn = container.querySelector('.veltrix-close-history');
            const historyDrawer = container.querySelector('.veltrix-history-drawer');
            const playerArea = container.querySelector('.veltrix-player-area');
            const audioElement = container.querySelector('.veltrix-audio-element');

            // Custom Player Controls
            const customPlayBtn = container.querySelector('.veltrix-play-btn');
            const customTimeDisplay = container.querySelector('.veltrix-time-display');
            const customSeekBar = container.querySelector('.veltrix-seek-bar');
            const customDlBtn = container.querySelector('.veltrix-dl-btn');

            if (audioElement) {
                audioElement.addEventListener('timeupdate', () => {
                    if (audioElement.duration) {
                        const pct = (audioElement.currentTime / audioElement.duration) * 100;
                        if (customSeekBar) customSeekBar.value = pct;
                        if (customTimeDisplay) {
                            customTimeDisplay.innerText = `${this.formatTime(audioElement.currentTime)} / ${this.formatTime(audioElement.duration)}`;
                        }
                    }
                });

                audioElement.addEventListener('play', () => {
                    if (customPlayBtn) customPlayBtn.innerHTML = Icons.pause;
                });

                audioElement.addEventListener('pause', () => {
                    if (customPlayBtn) customPlayBtn.innerHTML = Icons.play;
                });

                audioElement.addEventListener('ended', () => {
                    if (customPlayBtn) customPlayBtn.innerHTML = Icons.play;
                    if (customSeekBar) customSeekBar.value = 0;
                });
            }

            if (customPlayBtn && audioElement) {
                customPlayBtn.addEventListener('click', () => {
                    if (audioElement.paused) {
                        audioElement.play();
                    } else {
                        audioElement.pause();
                    }
                });
            }

            if (customSeekBar && audioElement) {
                customSeekBar.addEventListener('input', (e) => {
                    if (audioElement.duration) {
                        audioElement.currentTime = (e.target.value / 100) * audioElement.duration;
                    }
                });
            }

            // Restore last generated audio from localStorage on F5 reload
            const storageKey = 'veltrix_last_audio_' + this.apiKey;
            const savedAudioUrl = localStorage.getItem(storageKey);
            if (savedAudioUrl) {
                this.loadAudio(container, savedAudioUrl);
            }

            if (voiceSelect) {
                voiceSelect.addEventListener('change', (e) => {
                    this.selectedVoice = e.target.value;
                });
            }

            if (historyToggleBtn && historyDrawer) {
                historyToggleBtn.addEventListener('click', () => {
                    this.isHistoryOpen = !this.isHistoryOpen;
                    historyDrawer.style.display = this.isHistoryOpen ? 'block' : 'none';
                    if (this.isHistoryOpen) {
                        this.fetchHistory(container);
                    }
                });
            }

            if (closeHistoryBtn && historyDrawer) {
                closeHistoryBtn.addEventListener('click', () => {
                    this.isHistoryOpen = false;
                    historyDrawer.style.display = 'none';
                });
            }

            if (pauseBtn && targetEl) {
                pauseBtn.addEventListener('click', () => {
                    const tag = '[pause:0.5s]';
                    if (typeof targetEl.selectionStart === 'number') {
                        const start = targetEl.selectionStart;
                        const end = targetEl.selectionEnd;
                        targetEl.value = targetEl.value.substring(0, start) + tag + targetEl.value.substring(end);
                        targetEl.selectionStart = targetEl.selectionEnd = start + tag.length;
                        targetEl.focus();
                    } else {
                        targetEl.value += tag;
                    }
                });
            }

            if (previewBtn) {
                previewBtn.addEventListener('click', async () => {
                    const text = targetEl ? targetEl.value || targetEl.innerText : 'Xin chào! Đây là trải nghiệm giọng đọc trí tuệ nhân tạo Veltrix Voice.';
                    if (!text.trim()) return alert('Vui lòng nhập văn bản để nghe thử!');

                    if (previewTxt) previewTxt.innerText = 'Đang tải...';
                    try {
                        const res = await fetch(`${this.serverUrl}/api/sdk/preview`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': this.apiKey
                            },
                            body: JSON.stringify({ text, voiceId: this.selectedVoice, rate: this.rate, pitch: this.pitch })
                        });

                        if (!res.ok) {
                            const errData = await res.json().catch(() => ({}));
                            throw new Error(errData.error || `HTTP ${res.status}`);
                        }

                        const blob = await res.blob();
                        const audioUrl = URL.createObjectURL(blob);
                        this.loadAudio(container, audioUrl);
                    } catch (err) {
                        alert('⚠️ Lỗi nghe thử âm thanh: ' + err.message);
                    } finally {
                        if (previewTxt) previewTxt.innerText = 'Nghe thử';
                    }
                });
            }

            if (generateBtn) {
                generateBtn.addEventListener('click', async () => {
                    const text = targetEl ? targetEl.value || targetEl.innerText : '';
                    if (!text.trim()) return alert('Vui lòng nhập văn bản để tạo Audio MP3!');

                    if (generateTxt) generateTxt.innerText = 'Đang tạo MP3...';
                    try {
                        const res = await fetch(`${this.serverUrl}/api/sdk/generate`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': this.apiKey
                            },
                            body: JSON.stringify({ text, voiceId: this.selectedVoice, title: 'Web SDK Audio' })
                        });

                        const data = await res.json().catch(() => ({}));
                        if (!res.ok || !data.success) {
                            throw new Error(data.error || `HTTP ${res.status}`);
                        }

                        const downloadUrl = data.audioUrl.startsWith('http') ? data.audioUrl : `${this.serverUrl}${data.audioUrl}`;
                        localStorage.setItem(storageKey, downloadUrl);

                        this.loadAudio(container, downloadUrl);

                        if (this.isHistoryOpen) {
                            this.fetchHistory(container);
                        }

                        const remTokensMsg = data.remainingTokens !== undefined ? `\n(Số dư còn lại: ${data.remainingTokens.toLocaleString()} Token/Ký tự)` : '';
                        alert('🎉 Tạo Audio MP3 thành công!' + remTokensMsg);
                    } catch (err) {
                        alert('⚠️ Lỗi tạo Audio: ' + err.message);
                    } finally {
                        if (generateTxt) generateTxt.innerText = 'Tạo Audio MP3';
                    }
                });
            }
        }
    }

    window.VeltrixTTS = {
        init: (config) => new VeltrixVoiceSDK(config)
    };

    const runAutoInit = () => {
        const script = document.currentScript || Array.from(document.querySelectorAll('script')).find(s => s.src && s.src.includes('veltrix-tts.js'));
        if (script) {
            const apiKey = script.getAttribute('data-apikey');
            const target = script.getAttribute('data-target');
            const serverUrl = script.getAttribute('data-server') || (script.src ? new URL(script.src).origin : '');
            if (apiKey) {
                window.VeltrixTTS.init({ apiKey, target, serverUrl });
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAutoInit);
    } else {
        runAutoInit();
    }
})();
