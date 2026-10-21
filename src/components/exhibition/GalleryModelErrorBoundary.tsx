"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface GalleryModelErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
}

interface GalleryModelErrorBoundaryState {
  failed: boolean;
}

export class GalleryModelErrorBoundary extends Component<
  GalleryModelErrorBoundaryProps,
  GalleryModelErrorBoundaryState
> {
  state: GalleryModelErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): GalleryModelErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Gallery model failed to load", error, errorInfo);
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
