# TakeNote - Advanced Note-Taking Application

A professional, feature-rich note-taking application built with Next.js, TypeScript, and Tailwind CSS. TakeNote combines powerful text editing capabilities with AI-powered features to enhance your note-taking experience.

## ✨ Core Features

### 📝 Rich Text Editor

- **Custom-built editor** (no external libraries like TinyMCE or Quill)
- **Text formatting**: Bold, italic, underline
- **Alignment options**: Left, center, right
- **Font customization**: Multiple font families and sizes
- **Text highlighting**: Multiple color options with custom highlight tool
- **Drawing canvas**: Integrated drawing tool for sketches and diagrams

### 📚 Note Management

- **Create, edit, delete** notes with ease
- **Pin important notes** to the top with visual indicators
- **Search functionality** by title or content
- **Tags system** for organization
- **Password protection** for sensitive notes with encryption

### 🤖 AI-Powered Features

- **Smart Tag Suggestions**: AI generates relevant tags based on content
- **Grammar & Spelling Check**: Identifies and suggests corrections for writing errors
- **Readability Analysis**: Provides readability scores and improvement suggestions
- **Auto Glossary Highlighting**: Automatically identifies and highlights key terms
- **AI Summarization**: Generates concise summaries of your notes

### 📱 User Experience

- **Clean, modern UI** with gradient designs and glassmorphism effects
- **Responsive design** that works on desktop, tablet, and mobile
- **Touch-friendly interface** with optimized layouts for smaller screens
- **Dark/light theme** with beautiful color schemes

### 🔒 Security & Privacy

- **Note encryption** with password protection
- **Local storage** - your data stays on your device
- **Secure password handling** for protected notes

### 📤 Export & Sharing

- **PDF Export**: Convert notes to professional PDF documents
- **Share functionality**: Copy notes to clipboard or use native sharing
- **Multiple export formats** for different use cases

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd take-note
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom gradients and animations
- **AI Integration**: Groq API for natural language processing
- **PDF Generation**: jsPDF for document export
- **Icons**: Lucide React for beautiful, consistent icons
- **Storage**: IndexedDB for local data persistence

## 📖 How to Use

### Creating Notes

1. Click the **+** button in the sidebar
2. Enter a title for your note
3. Start typing in the rich text editor
4. Use the toolbar for formatting options

### AI Features

1. **Generate Tags**: Click the AI Tools button and select "Suggest Tags"
2. **Check Grammar**: Use "Check Grammar" to find writing errors
3. **Analyze Readability**: Get readability scores and suggestions
4. **Highlight Glossary**: Automatically identify key terms
5. **Create Summaries**: Generate concise note summaries

### Note Organization

- **Pin important notes** by clicking the pin icon
- **Add tags** for better categorization
- **Search notes** using the search bar
- **Use the sidebar** to navigate between notes

### Security Features

- **Protect notes** by clicking the lock icon
- **Set passwords** for sensitive content
- **Encrypted notes** are stored securely

### Export & Share

- **Export to PDF** using the download button
- **Share notes** with the share button
- **Copy to clipboard** for easy sharing

## 🔧 Configuration

### AI API Settings

- **Model**: Currently uses Groq's `llama3-8b-8192` model
- **Temperature**: Set to 0.3 for consistent results
- **Max Tokens**: Limited to 1000 for cost efficiency

### PDF Export Settings

- **Page Size**: Standard A4 format
- **Margins**: 20px on all sides
- **Fonts**: Helvetica for clean, professional appearance

## 📱 Responsive Design

The application is fully responsive and includes:

- **Desktop layout**: Full sidebar with all features
- **Tablet layout**: Optimized for medium screens
- **Mobile layout**: Collapsible sidebar with touch-friendly controls

## 🚀 Deployment

link - https://note-app-tan-omega.vercel.app/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Groq** for providing the AI API
- **Next.js team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set

## 📞 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include your browser version and operating system

## 🔮 Future Enhancements

- **Multi-language support** with AI translation
- **Version history** for note changes
- **Collaborative editing** features
- **Cloud sync** options
- **Advanced search** with filters
- **Note templates** for common use cases

---

**TakeNote** - Where AI meets productivity in note-taking! 🚀
