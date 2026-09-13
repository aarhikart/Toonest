'use client';

/**
 * Resilient client-side loader for Mozilla PDF.js.
 * Dynamically loads pdf.min.js and configures the web worker in the browser,
 * avoiding Node.js native canvas binding issues during Next.js Turbopack build.
 */

let loadPromise: Promise<any> | null = null;

export async function getPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be loaded in the browser environment.');
  }

  // If already loaded on window
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script already exists in document
    const existingScript = document.querySelector('script[data-pdfjs="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('PDF.js failed to initialize.'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load PDF.js script.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.setAttribute('data-pdfjs', 'true');

    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(lib);
      } else {
        reject(new Error('PDF.js failed to initialize on window.'));
      }
    };

    script.onerror = () => {
      // Try fallback to unpkg
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
      fallbackScript.async = true;
      fallbackScript.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('Fallback PDF.js failed to initialize.'));
        }
      };
      fallbackScript.onerror = () => {
        reject(new Error('Failed to load PDF.js library. Please check your internet connection.'));
      };
      document.head.appendChild(fallbackScript);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Load a PDF document from an ArrayBuffer.
 */
export async function getPdfDocument(data: ArrayBuffer): Promise<any> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}
