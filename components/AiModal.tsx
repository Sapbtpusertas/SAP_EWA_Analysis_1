
import React, { useEffect, useState } from 'react';

interface AiModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  isLoading: boolean;
  onClose: () => void;
}

// Helper to format Gemini's markdown-like response to HTML
const formatGeminiResponse = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="text-xs bg-gray-100 p-1 rounded">$1</code>');

    let inList = false;
    html = html.split('\n').map(line => {
        line = line.trim();
        if (line.startsWith('* ') || line.startsWith('- ')) {
            let item = `<li class="ml-5 list-disc">${line.substring(2)}</li>`;
            if (!inList) {
                item = '<ul>' + item;
                inList = true;
            }
            return item;
        } else {
            let para = `<p class="mb-2">${line}</p>`;
            if (inList) {
                para = '</ul>' + para;
                inList = false;
            }
            return para;
        }
    }).join('');
    
    if (inList) {
        html += '</ul>';
    }
    
    return html.replace(/<p><\/p>/g, '');
};

const AiModal: React.FC<AiModalProps> = ({ isOpen, title, content, isLoading, onClose }) => {
  const [copyText, setCopyText] = useState('Copy to Clipboard');

  useEffect(() => {
    if (isOpen) {
      setCopyText('Copy to Clipboard'); // Reset on open
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy to Clipboard'), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      setCopyText('Failed to copy');
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-bg-card rounded-lg p-6 shadow-xl w-11/12 max-w-2xl max-h-[80vh] flex flex-col transform transition-transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-ewa-purple">✨ {title}</h3>
          <button onClick={onClose} className="text-2xl font-light text-text-light leading-none">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 text-sm text-text-dark">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="border-4 border-gray-200 border-t-4 border-t-ewa-purple rounded-full w-10 h-10 animate-spin"></div>
            </div>
          ) : (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatGeminiResponse(content) }}></div>
          )}
        </div>
        {!isLoading && (
          <div className="mt-6 text-right">
            <button onClick={handleCopy} className="bg-ewa-purple text-white font-medium py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
              {copyText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiModal;
