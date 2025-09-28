// Simple import for constant responses (no external API calls needed)
// import axios from "axios"; // Not needed for constant responses

// Store conversation history in memory (in production, use a database)
const conversationHistory = new Map();

// Sample responses for the AgriAssist bot (fallback responses)
const botResponses = [
    "Hello farmer! How was your day going? Use AgriAssist app daily for better crop analysis.",
    "Welcome to AgriAssist! I'm here to help you with your farming needs. How can I assist you today?",
    "Good day, farmer! Remember to check your soil moisture levels regularly. AgriAssist is here to guide you!",
    "Greetings! Your crops are looking great today. Let me know if you need any agricultural advice.",
    "Hello there! AgriAssist recommends checking weather patterns for optimal planting schedules.",
    "Hi farmer! Don't forget to monitor your crop health using our advanced analysis tools.",
    "Welcome back! AgriAssist is ready to help you maximize your harvest yield this season."
];

// Function to get a random bot response (fallback)
const getRandomBotResponse = () => {
    const randomIndex = Math.floor(Math.random() * botResponses.length);
    return botResponses[randomIndex];
};

// Text-only AI Response Controller
export const getAIResponse = async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        console.log("Received text message:", message);
        console.log("Session ID:", sessionId);

        // Validate input
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message is required",
                replyText: "Please ask me something about farming!"
            });
        }

        // Get or create conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, []);
        }
        
        const history = conversationHistory.get(sessionId);
        
        // Add user message to history
        history.push({ role: "user", content: message });

        // Keep only last 10 messages to manage context size
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }

        // Build conversation context with system prompt
        const systemMessage = {
            role: "system",
            content: `You are AgriAssist Bot, a friendly and knowledgeable agriculture assistant who helps farmers with practical advice. You are conversational, remember previous questions, and maintain context throughout the chat.

            PERSONALITY:
            - Friendly, supportive, and patient with farmers
            - Remember what the farmer asked before and build on it
            - Use simple, practical language farmers can understand
            - Be conversational, not robotic

            TOPICS YOU HELP WITH:
            - Crop cultivation (rice/paddy, wheat, cotton, vegetables, fruits)
            - Soil management, fertilizers, and nutrition
            - Pest and disease control and prevention
            - Weather-related farming decisions
            - Irrigation, water management, and drainage
            - Livestock care (cattle, buffalo, goats, poultry)
            - Farm equipment, tools, and machinery
            - Market prices, selling crops, and profit optimization
            - Sustainable and organic farming practices
            - Government schemes and subsidies for farmers
            - Seasonal farming calendar and timing

            RESPONSE STYLE:
            - Keep responses PRACTICAL and INFORMATIVE
            - Give actionable advice farmers can implement immediately
            - Remember context from previous messages in this conversation
            - Be encouraging and supportive
            - Always end with "Use AgriAssist app daily for better crop analysis"

            IMPORTANT:
            - Always maintain conversation context
            - Don't repeat introductions if you've already introduced yourself
            - Build on previous questions naturally
            - If asked about non-farming topics, gently redirect while staying friendly`
        };

        // Generate constant response (no API calls)
        let replyText = getRandomBotResponse();
        
        // Add small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Add assistant response to history
        history.push({ role: "assistant", content: replyText });

        console.log("Reply text:", replyText);
        console.log("Conversation history length:", history.length);

        // Send response
        res.json({
            success: true,
            replyText: replyText,
            conversationLength: history.length,
            sessionId: sessionId
        });

    } catch (error) {
        console.error("❌ Error in getAIResponse controller:", error);
        
        res.status(500).json({ 
            success: false,
            error: "Technical issue occurred", 
            details: error.message,
            replyText: getRandomBotResponse()
        });
    }
};

// AI Response with Voice Controller
export const getAIResponseWithVoice = async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        console.log("Received voice message:", message);
        console.log("Session ID:", sessionId);

        // Validate input
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message is required",
                replyText: "Please ask me something about farming!",
                finalAudio: null,
                audioGenerated: false
            });
        }

        // Get or create conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, []);
        }
        
        const history = conversationHistory.get(sessionId);
        
        // Add user message to history
        history.push({ role: "user", content: message });

        // Keep only last 10 messages to manage context size
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }

        // Build conversation context with system prompt (optimized for voice)
        const systemMessage = {
            role: "system",
            content: `You are AgriAssist Bot, a friendly and knowledgeable agriculture assistant who helps farmers with practical advice. You are conversational, remember previous questions, and maintain context throughout the chat.

            PERSONALITY:
            - Friendly, supportive, and patient with farmers
            - Remember what the farmer asked before and build on it
            - Use simple, practical language farmers can understand
            - Be conversational, not robotic

            TOPICS YOU HELP WITH:
            - Crop cultivation (rice/paddy, wheat, cotton, vegetables, fruits)
            - Soil management, fertilizers, and nutrition
            - Pest and disease control and prevention
            - Weather-related farming decisions
            - Irrigation, water management, and drainage
            - Livestock care (cattle, buffalo, goats, poultry)
            - Farm equipment, tools, and machinery
            - Market prices, selling crops, and profit optimization
            - Sustainable and organic farming practices
            - Government schemes and subsidies for farmers
            - Seasonal farming calendar and timing

            RESPONSE STYLE FOR VOICE:
            - Keep responses SHORT and PRACTICAL (2-4 sentences max for voice)
            - Give actionable advice farmers can implement immediately
            - If the question needs a longer answer, break it into key points
            - Remember context from previous messages in this conversation
            - Be encouraging and supportive
            - Always end with "Use AgriAssist app daily for better crop analysis"

            IMPORTANT:
            - Always maintain conversation context
            - Don't repeat introductions if you've already introduced yourself
            - Build on previous questions naturally
            - If asked about non-farming topics, gently redirect while staying friendly`
        };

        // Generate constant response (no API calls)
        let replyText = getRandomBotResponse();
        
        // Add small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Add assistant response to history
        history.push({ role: "assistant", content: replyText });

        console.log("Reply text:", replyText);

        // Split text for TTS (shorter chunks for better audio quality)
        const splitText = [];
        const sentences = replyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        let currentChunk = "";
        for (let sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;
            
            if (currentChunk.length + trimmedSentence.length < 100) {
                currentChunk += (currentChunk ? ". " : "") + trimmedSentence;
            } else {
                if (currentChunk) {
                    splitText.push(currentChunk + ".");
                }
                currentChunk = trimmedSentence;
            }
        }
        
        if (currentChunk) {
            splitText.push(currentChunk + ".");
        }

        // If no proper sentences, fall back to character chunking
        if (splitText.length === 0) {
            let start = 0;
            while (start < replyText.length) {
                let end = Math.min(start + 100, replyText.length);
                if (end < replyText.length) {
                    const lastSpace = replyText.lastIndexOf(' ', end);
                    if (lastSpace > start) end = lastSpace;
                }
                splitText.push(replyText.substring(start, end).trim());
                start = end;
            }
        }

        // Generate audio with retry logic
        const audioBuffers = [];
        
        for (let i = 0; i < splitText.length; i++) {
            const chunk = splitText[i];
            if (!chunk.trim()) continue;
            
            let success = false;
            let retries = 0;
            const maxRetries = 3;
            
            while (!success && retries < maxRetries) {
                try {
                    // Use different TTS endpoints for better reliability
                    const ttsEndpoints = [
                        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=en&client=tw-ob`,
                        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=en&client=gtx`,
                    ];
                    
                    const ttsUrl = ttsEndpoints[retries % ttsEndpoints.length];
                    
                    const audioRes = await fetch(ttsUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'audio/mpeg, audio/*',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Referer': 'https://translate.google.com/',
                        }
                    });
                    
                    if (!audioRes.ok) {
                        throw new Error(`HTTP ${audioRes.status}: ${audioRes.statusText}`);
                    }
                    
                    const buffer = await audioRes.arrayBuffer();
                    if (buffer.byteLength > 100) { // Valid audio should be larger than 100 bytes
                        audioBuffers.push(Buffer.from(buffer));
                        success = true;
                        console.log(`✅ Audio generated for chunk ${i + 1}/${splitText.length} (${buffer.byteLength} bytes)`);
                    } else {
                        throw new Error('Audio buffer too small');
                    }
                    
                } catch (audioError) {
                    retries++;
                    console.warn(`❌ Attempt ${retries} failed for chunk ${i + 1}:`, audioError.message);
                    
                    if (retries < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 500 * retries)); // Exponential backoff
                    }
                }
            }
            
            if (!success) {
                console.error(`❌ Failed to generate audio for chunk ${i + 1} after ${maxRetries} attempts`);
            }
        }

        // Combine audio buffers
        let finalAudio = null;
        if (audioBuffers.length > 0) {
            finalAudio = Buffer.concat(audioBuffers);
            console.log(`🔊 Final audio: ${audioBuffers.length} chunks, ${finalAudio.length} bytes total`);
        } else {
            console.warn("⚠️ No audio generated");
        }

        // Send response with voice data
        const responseData = {
            success: true,
            replyText: replyText,
            audioGenerated: audioBuffers.length > 0,
            conversationLength: history.length,
            chunksProcessed: splitText.length,
            audioChunksGenerated: audioBuffers.length,
            sessionId: sessionId,
            finalAudio: finalAudio ? {
                type: 'Buffer',
                data: Array.from(finalAudio)
            } : null
        };

        res.json(responseData);

    } catch (error) {
        console.error("❌ Error in getAIResponseWithVoice controller:", error);
        
        // Send agriculture-focused error response
        res.status(500).json({ 
            success: false,
            error: "Technical issue occurred", 
            details: error.message,
            replyText: getRandomBotResponse(),
            finalAudio: null,
            audioGenerated: false
        });
    }
};

// Optional: Add endpoint to clear conversation history
export const clearConversation = async (req, res) => {
    try {
        const { sessionId = 'default' } = req.body;
        conversationHistory.delete(sessionId);
        res.json({ 
            success: true, 
            message: 'Conversation cleared',
            sessionId: sessionId
        });
    } catch (error) {
        console.error("Error clearing conversation:", error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to clear conversation' 
        });
    }
};