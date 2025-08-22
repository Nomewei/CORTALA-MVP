// --- Envoltura para asegurar que el DOM esté cargado ---
document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const pages = document.querySelectorAll('.page');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuButton = document.getElementById('menu-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const startButton = document.getElementById('start-button');
    const backToFormBtn = document.getElementById('back-to-form');
    const backButtons = document.querySelectorAll('.back-button');
    const faqLink = document.getElementById('faq-link');
    const testimonialsLink = document.getElementById('testimonials-link');
    const contactLink = document.getElementById('contact-link');
    const termsLink = document.getElementById('terms-link');
    const termsLinkFromForm = document.getElementById('terms-link-from-form');
    const customerForm = document.getElementById('customer-form');
    const termsCheckbox = document.getElementById('terms');
    const termsError = document.getElementById('terms-error');

    // --- FUNCIONES ---

    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.add('hidden');
            page.classList.remove('flex');
        });
        const pageToShow = document.getElementById(pageId);
        if (pageToShow) {
            pageToShow.classList.remove('hidden');
            pageToShow.classList.add('flex');
        }
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
        window.scrollTo(0, 0);
    }

    async function sendDataToGoogleSheets(data) {
        const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbwa3nPrEHSGMtD_52-znhrMF2Yd2eMHlGL-zC82vX41yhltKhkkh6_ifFWaEyLY_2bTbw/exec';
        if (googleSheetsUrl === 'https://script.google.com/macros/s/AKfycbwa3nPrEHSGMtD_52-znhrMF2Yd2eMHlGL-zC82vX41yhltKhkkh6_ifFWaEyLY_2bTbw/exec') {
            console.warn('ADVERTENCIA: Debes configurar la URL de Google Apps Script.');
            return; // No continuar si la URL no está configurada
        }
        try {
            await fetch(googleSheetsUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log('Datos enviados a Google Sheets.');
        } catch (error) {
            console.error('Error al enviar datos a Google Sheets:', error);
        }
    }

    // --- LÓGICA DE MERCADO PAGO ---
    const mp = new MercadoPago('APP_USR-c42e4b7c-df24-4197-a39d-1eff0afed906', { locale: 'es-CL' });

    async function initializeMercadoPagoCheckout() {
        const loadingElement = document.getElementById('loading-payment');
        const walletContainer = document.getElementById('wallet_container');
        walletContainer.innerHTML = '';
        loadingElement.classList.remove('hidden');
        try {
            const preferenceId = await createPaymentPreference();
            if (!preferenceId) {
                throw new Error('No se pudo obtener el ID de preferencia.');
            }
            mp.bricks().create("wallet", "wallet_container", {
                initialization: { preferenceId: preferenceId },
                callbacks: {
                    onReady: () => loadingElement.classList.add('hidden'),
                    onError: (error) => {
                        console.error('Error en checkout de Mercado Pago:', error);
                        walletContainer.innerHTML = "<p class='text-red-500'>Ocurrió un error al procesar el pago.</p>";
                    },
                },
            });
        } catch (error) {
            console.error('Error al inicializar Mercado Pago:', error);
            loadingElement.innerText = 'Error al cargar el checkout. Intenta de nuevo.';
        }
    }

    async function createPaymentPreference() {
        try {
            const backendUrl = 'URL_DE_TU_BACKEND_EN_RENDER_AQUI/create_preference';
            if (backendUrl.includes('URL_DE_TU_BACKEND_EN_RENDER_AQUI')) {
                console.error("Error: La URL del backend no está configurada.");
                return null;
            }
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Servicio de Privacidad Cortala.cl',
                    quantity: 1,
                    unit_price: 14990
                })
            });
            if (!response.ok) throw new Error('La respuesta del servidor no fue exitosa');
            const preference = await response.json();
            return preference.id;
        } catch (error) {
            console.error("Error al crear la preferencia de pago:", error);
            return null;
        }
    }

    function checkPaymentStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('status') === 'approved') {
            showPage('success-page');
            const paymentId = urlParams.get('payment_id');
            console.log(`Pago aprobado: ${paymentId}`);
        }
    }

    // --- EVENT LISTENERS ---
    if (menuButton) menuButton.addEventListener('click', (e) => { e.stopPropagation(); mobileMenu.classList.remove('hidden'); });
    if (closeMenuButton) closeMenuButton.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    if (mobileMenu) mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) mobileMenu.classList.add('hidden'); });
    if (startButton) startButton.addEventListener('click', () => showPage('form-page'));
    if (backToFormBtn) backToFormBtn.addEventListener('click', () => showPage('form-page'));
    if (backButtons) backButtons.forEach(button => button.addEventListener('click', () => showPage('landing-page')));
    if (faqLink) faqLink.addEventListener('click', (e) => { e.preventDefault(); showPage('faq-page'); });
    if (testimonialsLink) testimonialsLink.addEventListener('click', (e) => { e.preventDefault(); showPage('testimonials-page'); });
    if (contactLink) contactLink.addEventListener('click', (e) => { e.preventDefault(); showPage('contact-page'); });
    if (termsLink) termsLink.addEventListener('click', (e) => { e.preventDefault(); showPage('terms-page'); });
    if (termsLinkFromForm) termsLinkFromForm.addEventListener('click', (e) => { e.preventDefault(); showPage('terms-page'); });

    if (customerForm) {
        customerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!termsCheckbox.checked) {
                termsError.classList.remove('hidden');
                return;
            } else {
                termsError.classList.add('hidden');
            }

            const formData = new FormData(customerForm);
            const customerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                code: formData.get('code'),
                timestamp: new Date().toISOString(),
                saleValue: '14990' 
            };
            
            await sendDataToGoogleSheets(customerData);
            showPage('payment-page');
            await initializeMercadoPagoCheckout();
        });
    }

    // --- INICIALIZACIÓN ---
    checkPaymentStatus();
});
