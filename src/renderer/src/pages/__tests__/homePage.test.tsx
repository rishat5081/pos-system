import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/pages/homePage';

describe('HomePage', () => {
  it('renders system overview and CTA links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('All-in-One Business Platform')).toBeInTheDocument();
    expect(screen.getByText(/one operating system for retail, restaurants, salons/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Sign In$/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Core Modules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Operational Workflow' })).toBeInTheDocument();
  });
});
