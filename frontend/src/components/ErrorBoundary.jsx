import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Kora crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-white border border-coral/30 rounded-3xl p-8">
            <div className="text-xs font-semibold text-coral uppercase tracking-wide mb-2">
              Something broke
            </div>
            <h1 className="font-display text-2xl font-semibold mb-3">Page failed to render</h1>
            <p className="text-sm text-onLight/60 mb-4">
              Copy this message and send it to whoever built this:
            </p>
            <pre className="bg-paper rounded-xl p-4 text-xs text-onLight/80 overflow-auto max-h-64 whitespace-pre-wrap">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 text-sm font-medium bg-ink text-onDark rounded-full px-5 py-2.5 hover:bg-canopy transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}