'use client';

import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface PrintButtonProps {
    song: {
        title: string;
        artist?: string;
        key?: string;
        tempo?: string;
        chords?: string;
        lyrics?: string;
    };
}

export function PrintButton({ song }: PrintButtonProps) {
    const handlePrint = () => {
        // Create print window
        const printWindow = window.open('', '', 'width=800,height=600');

        if (!printWindow) {
            toast.error('Please allow popups to print');
            return;
        }

        // Generate print content
        const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${song.title} - Chords & Lyrics</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Courier New', monospace;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
            }
            
            .header {
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            h1 {
              font-size: 28px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            
            .meta {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            
            .meta strong {
              color: #000;
            }
            
            .content {
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.8;
            }
            
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-top: 30px;
              margin-bottom: 15px;
              text-transform: uppercase;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${song.title}</h1>
            ${song.artist ? `<div class="meta"><strong>Artist:</strong> ${song.artist}</div>` : ''}
            ${song.key ? `<div class="meta"><strong>Key:</strong> ${song.key}</div>` : ''}
            ${song.tempo ? `<div class="meta"><strong>Tempo:</strong> ${song.tempo}</div>` : ''}
          </div>
          
          ${song.chords ? `
            <div class="section-title">Chords</div>
            <div class="content">${song.chords}</div>
          ` : ''}
          
          ${song.lyrics ? `
            <div class="section-title">Lyrics</div>
            <div class="content">${song.lyrics}</div>
          ` : ''}
          
          <div class="footer">
            <p>Printed from Call of Jesus (COJ)</p>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              // Close window after printing (optional)
              // window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        toast.success('Opening print dialog...');
    };

    return (
        <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
            aria-label="Print chords and lyrics"
        >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
        </button>
    );
}
