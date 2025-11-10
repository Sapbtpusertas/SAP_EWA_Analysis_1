
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

// Helper to format Gemini's markdown-like response to HTML
const formatGeminiResponse = (text: string): string => {
    let html = text
        .replace(/</g, '&lt;').replace(/>/g, '&gt;') // Basic HTML escaping
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
        .replace(/`([^`]+)`/g, '<code class="text-xs bg-gray-100 p-1 rounded">$1</code>'); // Inline code

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
            let para = line ? `<p class="mb-2">${line}</p>` : '';
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


interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  // The API guarantees that parts will be an array, and for text, it has one entry.
  const textContent = message.parts[0]?.text || '';
  
  const formattedContent = isModel ? formatGeminiResponse(textContent) : textContent;

  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
      <div className={`rounded-lg px-4 py-2 max-w-md shadow-md ${isModel ? 'bg-white text-text-dark' : 'bg-ewa-purple text-white'}`}>
        {isModel ? (
          <div className="prose prose-sm max-w-none text-sm" dangerouslySetInnerHTML={{ __html: formattedContent }} />
        ) : (
          <p className="text-sm">{textContent}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
