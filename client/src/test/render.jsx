import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/** Renders a component inside a router, which most of the app needs. */
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

export * from '@testing-library/react';
