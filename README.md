# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# 🌐 Distracted Driver Detection - Frontend

## 🚀 Live Demo
**Frontend**: [Deployed on Vercel](https://your-app.vercel.app)  
**Backend**: [API on Render](https://distracted-driver-api.onrender.com)

## ⚡ Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 🔧 Environment Variables

Create `.env.local` for local development:
```
VITE_API_URL=http://localhost:5000
```

For production (Vercel):
```
VITE_API_URL=https://distracted-driver-api.onrender.com
```

## 📦 Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TensorFlow.js** for client-side ML (optional)
- **React Dropzone** for drag & drop file uploads
- **CSS3** for styling

## 🏗️ Project Structure

```
src/
├── components/          # React components
├── services/           # API service layer
├── App.tsx            # Main application
├── App.css           # Styles
└── main.tsx          # Entry point
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variable: `VITE_API_URL`
3. Deploy automatically

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🧪 Features

- ✅ Drag & drop image upload
- ✅ Real-time API connection status
- ✅ Driver behavior classification
- ✅ Safety risk assessment
- ✅ Responsive design
- ✅ Error handling

## 📱 API Integration

The frontend communicates with the ML backend API:
- **Health Check**: `GET /health`
- **Image Prediction**: `POST /predict`
- **Classes Info**: `GET /classes`

## ⚠️ Demo Limitations

This is a demonstration model with limited training data. For production use, the model would need training on the full State Farm dataset.

## 🔧 Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🌍 Environment Support

- **Development**: Local API server
- **Production**: Deployed API on Render
- **Cross-origin**: CORS enabled for all environments

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
