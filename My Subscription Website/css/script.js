const swiper = new Swiper('.swiper-container', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 30,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
    grabCursor: true,
    // Responsive breakpoints
    breakpoints: {
        // when window width is >= 640px
        640: {
            slidesPerView: 2,
            spaceBetween: 30,
        },
        // when window width is >= 1024px
        1024: {
            slidesPerView: 3,
            spaceBetween: 35,
        },
    },
    // Add pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

// --- Modal Logic ---

// 1. Define the data for each deal
const dealData = {
    icloud: {
        title: 'iCloud+ Storage',
        description: 'Get 2TB of iCloud storage to securely keep all your files, photos, and backups in one place. Share with your family at no extra cost.',
        price: '$9.99',
        buttonClass: 'button-icloud'
    },
    applemusic: {
        title: 'Apple Music Family',
        description: 'Enjoy unlimited, ad-free access to over 90 million songs. Download your favorite tracks and listen offline.',
        price: '$14.99',
        buttonClass: 'button-applemusic'
    },
    netflix: {
        title: 'Netflix Premium',
        description: 'Watch on 4 screens at a time in stunning 4K Ultra HD. Download your favorite shows and movies to watch on the go.',
        price: '$15.99',
        buttonClass: 'button-netflix'
    },
    spotify: {
        title: 'Spotify Premium',
        description: 'Listen without limits. Enjoy ad-free music, offline listening, and on-demand playback for all your favorite artists.',
        price: '$9.99',
        buttonClass: 'button-spotify'
    }
};

// 2. Get all the necessary elements from the DOM
const modalOverlay = document.getElementById('deal-modal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalPrice = document.getElementById('modal-price');
const modalCheckoutButton = document.getElementById('modal-checkout-button');
const closeModalButton = document.querySelector('.modal-close');
const buyButtons = document.querySelectorAll('.card-button[data-deal]');

// 3. Function to open the modal with specific deal info
function openModal(dealId) {
    const data = dealData[dealId];
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalPrice.textContent = data.price;
    modalCheckoutButton.className = `card-button ${data.buttonClass}`; // Apply button style
    modalOverlay.classList.add('visible');
}

// 4. Function to close the modal
const closeModal = () => modalOverlay.classList.remove('visible');

// 5. Add event listeners
buyButtons.forEach(button => button.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(e.currentTarget.dataset.deal);
}));

closeModalButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal(); // Close if overlay is clicked
});

// --- Contact Form Logic ---
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    const formStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            formStatus.textContent = '';
            formStatus.className = '';

            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = "Thanks for your message! I'll get back to you soon.";
                formStatus.classList.add('status-success');
                form.reset();
            } else {
                throw new Error('Network response was not ok.');
            }
        } catch (error) {
            formStatus.textContent = 'Oops! There was a problem submitting your form. Please try again.';
            formStatus.classList.add('status-error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// --- AI Chatbot Logic ---
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');

if (chatbotToggle) {
    // --- Bot "Brain" ---
    // This is a simple rule-based bot. It looks for keywords in the user's message.
    const getBotResponse = (userInput) => {
        const text = userInput.toLowerCase().trim();
        const productKeywords = Object.keys(dealData); // ['icloud', 'applemusic', ...]
        let identifiedProduct = null;

        for (const product of productKeywords) {
            // Handle "apple music" as a special case with a space
            const productName = product === 'applemusic' ? 'apple music' : product;
            if (text.includes(productName)) {
                identifiedProduct = product;
                break;
            }
        }

        // --- Intent: Buying a product ---
        if (text.includes('buy') || text.includes('purchase') || text.includes('order') || text.includes('get')) {
            if (identifiedProduct) {
                return {
                    text: `Great! I'll open the checkout for ${dealData[identifiedProduct].title}.`,
                    action: { type: 'openModal', payload: identifiedProduct }
                };
            }
            return { text: "Awesome! Which subscription deal would you like to purchase? (e.g., Netflix, Spotify)" };
        }

        // --- Intent: Asking about a specific product ---
        if (identifiedProduct) {
            const deal = dealData[identifiedProduct];
            return { text: `${deal.description} The price is ${deal.price}/month. You can say "buy ${deal.title}" to purchase.` };
        }

        // --- General Keywords ---
        if (text.includes('hello') || text.includes('hi')) {
            return { text: "Hi there! How can I assist you with our deals today?" };
        }
        if (text.includes('deals')) {
            return { text: "We offer great deals on iCloud+, Apple Music, Netflix, and Spotify. Which one are you interested in?" };
        }
        if (text.includes('price') || text.includes('pricing')) {
            return { text: "Prices vary per service. For example, Netflix Premium is $15.99/month. Which service's price are you interested in?" };
        }
        if (text.includes('how')) {
            return { text: "You can browse our deals on the main page. Click 'BUY NOW' on any deal to see more details and proceed to checkout. You can also ask me to 'buy Netflix' directly!" };
        }
        if (text.includes('contact')) {
            return { text: "You can get in touch with us using the contact form on the 'About Us' page. We'll get back to you as soon as possible!" };
        }

        // --- Default Response ---
        return { text: "I'm not sure how to answer that. I can help with questions about our deals (Netflix, Spotify, etc.), pricing, and purchasing. How can I help?" };
    };

    // --- UI Functions ---
    const toggleChatbot = () => chatbotContainer.classList.toggle('visible');

    const addMessage = (text, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = text;
        chatbotMessages.appendChild(messageElement);
        // Scroll to the bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const handleUserMessage = () => {
        const userInput = chatbotInput.value.trim();
        if (!userInput) return;

        addMessage(userInput, 'user');
        chatbotInput.value = '';

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('bot-typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Get and display bot response after a short delay
        setTimeout(() => {
            // Remove typing indicator
            chatbotMessages.removeChild(typingIndicator);

            const response = getBotResponse(userInput);
            addMessage(response.text, 'bot');

            // Execute an action if the bot provided one
            if (response.action && response.action.type === 'openModal') {
                // Add a small delay before opening the modal for a smoother feel
                setTimeout(() => {
                    if (!modalOverlay.classList.contains('visible')) {
                        openModal(response.action.payload);
                    }
                }, 300);
            }
        }, 1000);
    };

    // --- Event Listeners ---
    chatbotToggle.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);
    chatbotSend.addEventListener('click', handleUserMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
    
    // Handle clicks on suggested questions
    chatbotMessages.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.closest('.suggested-questions')) {
            const question = e.target.textContent;
            chatbotInput.value = question;
            handleUserMessage();
        }
    });

    // Close chatbot if user clicks outside of it
    document.addEventListener('click', (e) => {
        if (chatbotContainer.classList.contains('visible')) {
            if (!chatbotContainer.contains(e.target) && !chatbotToggle.contains(e.target)) {
                toggleChatbot();
            }
        }
    });
}