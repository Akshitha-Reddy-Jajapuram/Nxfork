import { fireEvent, render, screen } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('renders the core dashboard and tracking sections', () => {
    render(<App />);

    expect(screen.getByText(/calorie tracker/i)).toBeTruthy();
    expect(screen.getByText(/daily target/i)).toBeTruthy();
    expect(screen.getByText(/calories remaining/i)).toBeTruthy();
    expect(screen.getByText(/weekly progress/i)).toBeTruthy();
  });

  it('adds a food item to the selected meal and updates the UI state', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/search foods/i), {
      target: { value: 'banana' },
    });

    fireEvent.click(screen.getAllByRole('button', { name: /add banana/i })[0]);

    expect(screen.getAllByText(/banana/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/calories consumed/i)).toBeTruthy();
  });
});
