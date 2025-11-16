import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

class LLMService {
    constructor(provider, apiKey, model) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.model = model;
        this.client = this.initializeClient();
    }

    initializeClient() {
        switch (this.provider) {
            case 'openai':
                return new OpenAI({ apiKey: this.apiKey });
            case 'gemini':
                return new GoogleGenerativeAI(this.apiKey);
            case 'groq':
                return new Groq({ apiKey: this.apiKey });
            default:
                throw new Error(`Unsupported provider: ${this.provider}`);
        }
    }

    async *streamCompletion(messages) {
        try {
            switch (this.provider) {
                case 'openai':
                    yield* this.streamOpenAI(messages);
                    break;
                case 'gemini':
                    yield* this.streamGemini(messages);
                    break;
                case 'groq':
                    yield* this.streamGroq(messages);
                    break;
                default:
                    throw new Error(`Unsupported provider: ${this.provider}`);
            }
        } catch (error) {
            console.error('LLM Stream Error:', error);
            throw error;
        }
    }

    async *streamOpenAI(messages) {
        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: messages,
            stream: true,
            temperature: 0.7,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    }

    async *streamGemini(messages) {
        const model = this.client.getGenerativeModel({ model: this.model });
        
        // Convert OpenAI-style messages to Gemini format
        const prompt = messages.map(msg => {
            if (msg.role === 'system') return msg.content;
            if (msg.role === 'user') return `User: ${msg.content}`;
            if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
            return msg.content;
        }).join('\n\n');

        const result = await model.generateContentStream(prompt);
        
        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                yield text;
            }
        }
    }

    async *streamGroq(messages) {
        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: messages,
            stream: true,
            temperature: 0.7,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    }
}

export default LLMService;
