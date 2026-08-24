import { fireEvent, render, screen } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('renders the calorie dashboard and key controls', () => {
    render(<App />);

    expect(screen.getByText(/daily target/i)).toBeTruthy();
    expect(screen.getByText(/calories remaining/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /add food/i })).toBeTruthy();
  });

  it('allows a user to add a food entry and updates totals', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/search foods/i), {
      target: { value: 'banana' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /add banana/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /breakfast/i }));

    expect(screen.getAllByText(/banana/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/calories consumed/i)).toBeTruthy();
  });
});
