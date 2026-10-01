import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/render';
import { ErrorBoundary } from './ErrorBoundary';

/** Throws on render, the way a genuine fault would. */
function Boom({ message }) {
  throw new Error(message);
}

beforeEach(() => {
  // React logs every caught error; the boundary logs its own too. Neither is
  // a failure here, and both would bury the real output.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe('ErrorBoundary', () => {
  it('renders its children when nothing goes wrong', () => {
    renderWithRouter(
      <ErrorBoundary>
        <p>The page</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('The page')).toBeInTheDocument();
  });

  it('recognises a failed chunk as a stale deploy and offers a reload', () => {
    renderWithRouter(
      <ErrorBoundary>
        <Boom message="Failed to fetch dynamically imported module: /assets/Gallery-abc.js" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/site was updated while you were here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload the page/i })).toBeInTheDocument();
  });

  it('falls back to a generic message for any other fault', () => {
    renderWithRouter(
      <ErrorBoundary>
        <Boom message="Cannot read properties of undefined" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.queryByText(/site was updated/i)).not.toBeInTheDocument();
  });

  it('always leaves a way out of the error state', () => {
    renderWithRouter(
      <ErrorBoundary>
        <Boom message="anything" />
      </ErrorBoundary>
    );
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('catches the error rather than letting it reach the caller', () => {
    expect(() =>
      renderWithRouter(
        <ErrorBoundary>
          <Boom message="boom" />
        </ErrorBoundary>
      )
    ).not.toThrow();
  });
});
