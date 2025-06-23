/**
 * Console Error Filter Utility
 * Filters out common browser extension errors from console logs
 */

interface ConsoleErrorFilter {
  init: () => void;
  addFilter: (filter: string | RegExp) => void;
  removeFilter: (filter: string | RegExp) => void;
  enable: () => void;
  disable: () => void;
}

class ConsoleErrorFilterImpl implements ConsoleErrorFilter {
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private filters: (string | RegExp)[] = [];
  private isEnabled = false;

  constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    
    // Default filters for common browser extension errors
    this.filters = [
      /The message port closed before a response was received/,
      /runtime\.lastError/,
      /Unchecked runtime\.lastError/,
      /Extension context invalidated/,
      /Could not establish connection/,
      /chrome-extension:\/\//,
      /moz-extension:\/\//,
      /safari-extension:\/\//,
      /Extension.*invalidated/,
      /Receiving end does not exist/,
      /Failed to establish connection/,
      /Connection was refused/,
      /net::ERR_FILE_NOT_FOUND.*chrome-extension/,
      /net::ERR_FILE_NOT_FOUND.*moz-extension/,
      /\.chunk\.css.*net::ERR_FILE_NOT_FOUND/,
      /assets\/css\/.*\.css.*net::ERR_FILE_NOT_FOUND/,
      /pop\.chunk\.css.*net::ERR_FILE_NOT_FOUND/,
      /pop\.html.*net::ERR_FILE_NOT_FOUND/,
      /Extension.*disconnected/,
      /Script.*extension.*failed/,
      /Cannot access contents of url "chrome-extension/,
      /Cannot access contents of url "moz-extension/,
      /Manifest version 2 is deprecated/,
      /Service worker registration failed/,
      /Download the React DevTools/,
      /react\.dev\/link\/react-devtools/,
      /better development experience/,
      /React DevTools/,
      /Vercel Speed Insights.*Debug mode/,
      /Debug mode is enabled by default in development/,
      /No requests will be sent to the server/,
      /\[Vercel Speed Insights\]/,
      /main-app\.js.*React DevTools/,
      /injected\.js.*hide-notification/,
      /background\.js.*message/,
      /Caught error handling.*hide-notification/,
      /understand this error/i,
      // Generic browser extension file patterns
      /^[a-z-]+\.(html|js|css):\d+.*extension/i,
      /^[a-z-]+\.(html|js|css):\d+.*chunk/i,
      /^[a-z-]+\.(html|js|css):\d+.*net::err/i,
    ];
  }

  private shouldFilter(message: string): boolean {
    return this.filters.some(filter => {
      if (typeof filter === 'string') {
        return message.includes(filter);
      }
      return filter.test(message);
    });
  }

  private createFilteredConsoleMethod(originalMethod: typeof console.error) {
    return (...args: any[]) => {
      const message = args.join(' ');
      
      if (!this.shouldFilter(message)) {
        originalMethod.apply(console, args);
      }
    };
  }

  init(): void {
    if (typeof window !== 'undefined') {
      this.enable();
    }
  }

  enable(): void {
    if (this.isEnabled) return;
    
    console.error = this.createFilteredConsoleMethod(this.originalConsoleError);
    console.warn = this.createFilteredConsoleMethod(this.originalConsoleWarn);
    
    this.isEnabled = true;
  }

  disable(): void {
    if (!this.isEnabled) return;
    
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    
    this.isEnabled = false;
  }

  addFilter(filter: string | RegExp): void {
    this.filters.push(filter);
  }

  removeFilter(filter: string | RegExp): void {
    const index = this.filters.indexOf(filter);
    if (index > -1) {
      this.filters.splice(index, 1);
    }
  }
}

// Singleton instance
const consoleErrorFilter = new ConsoleErrorFilterImpl();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      consoleErrorFilter.init();
    });
  } else {
    consoleErrorFilter.init();
  }
}

export default consoleErrorFilter;

// Export for use in other modules
export { consoleErrorFilter };

// Export types
export type { ConsoleErrorFilter }; 