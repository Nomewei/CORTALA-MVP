// --- ELEMENTOS DEL DOM ---
// Se seleccionan todos los elementos necesarios de la página al iniciar.

// Páginas y Contenedores
const pages = document.querySelectorAll('.page');
const mobileMenu = document.getElementById('mobile-menu');

// Botones y Enlaces
const menuButton = document.getElementById('menu-button');
const closeMenuButton = document.getElementById('close-menu-button');
const startButton = document.getElementById('start-button');
const backToFormBtn = document.getElementById('back-to-form');
const backButtons = document.querySelectorAll('.back-button');
const faqLink = document.getElementById('faq-link');
const testimonialsLink = document.getElementById('testimonials-link');

// Formularios
const customerForm = document.getElementById('customer-form');


// --- FUNCIONES ---

/**
 * Muestra una página específica por su ID y oculta las demás.
 * @param {string} pageId - El ID de la página que se quiere mostrar.
 */
function showPage(pageId) {
    // Ocultar todas las páginas
    pages.forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('flex');
    });

    // Mostrar la página deseada
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.remove('hidden');
        pageToShow.classList.add('flex');
    }

    // Asegurarse de que el menú esté cerrado al cambiar de página
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
    
    // Volver al inicio de la página
    window.scrollTo(0, 0);
}

/**
 * Envía los datos del formulario a un script de Google Sheets.
 * @param {object} data - Los datos del cliente a enviar.
 */
async function sendDataToGoogleSheets(data) {
    // IMPORTANTE: Reemplaza esta URL con la URL de tu Web App de Google Apps Script.
    const googleSheetsUrl = 'URL_DE_TU_GOOGLE_APPS_SCRIPT_AQUI';

    if (googleSheetsUrl === 'URL_DE_TU_GOOGLE_APPS_SCRIPT_AQUI') {
        console.warn('ADVERTENCIA: Debes configurar la URL de Google Apps Script para que el formulario funcione.');
    }

    try {
        await fetch(googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors', // Importante para evitar errores de CORS con Google Scripts
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log('Datos enviados a Google Sheets correctamente.');
    } catch (error) {
        console.error('Error al enviar datos a Google Sheets:', error);
    }
}

// --- LÓGICA DE MERCADO PAGO ---
// IMPORTANTE: Reemplaza 'TU_PUBLIC_KEY' con tu clave pública de Mercado Pago.
const mp = new MercadoPago('TU_PUBLIC_KEY', { locale: 'es-CL' });

/**
 * Inicializa el checkout de Mercado Pago.
 */
async function initializeMercadoPagoCheckout() {
    const loadingElement = document.getElementById('loading-payment');
    const walletContainer = document.getElementById('wallet_container');
    walletContainer.innerHTML = '';
    loadingElement.classList.remove('hidden');

    try {
        // Esta función debe ser reemplazada por una llamada a tu backend.
        const preferenceId = await createPaymentPreference();
        if (!preferenceId) throw new Error('No se pudo obtener el ID de preferencia.');
        
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

/**
 * SIMULACIÓN: Crea una preferencia de pago.
 * En un entorno real, esto debe ocurrir en tu servidor (backend).
 */
async function createPaymentPreference() {
    console.log("Creando preferencia de pago (simulado)...");
    // Este ID es de prueba. Necesitarás generar uno real desde tu backend.
    return "20596395-f6e1e359-5254-4a5d-a486-5f11bd39b935"; 
}

/**
 * Revisa si la URL contiene parámetros de un pago exitoso.
 */
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'approved') {
        showPage('success-page');
        const paymentId = urlParams.get('payment_id');
        console.log(`Pago aprobado: ${paymentId}`);
        // Opcional: Enviar el estado del pago a Google Sheets
        // sendDataToGoogleSheets({ ...customerData, paymentStatus: 'approved', paymentId: paymentId });
    }
}


// --- EVENT LISTENERS (Asignación de eventos) ---
// Se verifica que cada elemento exista antes de asignarle un evento.

// Menú
if (menuButton) {
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.remove('hidden');
    });
}

if (closeMenuButton) {
    closeMenuButton.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
}

if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
        // Cierra el menú solo si se hace clic en el fondo oscuro
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// Navegación principal
if (startButton) {
    startButton.addEventListener('click', () => showPage('form-page'));
}

if (backToFormBtn) {
    backToFormBtn.addEventListener('click', () => showPage('form-page'));
}

if (backButtons) {
    backButtons.forEach(button => {
        button.addEventListener('click', () => showPage('landing-page'));
    });
}

// Navegación desde los enlaces del menú
if (faqLink) {
    faqLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('faq-page');
    });
}

if (testimonialsLink) {
    testimonialsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('testimonials-page');
    });
}

// Formulario
if (customerForm) {
    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(customerForm);
        const customerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            code: formData.get('code'),
            timestamp: new Date().toISOString()
        };
        
        console.log('Datos del cliente:', customerData);
        await sendDataToGoogleSheets(customerData);
        showPage('payment-page');
        initializeMercadoPagoCheckout();
    });
}

// --- INICIALIZACIÓN ---
// Revisa el estado del pago al cargar la página por primera vez.
checkPaymentStatus();
