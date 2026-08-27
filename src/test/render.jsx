import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/** Renders a component inside a router, which most of the app needs. */
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {ui}
    </MemoryRouter>
  );
}

export * from '@testing-library/react';
