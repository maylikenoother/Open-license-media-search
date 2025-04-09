import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../../components/Navbar';

vi.mock('@clerk/clerk-react', () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
  SignedIn: ({ children }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }) => <div data-testid="signed-out">{children}</div>,
  SignInButton: ({ children }) => <div data-testid="sign-in-button">{children}</div>
}));

describe('Navbar Component', () => {
  const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  test('renders logo and title', () => {
    renderWithRouter(<Navbar />);
    const logoImg = document.querySelector('img[alt="OLM Search Logo"]');
    expect(logoImg).toBeInTheDocument();
    expect(screen.getByText('OLM Search')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  test('handles mobile view with hamburger menu', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn()
    }));

    renderWithRouter(<Navbar />);
    
    const menuButton = screen.getByLabelText('open drawer');
    expect(menuButton).toBeInTheDocument();
    
    fireEvent.click(menuButton);
    
    expect(screen.getByText('OLM Search')).toBeInTheDocument();
  });
});