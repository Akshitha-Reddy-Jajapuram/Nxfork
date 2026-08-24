import { fireEvent, render, screen } from '@testing-library/react';

import App from './app';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it('updates totals when a serving changes and removes the entry', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/search foods/i), {
      target: { value: 'banana' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /add banana/i })[0]);

    const quantitiesBefore = screen.getAllByLabelText(/banana quantity/i);
    const quantity = quantitiesBefore[quantitiesBefore.length - 1];
    fireEvent.change(quantity, { target: { value: '2' } });

    expect((quantity as HTMLInputElement).value).toBe('2');

    fireEvent.click(screen.getAllByRole('button', { name: /delete banana/i })[0]);

    expect(screen.getAllByLabelText(/banana quantity/i).length).toBe(quantitiesBefore.length - 1);
  });
});
