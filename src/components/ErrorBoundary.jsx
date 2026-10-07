import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-xl space-y-5 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800">
                Ocurrió un problema en esta sección
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                La aplicación protegió tu sesión para evitar la pantalla en blanco.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-xs text-rose-800 font-mono overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reintentar Vista</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.onNavigateHome) {
                    this.props.onNavigateHome();
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Volver al Tablero</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
