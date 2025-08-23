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
    
    // Elementos para el Upsell (Protección Extra)
    const addExtraCheckbox = document.getElementById('add-extra');
    const extraFields = document.getElementById('extra-fields');
    const summaryExtraContainer = document.getElementById('summary-extra-container');
    const summaryTotalPrice = document.getElementById('summary-total-price');

    // --- VARIABLES DE ESTADO ---
    let finalSalePrice = 14990;

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
    // IMPORTANTE: Reemplaza 'TU_PUBLIC_KEY' con tu llave pública (empieza con APP-...)
    const mp = new MercadoPago('APP_USR-c42e4b7c-df24-4197-a39d-1eff0afed906', { locale: 'es-CL' });

    async function initializeMercadoPagoCheckout(amount) {
        const loadingElement = document.getElementById('loading-payment');
        const walletContainer = document.getElementById('wallet_container');
        walletContainer.innerHTML = '';
        loadingElement.classList.remove('hidden');
        try {
            const preferenceId = await createPaymentPreference(amount);
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

    async function createPaymentPreference(amount) {
        try {
            const backendUrl = 'https://cortala-mvp-4kgg.onrender.com/create_preference';
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Servicio de Privacidad Cortala.cl',
                    quantity: 1,
                    unit_price: amount
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

    function updatePriceSummary() {
        const basePrice = 14990;
        const extraPrice = 4990;
        const formatCurrency = (value) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

        if (addExtraCheckbox.checked) {
            finalSalePrice = basePrice + extraPrice;
            summaryExtraContainer.classList.remove('hidden');
        } else {
            finalSalePrice = basePrice;
            summaryExtraContainer.classList.add('hidden');
        }
        summaryTotalPrice.textContent = formatCurrency(finalSalePrice);
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

    // Event listener para el checkbox de Protección Extra
    if (addExtraCheckbox) {
        addExtraCheckbox.addEventListener('change', () => {
            extraFields.classList.toggle('hidden', !addExtraCheckbox.checked);
        });
    }

    if (customerForm) {
        customerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!termsCheckbox.checked) {
                termsError.classList.remove('hidden');
                return;
            } else {
                termsError.classList.add('hidden');
            }
            
            updatePriceSummary();

            const formData = new FormData(customerForm);
            const customerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                code: formData.get('code'),
                timestamp: new Date().toISOString(),
                saleValue: finalSalePrice,
                extraEmail: formData.get('extra-email') || '',
                extraPhone: formData.get('extra-phone') || ''
            };
            
            await sendDataToGoogleSheets(customerData);
            showPage('payment-page');
            await initializeMercadoPagoCheckout(finalSalePrice);
        });
    }

    // --- INICIALIZACIÓN ---
    checkPaymentStatus();
});
