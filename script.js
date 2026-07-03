// --- Configuration & Constants ---
const DISCOUNT_KEY = "CLIENTEVTM5";
const isCredKeyActive = (key) => {
    if (!key) return false;
    const k = key.toUpperCase().trim();
    return k === "CLIENTEVTM5";
};
const PHONE_NUMBER = "5593996589790";

// --- Help Popup Logic ---
let helpPopupTimer;
const helpPopupDelay = 20000; // 20 seconds

const initHelpPopup = () => {
    const overlay = document.getElementById('help-popup-overlay');
    const closeBtn = document.getElementById('help-popup-close');
    const waLink = document.getElementById('help-wa-link');
    const isDismissed = localStorage.getItem('helpPopupDismissed');

    if (isDismissed) return;

    const waMsg = encodeURIComponent("Olá! Vim pelo site da VTMCred e gostaria de mais informações.");
    waLink.href = `https://wa.me/${PHONE_NUMBER}?text=${waMsg}`;

    const showPopup = () => {
        overlay.classList.add('active');
    };

    const resetTimer = () => {
        if (overlay.classList.contains('active')) return;
        clearTimeout(helpPopupTimer);
        helpPopupTimer = setTimeout(showPopup, helpPopupDelay);
    };

    // Events to reset timer - reset only on user interaction (clicks/touches)
    ['mousedown', 'touchstart'].forEach(name => {
        document.addEventListener(name, resetTimer, true);
    });

    closeBtn.onclick = () => {
        overlay.classList.remove('active');
        localStorage.setItem('helpPopupDismissed', 'true');
    };

    waLink.onclick = () => {
        overlay.classList.remove('active');
        localStorage.setItem('helpPopupDismissed', 'true');
    };

    // Start initial timer
    helpPopupTimer = setTimeout(showPopup, helpPopupDelay);
};

const SLOGAN_PHRASES = [
    "Compromisso claro, Crédito direto",
    "Simples, rápido e sem burocracia",
    "Seu limite pode virar dinheiro",
    "Simule e resolva agora",
    "Transparência em cada parcela"
];

// --- Scramble Effect Logic ---
class TextScrambler {
    constructor(el) {
        this.el = el;
        this.chars = '$%&¥€£0123456789#¢______';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText || "";
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => (this.resolve = resolve));
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 10);
            const end = start + Math.floor(Math.random() * 20);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="opacity-40 font-mono">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

let scrambler = null;
let phraseIndex = 0;
let sloganInterval = null;

const startSloganAnimation = () => {
    const el = document.getElementById('animated-slogan');
    if (!el) return;
    
    // Avoid multiple intervals
    if (sloganInterval) return;

    scrambler = new TextScrambler(el);
    
    const nextPhrase = () => {
        scrambler.setText(SLOGAN_PHRASES[phraseIndex]).then(() => {
            sloganInterval = setTimeout(nextPhrase, 3000);
        });
        phraseIndex = (phraseIndex + 1) % SLOGAN_PHRASES.length;
    };

    nextPhrase();
};

const stopSloganAnimation = () => {
    if (sloganInterval) {
        clearTimeout(sloganInterval);
        sloganInterval = null;
    }
    phraseIndex = 0;
    scrambler = null;
};

const APROXIMACAO_RATES = {
    1: 0.06, 2: 0.12, 3: 0.18, 4: 0.22, 5: 0.26, 6: 0.29,
    7: 0.31, 8: 0.33, 9: 0.34, 10: 0.348, 11: 0.352, 12: 0.356
};

const LINK_RATES = {
    1: 0.07, 2: 0.1422, 3: 0.2089, 4: 0.2530, 5: 0.2968, 6: 0.3294,
    7: 0.3736, 8: 0.4000, 9: 0.4151, 10: 0.4276, 11: 0.4390, 12: 0.4500
};

const BANK_RULES = {
    'Nubank': ['Mastercard'],
    'Inter': ['Mastercard'],
    'C6 Bank': ['Mastercard'],
    'Neon': ['Visa'],
    'PagBank': ['Visa'],
    'Itaú': ['Mastercard', 'Visa', 'Elo'],
    'Bradesco': ['Mastercard', 'Visa', 'Elo'],
    'Santander': ['Mastercard', 'Visa'],
    'Banco do Brasil': ['Visa', 'Mastercard', 'Elo'],
    'Caixa': ['Visa', 'Elo'],
    'Outro': ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outra']
};

// --- State Management ---
let state = {
    step: 'hub',
    amount: 0,
    displayAmount: 0,
    credKey: '',
    loadingMessage: '',
    selectedInstallment: null,
    cardBrand: '',
    cardBank: '',
    cardMethod: '',
    cardAmount: 0,
    cardInstallment: null,
    activeSimulator: 'loan', // 'loan' or 'card'
    showCredKeyInput: false,
    _lastShowCredKeyInput: false,
    // Policy Flow
    showPolicy: false,
    policyStep: 0,
    policyAccepted: [false, false, false, false, false, false, false],
    policyForm: { 
        name: '', cpf: '', phone: '', email: '',
        resRua: '', resBairro: '', resNumero: '', resCep: '',
        trabRua: '', trabBairro: '', trabNumero: '', trabCep: ''
    },
    policyFinalizing: false
};

const POLICY_STEPS = [
    {
        title: "POLÍTICA DE RELACIONAMENTO FINANCEIRO",
        text: `<p class="mb-4">Nesta operação, compromisso vem antes do valor.</p>
               <p class="mb-4">Cada etapa deste processo existe para garantir clareza entre as partes.</p>
               <p class="mb-4">Aqui, palavra tem peso.<br>Prazo tem importância.</p>
               <p>Leia cada etapa com atenção antes de avançar.</p>`,
        footer: "",
        checkbox: "Li e compreendi."
    },
    {
        title: "ANÁLISE DA OPERAÇÃO",
        text: `<ul class="space-y-3">
                <li class="flex gap-2"><span>•</span> <span>Atendimento destinado a clientes CLT</span></li>
                <li class="flex gap-2"><span>•</span> <span>O contracheque será utilizado para análise de perfil</span></li>
                <li class="flex gap-2"><span>•</span> <span>Após a análise, será enviado o valor disponivel</span></li>
                <li class="flex gap-2"><span>•</span> <span>Taxa mensal fixa a depender do valor</span></li>
               </ul>`,
        footer: "A continuidade da operação depende da veracidade das informações enviadas.",
        checkbox: "Concordo com as condições de análise."
    },
    {
        title: "CONDIÇÕES DA OPERAÇÃO",
        text: `<ul class="space-y-3">
                <li class="flex gap-2"><span>•</span> <span>Parcelas com vencimento a cada 30 dias</span></li>
                <li class="flex gap-2"><span>•</span> <span>Alterações de data podem gerar ajuste no valor</span></li>
                <li class="flex gap-2"><span>•</span> <span>Antecipações só geram desconto se pago 15 dias antes da data de vencimento</span></li>
               </ul>`,
        footer: "O acordo firmado define o relacionamento entre as partes.",
        checkbox: "Li e concordo com as condições."
    },
    {
        title: "RESPONSABILIDADE SOBRE PRAZOS",
        text: `<ul class="space-y-3">
                <li class="flex gap-2"><span>•</span> <span>Multa DIÁRIA proporcional a sua parcela será cobrada em caso de atraso</span></li>
                <li class="flex gap-2"><span>•</span> <span>Persistindo o atraso em mais de 50 dias, medidas serão tomadas para recuperação do valor emprestado</span></li>
               </ul>`,
        footer: "Compromissos cumpridos mantêm o relacionamento ativo.",
        checkbox: "Estou ciente das condições em caso de atraso."
    },
    {
        title: "DOCUMENTAÇÃO NECESSÁRIA",
        text: `<ul class="space-y-3">
                <li class="flex gap-2"><span>•</span> <span>Foto do RG ou CNH</span></li>
                <li class="flex gap-2"><span>•</span> <span>Foto segurando RG ou CNH ao lado do rosto</span></li>
                <li class="flex gap-2"><span>•</span> <span>Comprovante de residência atualizado</span></li>
                <li class="flex gap-2"><span>•</span> <span>Foto da frente da residência, deve aparecer o numero da casa</span></li>
                <li class="flex gap-2"><span>•</span> <span>Endereço da empresa onde trabalha</span></li>
                <li class="flex gap-2"><span>•</span> <span>Contato de dois parentes (serão usados apenas caso você perca/troque o número)</span></li>
                <li class="flex gap-2"><span>•</span> <span>E-mail para assinatura</span></li>
               </ul>`,
        footer: "As informações serão utilizadas exclusivamente para formalização da operação.",
        checkbox: "Confirmo que poderei enviar a documentação."
    },
    {
        title: "FORMALIZAÇÃO FINAL",
        text: `<ul class="space-y-3">
                <li class="flex gap-2"><span>•</span> <span>Assinatura digital da nota/promissória</span></li>
                <li class="flex gap-2"><span>•</span> <span>Conferência final dos dados enviados</span></li>
                <li class="flex gap-2"><span>•</span> <span>Validação da operação</span></li>
               </ul>`,
        footer: "A assinatura representa ciência e concordância com todas as etapas anteriores.",
        checkbox: "Concordo com a formalização."
    }
];

const setState = (updates) => {
    const oldStep = state.step;
    const stepChanged = updates.step && updates.step !== state.step;
    state = { ...state, ...updates };

    if (stepChanged) {
        window.scrollTo(0, 0);
        if (state.step === 'amount') {
            state.loanEntryAnimated = false;
            state.activeSimulator = 'loan';
        }
        if (state.step === 'card_amount') {
            state.activeSimulator = 'card';
        }
        if (oldStep === 'amount' && state.step === 'welcome') state.amount = 0; // Reset if going back
        
        // Trigger Loading logic
        if (state.step === 'loading') {
            state.loadingMessage = "Analisando sua simulação";
            render(); // Initial render for first message

            setTimeout(() => {
                state.loadingMessage = "Calculando as melhores condições";
                render();
            }, 1500);

            setTimeout(() => {
                state.loadingMessage = "Quase pronto";
                render();
            }, 3500);

            const duration = 4500 + Math.random() * 1000; // 4.5s to 5.5s to accommodate messages
            setTimeout(() => {
                if (state.activeSimulator === 'card') {
                    setState({ step: 'card_results' });
                } else {
                    setState({ step: 'results' });
                }
            }, duration);
        }
    }
    render();
};

// --- Navigation ---
const goBack = () => {
    const { step, cardMethod, cardBank } = state;
    if (step === 'welcome' || step === 'card_bank') setState({ step: 'hub' });
    else if (step === 'amount') setState({ step: 'welcome' });
    else if (step === 'results') setState({ step: 'amount' });
    else if (step === 'card_brand') setState({ step: 'card_bank' });
    else if (step === 'card_method') {
        const brands = BANK_RULES[cardBank] || [];
        if (brands.length === 1) setState({ step: 'card_bank' });
        else setState({ step: 'card_brand' });
    }
    else if (step === 'card_amount') setState({ step: 'card_method' });
    else if (step === 'card_results') {
        if (cardMethod === 'Aproximação' || cardMethod === 'Inserir Cartão' || cardMethod === 'Link de Pagamento') setState({ step: 'card_amount' });
        else setState({ step: 'card_method' });
    }
};

// --- Logic Helper ---
const formatBRL = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', 'R$ ');

const getProgressiveRate = (val) => {
    if (!val || val <= 0) return 0.40;
    if (val <= 520) {
        return 0.40 - ((val / 520) * 0.18);
    }
    if (val <= 1020) {
        return 0.22 - (((val - 520) / 500) * 0.05);
    }
    if (val <= 1500) {
        return 0.17 - (((val - 1020) / 480) * 0.02);
    }
    if (val <= 2000) {
        return 0.15 - (((val - 1500) / 500) * 0.02);
    }
    if (val <= 2500) {
        return 0.13 - (((val - 2000) / 500) * 0.01);
    }
    return 0.12;
};

// --- Policy Helpers ---
const maskCPF = (val) => {
    let value = val.replace(/\D/g, "");
    value = value.substring(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
};

const maskPhone = (val) => {
    let value = val.replace(/\D/g, "");
    value = value.substring(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const maskCEP = (val) => {
    let value = val.replace(/\D/g, "");
    value = value.substring(0, 8);
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    return value;
};

const updatePolicyForm = () => {
    const { name, cpf, phone, email, resRua, resBairro, resNumero, resCep, trabRua, trabBairro, trabNumero, trabCep } = state.policyForm;
    const btn = document.getElementById('policy-final-submit-btn');
    if (btn) {
        const isValid = name.trim().length > 3 && 
                        cpf.length === 14 && 
                        phone.length >= 14 && 
                        validateEmail(email) &&
                        resRua && resRua.trim().length > 0 &&
                        resBairro && resBairro.trim().length > 0 &&
                        resNumero && resNumero.trim().length > 0 &&
                        resCep && resCep.length === 9 &&
                        trabRua && trabRua.trim().length > 0 &&
                        trabBairro && trabBairro.trim().length > 0 &&
                        trabNumero && trabNumero.trim().length > 0 &&
                        trabCep && trabCep.length === 9;
        btn.disabled = state.policyFinalizing || !isValid;
    }
};

const handlePolicyInput = (field, el) => {
    let val = el.value;
    if (field === 'name') {
        val = val.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    } else if (field === 'cpf') {
        val = maskCPF(val);
    } else if (field === 'phone') {
        val = maskPhone(val);
    } else if (field === 'resCep' || field === 'trabCep') {
        val = maskCEP(val);
    }
    
    el.value = val;
    state.policyForm[field] = val;
    
    if (field === 'email') {
        if (validateEmail(val)) el.classList.remove('erro-input');
        else if (val.length > 0) el.classList.add('erro-input');
    }
    
    updatePolicyForm();
};

const handleCredKeyInput = (val) => {
    setState({ credKey: val });
};

// --- View Injection ---
let currentRenderedStep = null;

const render = () => {
    const container = document.getElementById('app-container');
    const stickyContainer = document.getElementById('sticky-wa-container');
    const subtitleContainer = document.getElementById('header-subtitle-container');
    const btnBack = document.getElementById('btn-back');
    const spacerLeft = document.getElementById('header-spacer-left');

    // Header Logic
    if (state.step === 'hub') {
        btnBack.classList.add('hidden');
        spacerLeft.classList.remove('hidden');
    } else {
        btnBack.classList.remove('hidden');
        spacerLeft.classList.add('hidden');
    }

    // Always ensure the slogan is visible and animating
    if (!document.getElementById('animated-slogan')) {
        subtitleContainer.innerHTML = `<span id="animated-slogan" class="text-white/80 text-[10px] whitespace-nowrap uppercase tracking-[0.2em] font-medium text-center min-h-[1em]"></span>`;
        startSloganAnimation();
    }

    // Optimization: Don't re-render the whole app-container if the step hasn't changed
    // This prevents losing focus on inputs while typing if something else calls render()
    // We ONLY skip re-render for steps that have active inputs
    const typingSteps = ['amount', 'key', 'card_amount'];
    const credKeyToggled = state.step === 'amount' && state.showCredKeyInput !== state._lastShowCredKeyInput;
    
    if (currentRenderedStep === state.step && typingSteps.includes(state.step) && !credKeyToggled) {
        // Update specific bits for the current step to keep it interactive without redraw
        if(state.step === 'amount') {
            const btn = document.getElementById('loan-btn-continue');
            if(btn) btn.disabled = !state.amount || state.amount <= 0;
            
            const isKeyActive = isCredKeyActive(state.credKey);
            const banner = document.getElementById('credkey-success-banner');
            if(banner) {
                if(isKeyActive) banner.classList.remove('hidden');
                else banner.classList.add('hidden');
            }
        }
        if(state.step === 'key') {
            const isKeyActive = isCredKeyActive(state.credKey);
            const banner = document.getElementById('credkey-success-banner');
            if(banner) {
                if(isKeyActive) banner.classList.remove('hidden');
                else banner.classList.add('hidden');
            }
        }
        if(state.step === 'card_amount') {
            const btn = document.getElementById('card-btn-continue');
            if(btn) btn.disabled = !state.cardAmount || state.cardAmount <= 0;
        }
        return;
    }
    
    if (state.step === 'amount') {
        state._lastShowCredKeyInput = state.showCredKeyInput;
    }
    
    currentRenderedStep = state.step;
    
    // Main Content Area
    let content = '';

    if (state.step === 'hub') {
        content = `
            <div class="flex flex-col gap-4 py-2 step-transition opacity-100">
                <div class="text-center mb-1">
                    <p class="text-slate-500 font-medium leading-tight">
                        Simule agora e veja<br>suas opções em segundos
                    </p>
                </div>
                <div class="grid grid-cols-1 gap-4">
                    <button onclick="setState({step: 'welcome'})" class="animate-fade-up delay-100 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 text-left transition-all active:scale-95 group hover:border-fintech-royal">
                        <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-fintech-royal shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <i data-lucide="trending-down" class="lucide-large"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-lg text-slate-800">Simulador Crédito</h3>
                            <p class="text-sm text-slate-500 font-medium">Taxas claras e análise rápida com responsabilidade.</p>
                        </div>
                        <i data-lucide="chevron-right" class="text-slate-300 lucide-small"></i>
                    </button>
                    <button onclick="setState({step: 'card_bank'})" class="animate-fade-up delay-200 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 text-left transition-all active:scale-95 group hover:border-fintech-royal">
                        <div class="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <i data-lucide="credit-card" class="lucide-large"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-lg text-slate-800">Simulador Cartão</h3>
                            <p class="text-sm text-slate-500 font-medium">Converta seu limite em PIX com condições claras.</p>
                        </div>
                        <i data-lucide="chevron-right" class="text-slate-300 lucide-small"></i>
                    </button>
                    <div class="animate-fade-up delay-300 bg-slate-100 p-6 rounded-2xl border border-dashed border-slate-300 flex items-center gap-5 text-left opacity-60">
                        <div class="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                            <i data-lucide="layout-grid" class="lucide-large"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-black text-lg text-slate-400">Em breve...</h3>
                            <p class="text-sm text-slate-400 font-medium">Novas facilidades para o seu dia a dia.</p>
                        </div>
                        <i data-lucide="lock" class="text-slate-300 lucide-small"></i>
                    </div>
                </div>
                <div class="animate-fade-up delay-400 text-center mt-4 flex flex-col items-center gap-5">
                    <button onclick="setState({showPolicy: true, policyStep: 0})" class="text-fintech-royal text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity active:scale-95">
                        Política de Relacionamento Financeiro
                    </button>
                    <a href="https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo site da VTMCred e gostaria de mais informações.')}" target="_blank" class="text-slate-400 hover:text-[#25D366] text-xs font-medium transition-colors inline-block active:scale-95">
                        Precisa de ajuda? <span class="underline">Fale comigo no WhatsApp</span>
                    </a>
                </div>
            </div>
        `;
    } else if (state.step === 'welcome') {
        content = `
            <div class="flex flex-col gap-6 pt-6 step-transition">
                <section>
                    <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-blue-900/5">
                        <p class="text-slate-800 text-lg leading-snug mb-6">
                            Simulação <span class="font-black text-fintech-royal">transparente</span> em segundos, com condições claras.
                        </p>
                        <button onclick="setState({step: 'amount', amount: 0})" class="w-full bg-fintech-btn text-white py-4 rounded-xl font-black text-base hover:shadow-lg hover:shadow-blue-200 transition-all uppercase tracking-widest">
                            SIMULAR AGORA
                        </button>
                    </div>
                </section>
                <section class="mt-2">
                    <div class="grid grid-cols-1 gap-3">
                        <div class="bg-white p-5 rounded-xl border border-slate-100 flex items-center gap-4">
                            <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-fintech-royal shrink-0">
                                <i data-lucide="trending-down"></i>
                            </div>
                            <div>
                                <p class="font-black text-slate-800">Condições Transparentes</p>
                                <p class="text-sm text-slate-500 font-medium">Condições a partir de <span class="font-black text-fintech-royal">15%</span> ao mês.</p>
                            </div>
                        </div>
                        <div class="bg-white p-5 rounded-xl border border-slate-100 flex items-center gap-4">
                            <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                <i data-lucide="check-circle-2"></i>
                            </div>
                            <div>
                                <p class="font-black text-slate-800">Atendimento Digital</p>
                                <p class="text-sm text-slate-500 font-medium">Rápido e direto via WhatsApp.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    } else if (state.step === 'amount') {
        const isKeyActive = isCredKeyActive(state.credKey);

        content = `
            <div class="flex-1 flex flex-col pt-4 step-transition">
                <div class="card bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                    <div class="text-center mb-6">
                        <p class="text-slate-500 font-medium">Informe o valor aprovado para você</p>
                    </div>
                    
                    <div class="relative mb-8 group">
                        <div class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-fintech-royal transition-colors">R$</div>
                        <input 
                            type="number" 
                            value="${state.amount || ''}" 
                            placeholder="0,00"
                            oninput="setState({amount: Number(this.value)})"
                            class="w-full bg-slate-50 border-4 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-3xl font-black text-slate-800 outline-none focus:border-fintech-royal focus:bg-white transition-all placeholder:text-slate-300"
                            autofocus
                        >
                    </div>

                    <div class="space-y-4 mb-10">
                        ${!state.showCredKeyInput && !isKeyActive ? `
                            <div class="text-center">
                                <button onclick="setState({showCredKeyInput: true})" class="text-fintech-royal text-sm font-medium hover:underline transition-all active:scale-95">
                                    Possui uma CredKey? Clique aqui
                                </button>
                            </div>
                        ` : `
                            <div class="relative animate-in fade-in slide-in-from-top-2 duration-300">
                                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <i data-lucide="key" class="lucide-sm"></i>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Digite sua CredKey" 
                                    value="${state.credKey}" 
                                    oninput="handleCredKeyInput(this.value)" 
                                    class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 pl-11 pr-4 font-bold text-slate-700 focus:border-fintech-royal outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                                    autofocus
                                >
                            </div>
                        `}
                        <div id="credkey-success-banner" class="p-3 bg-green-50 text-green-700 rounded-lg text-[10px] font-black border border-green-100 flex items-center justify-center gap-2 ${isKeyActive ? '' : 'hidden'}">
                            <i data-lucide="check-circle-2" class="lucide-xs"></i> VOCÊ ESTÁ USANDO SUA CREDKEY
                        </div>
                    </div>

                    <button id="loan-btn-continue" onclick="setState({step: 'loading'})" ${state.amount <= 0 ? 'disabled' : ''} class="w-full bg-fintech-btn text-white py-5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-30">
                        SIMULAR AGORA <i data-lucide="chevron-right" class="lucide-xs"></i>
                    </button>
                </div>
            </div>
        `;
    } else if (state.step === 'loading') {
        content = `
            <div class="flex-1 flex flex-col items-center justify-center min-h-[400px] step-transition">
                <div class="flex flex-col items-center justify-center gap-8 w-full max-w-[340px] animate-in fade-in zoom-in duration-300">
                    <div class="spinner-modern"></div>
                    <div class="text-center space-y-3">
                        <h2 class="text-xl font-black text-slate-800 transition-all duration-300">${state.loadingMessage || 'Analisando sua simulação'}</h2>
                        <p class="text-sm text-slate-400 font-medium tracking-tight">Aguarde alguns instantes</p>
                    </div>
                </div>
            </div>
        `;
    } else if (state.step === 'results') {
        let currentRate = getProgressiveRate(state.amount);
        let hasDiscount = false;
        
        if (isCredKeyActive(state.credKey)) {
            currentRate = Math.max(0, currentRate - 0.03);
            hasDiscount = true;
        }
        
        const maxInst = state.amount < 200 ? 2 : (state.amount < 1000 ? 5 : 12);
        
        const simList = Array.from({ length: maxInst }, (_, i) => {
            const months = i + 1;
            const total = Math.round(state.amount * (1 + currentRate * months));
            const inst = Math.round(total / months);
            return { months, total, inst };
        });

        content = `
            <div class="flex-1 flex flex-col gap-4 step-transition pt-4">
                ${hasDiscount ? `
                    <div class="animate-in fade-in slide-in-from-top-2 duration-500 bg-fintech-royal/10 border border-fintech-royal/20 rounded-xl p-3 text-center">
                        <p class="text-fintech-royal text-[13px] sm:text-sm font-black whitespace-nowrap">Você está usando sua CredKey</p>
                    </div>
                ` : ''}
                <div class="card bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
                    <header class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-black text-slate-800">Simulação</h2>
                        <div class="text-fintech-royal flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                            <i data-lucide="info" class="lucide-xs"></i>
                            <span class="text-[10px] font-black font-mono">${(currentRate * 100).toFixed(1)}% a.m.</span>
                        </div>
                    </header>
                    
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-400 text-xs font-black uppercase tracking-widest">VALOR TOTAL</span>
                            <span class="text-lg font-black text-fintech-royal">${formatBRL(state.amount)}</span>
                        </div>
                    </div>
                    
                    <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Escolha o parcelamento:</p>
                    
                    <div id="installment-list-loan" class="flex flex-col gap-2 overflow-y-auto max-h-[380px] pb-24 pr-1 custom-scrollbar">
                        ${simList.map(sim => `
                            <div id="inst-loan-${sim.months}" onclick="setState({selectedInstallment: ${sim.months}}); setTimeout(() => document.getElementById('inst-loan-${sim.months}')?.scrollIntoView({behavior: 'smooth', block: 'nearest'}), 50)" class="p-4 rounded-xl border-2 transition-all active:scale-[0.98] cursor-pointer text-left ${state.selectedInstallment === sim.months ? 'border-fintech-royal bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-md font-extrabold text-slate-700">${sim.months}x Parcelas</span>
                                    <span class="text-[10px] font-bold text-slate-400">${formatBRL(sim.total)}</span>
                                </div>
                                <div class="text-2xl font-black text-slate-800">${formatBRL(sim.inst)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (state.step === 'card_brand') {
        const brands = BANK_RULES[state.cardBank] || [];
        content = `
            <div class="flex flex-col gap-6 pt-6 step-transition">
                <div class="px-1">
                    <h2 class="text-lg font-bold text-slate-400 uppercase tracking-tight">Qual a bandeira?</h2>
                    <p class="text-sm text-slate-500 font-medium">${state.cardBank}</p>
                </div>
                <div class="grid grid-cols-1 gap-3">
                    ${brands.map(brand => `
                        <button onclick="setState({cardBrand: '${brand}', step: 'card_method'})" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between font-black text-slate-800 hover:border-fintech-royal active:scale-95 transition-all">
                            <div class="flex items-center gap-3">
                                <i data-lucide="credit-card" class="text-slate-400 lucide-small"></i>
                                ${brand}
                            </div>
                            <i data-lucide="chevron-right" class="text-slate-300 lucide-small"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (state.step === 'card_bank') {
        const banks = Object.keys(BANK_RULES);
        content = `
            <div class="flex flex-col gap-6 pt-6 step-transition">
                <h2 class="text-lg font-bold px-1 text-slate-400 uppercase tracking-tight">Qual o banco?</h2>
                <div class="grid grid-cols-1 gap-3">
                    ${banks.map(bank => {
                        const brands = BANK_RULES[bank];
                        let onClickAction = '';
                        if (brands.length === 1) {
                            onClickAction = `setState({cardBank: '${bank}', cardBrand: '${brands[0]}', step: 'card_method'})`;
                        } else {
                            onClickAction = `setState({cardBank: '${bank}', step: 'card_brand'})`;
                        }
                        return `
                            <button onclick="${onClickAction}" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between font-black text-slate-800 hover:border-fintech-royal active:scale-95 transition-all">
                                <div class="flex items-center gap-3">
                                    <i data-lucide="building-2" class="text-slate-400 lucide-small"></i>
                                    ${bank}
                                </div>
                                <i data-lucide="chevron-right" class="text-slate-300 lucide-small"></i>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else if (state.step === 'card_method') {
        const methods = [
            { id: 'aproximacao', label: 'Aproximação', color: 'text-yellow-500', icon: 'zap' },
            { id: 'inserir', label: 'Inserir Cartão', color: 'text-blue-500', icon: 'credit-card' },
            { id: 'link', label: 'Link de Pagamento', color: 'text-purple-500', icon: 'smartphone' }
        ];
        content = `
            <div class="flex flex-col gap-6 pt-6 step-transition">
                <h2 class="text-lg font-bold px-1 text-slate-400 uppercase tracking-tight">COMO VOCÊ VAI PASSAR SEU CARTÃO?</h2>
                <div class="grid grid-cols-1 gap-4">
                    ${methods.map(m => `
                        <button onclick="setState({cardMethod: '${m.label}', step: 'card_amount'})" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 text-left transition-all active:scale-95 group hover:border-fintech-royal">
                            <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                                <i data-lucide="${m.icon}" class="${m.color}"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-black text-lg text-slate-800">${m.label}</h3>
                            </div>
                            <i data-lucide="chevron-right" class="text-slate-300"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (state.step === 'card_amount') {
        content = `
            <div class="flex-1 flex flex-col pt-4 step-transition">
                <div class="card bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                    <div class="text-center mb-6">
                        <p class="text-slate-500 font-medium">Escolha o valor para receber em PIX</p>
                    </div>
                    
                    <div class="relative mb-8 group">
                        <div class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-fintech-royal transition-colors">R$</div>
                        <input 
                            id="card-amount-input"
                            type="number" 
                            value="${state.cardAmount || ''}" 
                            placeholder="0,00"
                            oninput="state.cardAmount = Number(this.value); document.getElementById('card-btn-continue').disabled = !state.cardAmount || state.cardAmount <= 0"
                            class="w-full bg-slate-50 border-4 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-3xl font-black text-slate-800 outline-none focus:border-fintech-royal focus:bg-white transition-all placeholder:text-slate-300"
                            autofocus
                        >
                    </div>

                    <button id="card-btn-continue" onclick="if(state.cardAmount > 0) setState({step: 'loading'})" ${(!state.cardAmount || state.cardAmount <= 0) ? 'disabled' : ''} class="w-full bg-fintech-btn text-white py-5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-30">
                        SIMULAR AGORA <i data-lucide="chevron-right" class="lucide-xs"></i>
                    </button>
                </div>
            </div>
        `;
    } else if (state.step === 'card_results') {
        const isSpecial = state.cardMethod === 'Aproximação' || state.cardMethod === 'Inserir Cartão' || state.cardMethod === 'Link de Pagamento';
        const rates = state.cardMethod === 'Link de Pagamento' ? LINK_RATES : APROXIMACAO_RATES;
        
        content = `
            <div class="flex flex-col gap-6 pt-6 step-transition">
                <div class="card bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
                    <div class="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="check-circle-2" class="lucide-xl"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-800 mb-2 text-center">Simulação Pronta!</h2>
                    <div class="space-y-3 mb-8 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-400 font-black uppercase text-[10px] tracking-widest">Bandeira:</span>
                            <span class="font-black text-slate-700">${state.cardBrand}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-400 font-black uppercase text-[10px] tracking-widest">Banco:</span>
                            <span class="font-black text-slate-700">${state.cardBank}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-400 font-black uppercase text-[10px] tracking-widest">Método:</span>
                            <span class="font-black text-slate-700">${state.cardMethod}</span>
                        </div>
                        ${state.cardAmount > 0 ? `
                            <div class="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                                <span class="text-slate-400 font-black uppercase text-[10px] tracking-widest">Limite Utilizado:</span>
                                <span class="font-black text-fintech-royal">${formatBRL(state.cardAmount)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${(isSpecial && state.cardAmount > 0) ? `
                        <div class="space-y-4">
                            <p class="text-[11px] text-slate-400 font-black uppercase tracking-widest text-left px-1">Selecione o parcelamento:</p>
                            <div id="installment-list-card" class="flex flex-col gap-2 max-h-[300px] overflow-y-auto pb-24 pr-1 custom-scrollbar">
                                ${Object.entries(rates).map(([months, rate]) => {
                                    const m = Number(months);
                                    const total = state.cardAmount * (1 + rate);
                                    const instValue = total / m;
                                    return `
                                        <div id="inst-card-${m}" onclick="setState({cardInstallment: ${m}}); setTimeout(() => document.getElementById('inst-card-${m}')?.scrollIntoView({behavior: 'smooth', block: 'nearest'}), 50)" class="p-4 rounded-xl border-2 transition-all active:scale-[0.98] cursor-pointer text-left ${state.cardInstallment === m ? 'border-fintech-royal bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="font-extrabold text-lg text-slate-700">${m}x de ${formatBRL(instValue)}</span>
                                                <span class="text-[10px] font-bold text-slate-400 uppercase">${formatBRL(total)}</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="pb-24">
                            <p class="text-sm text-slate-500 mb-4 text-center">Clique no botão abaixo para prosseguir com o seu banco.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // Save scroll positions of specific containers to restore them after re-render
    const scrollPositions = {};
    const containersToPreserve = ['installment-list-loan', 'installment-list-card'];
    containersToPreserve.forEach(id => {
        const el = document.getElementById(id);
        if (el) scrollPositions[id] = el.scrollTop;
    });

    container.innerHTML = content;

    // Trigger loan entry animation if needed
    if (state.step === 'amount' && !state.loanEntryAnimated) {
        state.loanEntryAnimated = true;
        setTimeout(triggerLoanEntryAnimation, 300);
    }

    // Handle Sticky WhatsApp Button
    const isLoanResults = state.step === 'results';
    const isCardResults = state.step === 'card_results';
    const showSticky = (isLoanResults && state.selectedInstallment) || (isCardResults && (state.cardInstallment || (state.cardAmount > 0 && !(state.cardMethod === 'Aproximação' || state.cardMethod === 'Inserir Cartão' || state.cardMethod === 'Link de Pagamento'))));
    
    if (showSticky) {
        const action = isLoanResults ? 'handleSendWA()' : 'handleSendCardWA()';
        const label = isLoanResults ? 'Enviar pelo WhatsApp' : 'Chamar no WhatsApp';
        stickyContainer.innerHTML = `
            <button onclick="${action}" class="sticky-wa-button bg-[#25D366] text-white py-5 px-6 rounded-xl flex items-center justify-center gap-3 text-lg font-bold transition-all active:scale-95 shadow-2xl">
                <i data-lucide="message-circle" class="lucide-large"></i> ${label}
            </button>
        `;
        stickyContainer.classList.add('visible');
    } else {
        stickyContainer.classList.remove('visible');
    }

    // Restore scroll positions
    containersToPreserve.forEach(id => {
        const el = document.getElementById(id);
        if (el && scrollPositions[id] !== undefined) {
            el.scrollTop = scrollPositions[id];
        }
    });

    lucide.createIcons(); // Re-initialize icons
    renderPolicy();
};

const renderPolicy = () => {
    const overlay = document.getElementById('policy-modal-overlay');
    if (state.showPolicy) {
        overlay.classList.add('active');
        
        const totalSteps = POLICY_STEPS.length + 2; // +2 for confirmation step & form step
        const progress = Math.min(100, ((state.policyStep + 1) / totalSteps) * 100);
        
        let stepContent = '';
        
        if (state.policyStep < POLICY_STEPS.length) {
            const step = POLICY_STEPS[state.policyStep];
            stepContent = `
                <div class="flex-1 flex flex-col pt-10">
                    <div class="mb-10">
                        <h2 class="text-2xl font-black text-slate-800 tracking-tight mb-2">${step.title}</h2>
                        <div class="policy-progress-bar mt-6">
                            <div class="policy-progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex-1 text-slate-600 font-medium leading-relaxed mb-8">
                        ${step.text}
                        ${step.footer ? `<p class="mt-8 pt-6 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">${step.footer}</p>` : ''}
                    </div>
                    
                    <div class="mt-auto space-y-6">
                        <label class="flex items-center gap-4 cursor-pointer group">
                            <input type="checkbox" ${state.policyAccepted[state.policyStep] ? 'checked' : ''} onchange="state.policyAccepted[${state.policyStep}] = this.checked; renderPolicy()" class="policy-checkbox">
                            <span class="text-sm font-bold text-slate-800 group-hover:text-fintech-royal transition-colors">${step.checkbox}</span>
                        </label>
                        
                        <button onclick="setState({policyStep: state.policyStep + 1})" ${!state.policyAccepted[state.policyStep] ? 'disabled' : ''} class="w-full bg-fintech-btn text-white py-5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-30">
                            CONTINUAR <i data-lucide="chevron-right" class="lucide-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        } else if (state.policyStep === POLICY_STEPS.length) {
            // Confirmation Screen
            stepContent = `
                <div class="flex-1 flex flex-col pt-10">
                    <div class="mb-10">
                        <h2 class="text-2xl font-black text-slate-800 tracking-tight mb-2">CONFIRMAÇÃO FINAL</h2>
                        <div class="policy-progress-bar mt-6">
                            <div class="policy-progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex-1 mb-8">
                        <p class="text-slate-600 font-medium leading-relaxed mb-8">
                            Ao concluir esta etapa, você confirma que:
                        </p>
                        <ul class="space-y-3 text-slate-800 font-bold mb-10">
                            <li class="flex gap-3 items-center"><i data-lucide="check" class="text-fintech-royal w-5 h-5 shrink-0"></i> Leu todas as condições</li>
                            <li class="flex gap-3 items-center"><i data-lucide="check" class="text-fintech-royal w-5 h-5 shrink-0"></i> Entendeu as regras da operação</li>
                            <li class="flex gap-3 items-center"><i data-lucide="check" class="text-fintech-royal w-5 h-5 shrink-0"></i> Concorda com os termos apresentados</li>
                            <li class="flex gap-3 items-center"><i data-lucide="check" class="text-fintech-royal w-5 h-5 shrink-0"></i> Assume responsabilidade pelos compromissos firmados</li>
                        </ul>
                    </div>
                    
                    <div class="mt-auto space-y-6">
                        <label class="flex items-center gap-4 cursor-pointer group">
                            <input type="checkbox" ${state.policyAccepted[6] ? 'checked' : ''} onchange="state.policyAccepted[6] = this.checked; renderPolicy()" class="policy-checkbox">
                            <span class="text-sm font-bold text-slate-800 group-hover:text-fintech-royal transition-colors">Confirmo e concordo com todos os termos acima.</span>
                        </label>
                        
                        <button onclick="setState({policyStep: 7})" ${!state.policyAccepted[6] ? 'disabled' : ''} class="w-full bg-fintech-btn text-white py-5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-30">
                            CONTINUAR PARA OS DADOS <i data-lucide="chevron-right" class="lucide-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        } else if (state.policyStep === POLICY_STEPS.length + 1) {
            // Form Screen
            stepContent = `
                <div class="flex-1 flex flex-col pt-10">
                    <div class="mb-6">
                        <h2 class="text-2xl font-black text-slate-800 tracking-tight mb-2">PREENCHIMENTO DE DADOS</h2>
                        <div class="policy-progress-bar mt-4">
                            <div class="policy-progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex-1 mb-6">
                        <p class="text-slate-600 font-medium leading-relaxed mb-6">
                            Insira suas informações para finalização do envio seguro ao credor:
                        </p>
                        
                        <div class="space-y-4">
                            <input id="policy-name" type="text" placeholder="Nome Completo" value="${state.policyForm.name}" oninput="handlePolicyInput('name', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                            <input id="policy-cpf" type="text" placeholder="CPF" value="${state.policyForm.cpf}" oninput="handlePolicyInput('cpf', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                            <input id="policy-phone" type="tel" placeholder="Telefone" value="${state.policyForm.phone}" oninput="handlePolicyInput('phone', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                            <input id="policy-email" type="email" placeholder="E-mail" value="${state.policyForm.email}" oninput="handlePolicyInput('email', this)" onblur="if(!validateEmail(this.value)) this.classList.add('erro-input'); else this.classList.remove('erro-input')" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                            
                            <div class="border-t border-slate-100 pt-4 mt-4 text-left">
                                <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Endereço Residencial</p>
                                <div class="grid grid-cols-1 gap-3">
                                    <input id="policy-res-rua" type="text" placeholder="Rua / Avenida" value="${state.policyForm.resRua || ''}" oninput="handlePolicyInput('resRua', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                    <div class="grid grid-cols-2 gap-2">
                                        <input id="policy-res-bairro" type="text" placeholder="Bairro" value="${state.policyForm.resBairro || ''}" oninput="handlePolicyInput('resBairro', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                        <input id="policy-res-numero" type="text" placeholder="Número" value="${state.policyForm.resNumero || ''}" oninput="handlePolicyInput('resNumero', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                    </div>
                                    <input id="policy-res-cep" type="text" placeholder="CEP" value="${state.policyForm.resCep || ''}" oninput="handlePolicyInput('resCep', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                </div>
                            </div>

                            <div class="border-t border-slate-100 pt-4 mt-4 text-left">
                                <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Endereço de Trabalho</p>
                                <div class="grid grid-cols-1 gap-3">
                                    <input id="policy-trab-rua" type="text" placeholder="Rua / Avenida (Trabalho)" value="${state.policyForm.trabRua || ''}" oninput="handlePolicyInput('trabRua', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                    <div class="grid grid-cols-2 gap-2">
                                        <input id="policy-trab-bairro" type="text" placeholder="Bairro (Trabalho)" value="${state.policyForm.trabBairro || ''}" oninput="handlePolicyInput('trabBairro', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                        <input id="policy-trab-numero" type="text" placeholder="Número (Trabalho)" value="${state.policyForm.trabNumero || ''}" oninput="handlePolicyInput('trabNumero', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                    </div>
                                    <input id="policy-trab-cep" type="text" placeholder="CEP (Trabalho)" value="${state.policyForm.trabCep || ''}" oninput="handlePolicyInput('trabCep', this)" class="policy-input" autocomplete="off" autocorrect="off" spellcheck="false">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-auto">
                        <button id="policy-final-submit-btn" onclick="handlePolicySubmit()" ${state.policyFinalizing || !state.policyForm.name || !state.policyForm.cpf || !state.policyForm.phone || !state.policyForm.email || !validateEmail(state.policyForm.email) || !state.policyForm.resRua || !state.policyForm.resBairro || !state.policyForm.resNumero || !state.policyForm.resCep || state.policyForm.resCep.length !== 9 || !state.policyForm.trabRua || !state.policyForm.trabBairro || !state.policyForm.trabNumero || !state.policyForm.trabCep || state.policyForm.trabCep.length !== 9 ? 'disabled' : ''} class="w-full bg-fintech-btn text-white py-5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-30">
                            ${state.policyFinalizing ? '<div class="spinner-modern !w-5 !h-5 !border-2"></div> PROCESSANDO...' : 'ENVIAR PARA O CREDOR'}
                        </button>
                        
                        ${state.policyFinalizing ? `
                            <p class="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 animate-pulse">
                                Seu registro foi preparado.<br>Finalize o envio pelo WhatsApp.
                            </p>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            // Success Screen
            stepContent = `
                <div class="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    <div class="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8">
                        <i data-lucide="check" class="w-10 h-10"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-800 tracking-tight mb-4">Registro enviado<br>com sucesso.</h2>
                    <p class="text-slate-500 font-medium leading-relaxed max-w-[280px]">
                        O compromisso começa antes da assinatura.
                    </p>
                    
                    <button onclick="setState({showPolicy: false, policyStep: 0, policyAccepted: [false, false, false, false, false, false, false], policyForm: { name: '', cpf: '', phone: '', email: '', resRua: '', resBairro: '', resNumero: '', resCep: '', trabRua: '', trabBairro: '', trabNumero: '', trabCep: '' }})" class="mt-12 w-full max-w-[200px] border-2 border-slate-200 text-slate-400 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                        FECHAR
                    </button>
                </div>
            `;
        }

        const isSuccessScreen = state.policyStep > POLICY_STEPS.length + 1;

        overlay.innerHTML = `
            <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                <button onclick="if(state.policyStep > 0) { setState({policyStep: state.policyStep - 1}); } else { setState({showPolicy: false}); }" class="p-2 text-slate-400 ${isSuccessScreen ? 'invisible' : ''}">
                    <i data-lucide="arrow-left"></i>
                </button>
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest titulo-politica">Código VTMCred.</span>
                <button onclick="setState({showPolicy: false})" class="p-2 text-slate-400">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="policy-card animate-in fade-in duration-500">
                ${stepContent}
            </div>
        `;
        
        lucide.createIcons();
    } else {
        overlay.classList.remove('active');
        overlay.innerHTML = '';
    }
};

// --- Event Handlers ---
document.getElementById('btn-back').addEventListener('click', goBack);

const handleSendWA = () => {
    let currentRate = getProgressiveRate(state.amount);
    let hasDiscount = false;
    
    if (isCredKeyActive(state.credKey)) {
        currentRate = Math.max(0, currentRate - 0.03);
        hasDiscount = true;
    }
    
    const months = state.selectedInstallment;
    const total = Math.round(state.amount * (1 + currentRate * months));
    const inst = Math.round(total / months);
    
    const discountLine = hasDiscount ? `\n\n*CredKey Aplicada*` : '';
    const msg = `Fiz uma simulação no *VTMCred*.\n\nResumo da simulação:\n\n* Valor: *${formatBRL(state.amount)}*\n* Parcelamento: *${months}x* de *${formatBRL(inst)}*\n* Total: *${formatBRL(total)}*${discountLine}\n\nGostaria de seguir com a contratação.`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
};

const handleSendCardWA = () => {
    let msg = '';
    const valUsed = state.cardAmount > 0 ? formatBRL(state.cardAmount) : 'Não informado';
    
    if (state.cardInstallment) {
        const m = state.cardInstallment;
        const rates = state.cardMethod === 'Link de Pagamento' ? LINK_RATES : APROXIMACAO_RATES;
        const rate = rates[m];
        const total = state.cardAmount * (1 + rate);
        const instValue = total / m;
        
        msg = `Fiz uma simulação para Cartão no *VTMCred*.\n\nResumo da simulação:\n\n* Valor utilizado: *${valUsed}*\n* Método: *${state.cardMethod}*\n* Bandeira: *${state.cardBrand}*\n* Banco: *${state.cardBank}*\n\nParcelamento:\n\n* ${m}x de *${formatBRL(instValue)}*\n* Total: *${formatBRL(total)}*\n\nGostaria de seguir com a contratação.`;
    } else {
        msg = `Fiz uma simulação para Cartão no *VTMCred*.\n\nResumo da simulação:\n\n* Valor utilizado: *${valUsed}*\n* Método: *${state.cardMethod}*\n* Bandeira: *${state.cardBrand}*\n* Banco: *${state.cardBank}*\n\nGostaria de seguir com a contratação.`;
    }
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
};

const handlePolicySubmit = () => {
    const { name, cpf, phone, email, resRua, resBairro, resNumero, resCep, trabRua, trabBairro, trabNumero, trabCep } = state.policyForm;
    if (!name || !cpf || !phone || !email || !resRua || !resBairro || !resNumero || !resCep || !trabRua || !trabBairro || !trabNumero || !trabCep) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    setState({ policyFinalizing: true });

    const now = new Date();
    const dateStr = now.toLocaleString('pt-BR');

    const uName = name.toUpperCase().trim();
    const uCpf = cpf.toUpperCase().trim();
    const uPhone = phone.toUpperCase().trim();
    const uEmail = email.toUpperCase().trim();
    const uRes = `Rua ${resRua}, Bairro ${resBairro}, Nº ${resNumero}, CEP ${resCep}`.toUpperCase().trim();
    const uTrab = `Rua ${trabRua}, Bairro ${trabBairro}, Nº ${trabNumero}, CEP ${trabCep}`.toUpperCase().trim();

    const msg = `*CÓDIGO VTMCRED — ACEITAÇÃO DE TERMOS*\n\n` +
                `Eu, *${name.toUpperCase()}*, portador do CPF *${cpf}*, declaro que li as políticas de relacionamento financeiro do VTMCred e aceito integralmente os termos conforme detalhado abaixo:\n\n` +
                
                `*1. SOBRE O COMPROMISSO:* Eu vi e entendi que nesta operação o compromisso vem antes do valor. Compreendo que cada etapa deste processo garante clareza entre as partes e aceito que minha palavra tem peso e meus prazos têm importância. *ACEITO OS TERMOS E COMPROMISSOS.*\n\n` +
                
                `*2. ANÁLISE DA OPERAÇÃO:* Estou ciente de que o atendimento é destinado a clientes CLT e que meu contracheque será utilizado para análise de perfil. Compreendo que após a análise, será enviado o valor disponível. Aceito que a taxa mensal é fixa a depender do valor e entendo que a continuidade da operação depende da total veracidade das informações que enviei. *ACEITO E CONCORDO COM AS CONDIÇÕES DE ANÁLISE.*\n\n` +
                
                `*3. CONDIÇÕES DA OPERAÇÃO:* Eu concordo que as parcelas terão vencimento a cada 30 dias. Entendo que alterações de data podem gerar ajuste no valor e estou ciente de que antecipações só geram desconto se pago 15 dias antes da data de vencimento. *ACEITO AS CONDIÇÕES DA OPERAÇÃO.*\n\n` +
                
                `*4. RESPONSABILIDADE SOBRE PRAZOS:* Eu assumo a responsabilidade sobre os prazos e estou totalmente ciente de que multa DIÁRIA proporcional a minha parcela será cobrada em caso de atraso. Entendo que, persistindo o atraso em mais de 50 dias, medidas serão tomadas para recuperação do valor emprestado. *ESTOU CIENTE E ACEITO AS RESPONSABILIDADES SOBRE ATRASOS.*\n\n` +
                
                `*5. DOCUMENTAÇÃO NECESSÁRIA:* Confirmo que possuo e enviarei foto do RG ou CNH, foto segurando RG ou CNH ao lado do rosto, comprovante de residência atualizado, foto da frente da residência (onde deve aparecer o número da casa), endereço da empresa onde trabalha, contato de dois parentes (serão usados apenas caso eu perca ou troque o número) e e-mail para assinatura. *ACEITO E CONFIRMO O ENVIO DA DOCUMENTAÇÃO COMPLETA.*\n\n` +
                
                `*6. FORMALIZAÇÃO:* Eu concordo com a formalização final através de assinatura digital da nota/promissória e validação dos dados. *CONCORDO COM A FORMALIZAÇÃO FINAL.*\n\n` +
                
                `*MEUS DADOS:*\n` +
                `Nome: \`${uName}\`\n` +
                `CPF: \`${uCpf}\`\n` +
                `Telefone: \`${uPhone}\`\n` +
                `E-mail: \`${uEmail}\`\n` +
                `Endereço Residencial: \`${uRes}\`\n` +
                `Endereço Comercial/Trabalho: \`${uTrab}\`\n\n` +
                `*Data/Hora do Aceite:* ${dateStr}\n\n` +
                `_Registro individual de aceitação realizado via plataforma VTMCred._`;

    // Open window instantly on the user click thread to completely bypass browser popup blocking
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setState({ policyStep: POLICY_STEPS.length + 1, policyFinalizing: false });
};

// --- Animations helper ---
const triggerLoanEntryAnimation = () => {
    // Add custom helper animation logic if any elements need specific staggered entries
};

// --- Initial Render ---
initHelpPopup();
render();
