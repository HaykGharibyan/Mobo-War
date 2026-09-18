import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { AnalyticsService } from '../services/AnalyticsService';

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    AnalyticsService.reportError(error, { source: 'react_error_boundary', component_stack: info.componentStack?.slice(0, 700) || 'unknown' });
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return <main className="app"><section className="screen-frame" role="alert"><h1>Something went wrong</h1><p>Please restart the game.</p><button type="button" onClick={() => window.location.reload()}>RESTART</button></section></main>;
  }
}
