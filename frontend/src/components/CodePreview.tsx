import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFileExplorer,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { Button } from '@/components/ui/button';
import { Download, Code2, Eye, Terminal, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getApiSettings } from '@/lib/api';
// @ts-ignore - JSZip types may not be fully compatible
import JSZip from 'jszip';
// @ts-ignore - file-saver types
import { saveAs } from 'file-saver';

interface GeneratedFile {
  path: string;
  content: string;
}

interface FileStructure {
  projectType: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

interface CodePreviewProps {
  files: GeneratedFile[];
  fileStructure: FileStructure;
  onFilesUpdated?: (files: GeneratedFile[]) => void;
}

// Convert generated files to Sandpack format
function convertToSandpackFiles(files: GeneratedFile[]): Record<string, string> {
  const sandpackFiles: Record<string, string> = {};
  
  console.log('🔧 Converting files to Sandpack format:', files.length, 'files');
  
  files.forEach(file => {
    // Normalize path - Sandpack expects paths starting with /
    let normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
    
    // Clean up the content - remove markdown code blocks if present
    let cleanedContent = file.content;
    
    // Remove markdown code blocks
    cleanedContent = cleanedContent.replace(/^```[\w]*\n/gm, '');
    cleanedContent = cleanedContent.replace(/\n```$/gm, '');
    cleanedContent = cleanedContent.replace(/```[\w]*$/gm, '');
    cleanedContent = cleanedContent.replace(/^```/gm, '');
    
    // Remove control characters and artifacts
    cleanedContent = cleanedContent.replace(/<ctrl\d+>/g, '');
    cleanedContent = cleanedContent.replace(/<end>/g, '');
    cleanedContent = cleanedContent.replace(/<start>/g, '');
    
    cleanedContent = cleanedContent.trim();
    
    console.log('📄 File:', normalizedPath, '| Length:', cleanedContent.length);
    sandpackFiles[normalizedPath] = cleanedContent;
  });

  console.log('✅ Sandpack files ready:', Object.keys(sandpackFiles));
  return sandpackFiles;
}

// Determine the template based on project type
function getTemplate(projectType: string): string {
  const typeMap: Record<string, string> = {
    'react': 'react',
    'react-ts': 'react-ts',
    'nextjs': 'nextjs',
    'vue': 'vue',
    'vue3': 'vue3',
    'angular': 'angular',
    'svelte': 'svelte',
    'vanilla': 'vanilla',
    'vanilla-js': 'vanilla',
    'static': 'static',
    'node-api': 'node',
    'full-stack': 'react-ts',
  };
  
  return typeMap[projectType.toLowerCase()] || 'react-ts';
}

// Find the entry file
function getEntryFile(files: GeneratedFile[], projectType: string): string {
  // Common entry file patterns
  const entryPatterns = [
    'src/main.tsx',
    'src/main.ts',
    'src/index.tsx',
    'src/index.ts',
    'src/App.tsx',
    'src/App.ts',
    'index.html',
    'index.tsx',
    'index.ts',
    'main.tsx',
    'main.ts',
  ];

  for (const pattern of entryPatterns) {
    const found = files.find(f => 
      f.path === pattern || f.path === `/${pattern}` || f.path.endsWith(pattern)
    );
    if (found) {
      return found.path.startsWith('/') ? found.path : `/${found.path}`;
    }
  }

  // Default fallbacks
  if (files.length > 0) {
    return files[0].path.startsWith('/') ? files[0].path : `/${files[0].path}`;
  }

  return '/src/App.tsx';
}

// Error Monitor Component - watches for sandbox errors and auto-fixes them
function ErrorMonitor({ files, fileStructure, onFilesFixed, onFixingStart }: {
  files: GeneratedFile[];
  fileStructure: FileStructure;
  onFilesFixed: (files: GeneratedFile[]) => void;
  onFixingStart: () => void;
}) {
  const { listen } = useSandpack();
  const [hasAttemptedFix, setHasAttemptedFix] = useState(false);

  useEffect(() => {
    const unsubscribe = listen((message: any) => {
      // Check for console errors and compilation errors
      if (message.type === 'console' && message.codesandbox === true && message.log) {
        const logs = Array.isArray(message.log) ? message.log : [message.log];
        const errorLogs = logs.filter((log: any) => 
          typeof log === 'object' && (log.method === 'error' || log.method === 'warn')
        );
        
        if (errorLogs.length > 0 && !hasAttemptedFix) {
          const errorMessage = errorLogs.map((log: any) => 
            log.data ? log.data.join(' ') : ''
          ).join('\n');
          
          if (errorMessage.includes('Error') || errorMessage.includes('Syntax')) {
            console.error('🔴 Sandbox Console Error:', errorMessage);
            setHasAttemptedFix(true);
            handleSandboxError(errorMessage);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [listen, hasAttemptedFix]);

  const handleSandboxError = async (error: string) => {
    try {
      console.log('🔧 Attempting to fix sandbox error...');
      onFixingStart();
      toast.info('AI is analyzing and fixing the error...');

      const apiSettings = await getApiSettings();
      if (!apiSettings) {
        toast.error('API settings not configured');
        return;
      }

      const response = await fetch('http://localhost:5000/api/sandbox/fix-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error,
          files,
          fileStructure,
          apiSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fix error');
      }

      const result = await response.json();

      if (result.success && result.fixedFiles) {
        console.log('✅ Files fixed:', Object.keys(result.fixedFiles));
        toast.success(result.explanation || 'Error fixed!');

        // Update files with fixed versions
        const updatedFiles = files.map(file => {
          const fixedContent = result.fixedFiles[file.path] || result.fixedFiles[`/${file.path}`];
          if (fixedContent) {
            return { ...file, content: fixedContent };
          }
          return file;
        });

        // Add any new files from the fix
        Object.entries(result.fixedFiles).forEach(([path, content]) => {
          const exists = files.some(f => f.path === path || `/${f.path}` === path);
          if (!exists) {
            updatedFiles.push({ path, content: content as string });
          }
        });

        onFilesFixed(updatedFiles);
        setHasAttemptedFix(false); // Allow retry on new errors
      }
    } catch (err) {
      console.error('Failed to fix error:', err);
      toast.error('Failed to auto-fix the error');
    }
  };

  return null; // This component doesn't render anything
}

export function CodePreview({ files, fileStructure, onFilesUpdated }: CodePreviewProps) {
  const [activeView, setActiveView] = useState<'split' | 'code' | 'preview'>('split');
  const [showConsole, setShowConsole] = useState(true);
  const [isFixingError, setIsFixingError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  
  console.log('🎨 CodePreview rendering with:', files.length, 'files', fileStructure);
  
  const sandpackFiles = useMemo(() => convertToSandpackFiles(files), [files]);
  const template = useMemo(() => getTemplate(fileStructure.projectType), [fileStructure.projectType]);
  const entryFile = useMemo(() => getEntryFile(files, fileStructure.projectType), [files, fileStructure.projectType]);

  const customSetup = {
    dependencies: {
      'react': '18.2.0',
      'react-dom': '18.2.0',
      ...fileStructure.dependencies,
    },
  };

  // Ensure we have required entry files for React
  const ensureRequiredFiles = () => {
    const required: Record<string, string> = { ...sandpackFiles };

    // Add package.json if not present
    if (!required['/package.json']) {
      required['/package.json'] = JSON.stringify({
        name: 'shunya-project',
        version: '1.0.0',
        main: '/src/index.tsx',
        dependencies: customSetup.dependencies,
        author: {
          name: 'Generated by Shunya AI',
          url: 'https://shunya.ai'
        },
        keywords: ['shunya-ai', 'ai-generated'],
        generator: {
          name: 'Shunya AI',
          url: 'https://shunya.ai',
          generatedAt: new Date().toISOString()
        }
      }, null, 2);
    }

    // Ensure index.html exists
    const hasIndexHtml = Object.keys(required).some(path => 
      path.toLowerCase().includes('index.html')
    );
    
    if (!hasIndexHtml) {
      required['/public/index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileStructure.description || 'React App'}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
    }

    // Ensure main entry exists for React
    if (template.includes('react')) {
      const hasMainEntry = Object.keys(required).some(path => 
        path.includes('index.tsx') || path.includes('index.jsx') || path.includes('main.tsx')
      );
      
      if (!hasMainEntry) {
        required['/src/index.tsx'] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
      }

      // Ensure App.tsx exists
      const hasApp = Object.keys(required).some(path => 
        path.includes('/App.tsx') || path.includes('/App.ts') || path.includes('/App.jsx')
      );
      
      if (!hasApp) {
        required['/src/App.tsx'] = `import React from 'react';

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Hello React!</h1>
      <p>Your app is running successfully.</p>
    </div>
  );
}

export default App;`;
      }
    }

    return required;
  };

  const finalFiles = ensureRequiredFiles();

  console.log('🚀 Final files for Sandpack:', Object.keys(finalFiles));
  console.log('📦 Template:', template, '| Entry:', entryFile);

  const handleDownload = async () => {
    const zip = new JSZip();

    // Add all generated files
    files.forEach(file => {
      zip.file(file.path, file.content);
    });

    // Add package.json with Shunya attribution
    const packageJson = {
      name: fileStructure.description.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: fileStructure.description,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: customSetup.dependencies,
      devDependencies: fileStructure.devDependencies || {},
      author: {
        name: 'Generated by Shunya AI',
        url: 'https://shunya.ai'
      },
      keywords: ['shunya-ai', 'ai-generated'],
      generator: {
        name: 'Shunya AI',
        version: '1.0.0',
        url: 'https://shunya.ai',
        generatedAt: new Date().toISOString()
      }
    };

    zip.file('package.json', JSON.stringify(packageJson, null, 2));

    // Add README with attribution
    const readme = `# ${fileStructure.description}

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

---

## 🤖 Generated with Shunya AI

This project was generated using [Shunya AI](https://shunya.ai), an intelligent code generation platform.

**Project Details:**
- **Generated:** ${new Date().toLocaleDateString()}
- **Generator:** Shunya AI v1.0.0

### About Shunya AI

Shunya AI helps developers build applications faster by generating clean, production-ready code. Visit [shunya.ai](https://shunya.ai) to create your own projects.

---

Generated by Shunya AI
`;
    zip.file('README.md', readme);

    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${fileStructure.description.toLowerCase().replace(/\s+/g, '-')}.zip`);
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-card border border-border rounded-lg">
        <p className="text-muted-foreground">No files to preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'code' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('code')}
          >
            <Code2 className="w-4 h-4 mr-2" />
            Code
          </Button>
          <Button
            variant={activeView === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('preview')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={activeView === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('split')}
          >
            Split
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
          >
            <Terminal className="w-4 h-4 mr-2" />
            {showConsole ? 'Hide' : 'Show'} Console
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Sandpack Preview */}
      <div className="border border-border rounded-lg overflow-hidden bg-[#1e1e1e] min-h-[600px]">
        {isFixingError && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/50 p-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />
            <span className="text-sm text-yellow-500">AI is fixing the error... (Attempt {errorCount})</span>
          </div>
        )}
        <SandpackProvider
          files={finalFiles}
          customSetup={customSetup}
          theme="dark"
          options={{
            activeFile: entryFile,
            visibleFiles: Object.keys(finalFiles).filter(f => !f.includes('package.json')).slice(0, 5),
            autorun: true,
            autoReload: true,
            recompileMode: 'delayed',
            recompileDelay: 500,
          }}
        >
          <ErrorMonitor 
            files={files} 
            fileStructure={fileStructure} 
            onFilesFixed={(fixedFiles) => {
              if (onFilesUpdated) {
                setIsFixingError(false);
                onFilesUpdated(fixedFiles);
              }
            }}
            onFixingStart={() => {
              setIsFixingError(true);
              setErrorCount(prev => prev + 1);
            }}
          />
          <SandpackLayout className="!border-0">
            {/* Code Editor - shown in 'code' or 'split' mode */}
            {(activeView === 'code' || activeView === 'split') && (
              <div className="flex-1 min-w-[400px]">
                <SandpackFileExplorer className="!bg-[#1e1e1e] !border-0" />
                <SandpackCodeEditor 
                  showTabs
                  showLineNumbers
                  showInlineErrors
                  wrapContent
                  closableTabs
                  className="!bg-[#1e1e1e] !h-[500px]"
                />
              </div>
            )}
            
            {/* Preview - shown in 'preview' or 'split' mode */}
            {(activeView === 'preview' || activeView === 'split') && (
              <div className="flex-1 min-w-[400px] flex flex-col">
                <SandpackPreview 
                  showOpenInCodeSandbox
                  showRefreshButton
                  showNavigator
                  className="!bg-white !h-[500px]"
                  actionsChildren={
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-xs text-gray-500">Live Preview</span>
                    </div>
                  }
                />
                {/* Console - always shown with preview */}
                {showConsole && (
                  <div className="border-t border-border">
                    <SandpackConsole 
                      showHeader
                      showSetupProgress
                      resetOnPreviewRestart
                      className="!bg-[#1e1e1e] !h-[200px]"
                    />
                  </div>
                )}
              </div>
            )}
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
}
