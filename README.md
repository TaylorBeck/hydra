<img width="400" height="124" alt="banner-h" src="https://github.com/user-attachments/assets/dfe4e561-ffb7-4702-b25a-fa16c40c20d2" />

A modern, multi-provider AI chatbot interface built with Next.js 15, featuring support for multiple LLM providers with a responsive UI.

## ✨ Features

- **Multi-Provider Support**: Chat with models from OpenAI, Anthropic, Google, and Mistral
- **Real-time Streaming**: Smooth, real-time message streaming with the AI SDK
- **Authentication**: Secure user authentication powered by Supabase
- **Conversation Management**: Save, organize, and revisit your chat conversations
- **Customizable Settings**: Fine-tune model parameters like temperature, tokens, and more
- **Modern UI**: Beautiful, responsive interface with dark/light theme support
- **Type-Safe**: Built with TypeScript for enhanced developer experience

## 🚀 Supported AI Models

### OpenAI
- GPT-4o
- GPT-4o Mini  
- GPT-3.5 Turbo

### Anthropic
- Claude 3.5 Sonnet
- Claude 3.5 Haiku
- Claude 3 Opus

### Google
- Gemini 1.5 Pro
- Gemini 1.5 Flash

### Mistral
- Mistral Large
- Mistral Small

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **AI Integration**: Vercel AI SDK
- **Database**: Supabase
- **State Management**: Zustand + React Query
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-chatbot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # AI Provider API Keys (add the ones you want to use)
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
   MISTRAL_API_KEY=your_mistral_api_key
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration

### API Keys
You can configure API keys in two ways:
1. **Environment Variables**: Set them in `.env.local` (recommended for development)
2. **Runtime Configuration**: Enter them in the settings modal within the app

### Model Settings
Customize model behavior through the settings panel:
- **Temperature**: Control randomness (0.0 - 2.0)
- **Max Output Tokens**: Limit response length
- **Top P**: Nucleus sampling parameter
- **Top K**: Top-k sampling parameter
- **Presence/Frequency Penalty**: Control repetition
- **Stop Sequences**: Custom stop sequences

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/chat/          # Chat API endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/            # React components
│   ├── ai-elements/       # AI-specific UI components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat interface components
│   ├── settings/          # Settings modal components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── stores/                # Zustand stores
└── types/                 # TypeScript type definitions
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted with Docker

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT
