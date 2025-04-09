import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@testing-library/jest-dom';
import MediaCard from '../../components/MediaCard';

vi.mock('react-query', async () => {
  const actual = await vi.importActual('react-query');
  return {
    ...actual,
    useMutation: () => ({
      mutate: vi.fn(),
      isLoading: false
    })
  };
});

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: { id: 'test-user-id' }
  }),
  SignInButton: ({ children }) => children
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('MediaCard Component', () => {
  const mockItem = {
    id: 'test-id-123',
    title: 'Test Image Title',
    creator: 'Test Creator',
    license: 'cc-by',
    license_url: 'https://example.com/license',
    provider: 'flickr',
    thumbnail: 'https://example.com/thumbnail.jpg',
    url: 'https://example.com/image.jpg',
    foreign_landing_url: 'https://example.com/source',
    tags: ['nature', 'water', 'sky']
  };

  const mockAudioItem = {
    id: 'audio-123',
    title: 'Test Audio Title',
    creator: 'Audio Creator',
    license: 'cc-by',
    license_url: 'https://example.com/audio-license',
    provider: 'audio',
    audio_url: 'https://example.com/audio.mp3',
    duration: '3:45'
  };

  const mockOnBookmarkChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders image card with correct title and creator', () => {
    render(
      <MediaCard item={mockItem} onBookmarkChange={mockOnBookmarkChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Test Image Title')).toBeInTheDocument();
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
  });

  test('renders audio card with audio indicator', () => {
    render(
      <MediaCard item={mockAudioItem} onBookmarkChange={mockOnBookmarkChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Test Audio Title')).toBeInTheDocument();
    expect(screen.getByText('Audio Creator')).toBeInTheDocument();
    // Check for audio icon or indicator
    const audioIcon = document.querySelector('svg.MuiSvgIcon-root');
    expect(audioIcon).toBeInTheDocument();
  });

  test('shows bookmark icon for non-bookmarked items', () => {
    render(
      <MediaCard 
        item={mockItem} 
        isBookmarked={false} 
        onBookmarkChange={mockOnBookmarkChange} 
      />,
      { wrapper: createWrapper() }
    );

    const bookmarkOutlineIcon = document.querySelector('[aria-label="Add bookmark"]');
    expect(bookmarkOutlineIcon).toBeInTheDocument();
  });

  test('shows filled bookmark icon for bookmarked items', () => {
    render(
      <MediaCard 
        item={mockItem} 
        isBookmarked={true} 
        onBookmarkChange={mockOnBookmarkChange} 
      />,
      { wrapper: createWrapper() }
    );

    const bookmarkIcon = document.querySelector('[aria-label="Remove bookmark"]');
    expect(bookmarkIcon).toBeInTheDocument();
  });

  test('opens dialog when clicking on open button', async () => {
    render(
      <MediaCard item={mockItem} onBookmarkChange={mockOnBookmarkChange} />,
      { wrapper: createWrapper() }
    );

    const openButton = screen.getByLabelText('View details');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('View Original Source')).toBeInTheDocument();
    });
  });

  test('calls onBookmarkChange when toggling bookmark', () => {
    render(
      <MediaCard 
        item={mockItem} 
        isBookmarked={false} 
        onBookmarkChange={mockOnBookmarkChange} 
      />,
      { wrapper: createWrapper() }
    );

    const bookmarkButton = screen.getByLabelText('Add bookmark');
    fireEvent.click(bookmarkButton);

    expect(mockOnBookmarkChange).toHaveBeenCalledWith('test-id-123', true);
  });

  test('renders license information correctly', () => {
    render(
      <MediaCard item={mockItem} onBookmarkChange={mockOnBookmarkChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('BY')).toBeInTheDocument();

    expect(screen.getByText(/flickr/i)).toBeInTheDocument();
  });

  test('renders tags correctly when expanded', () => {
    render(
      <MediaCard item={mockItem} onBookmarkChange={mockOnBookmarkChange} />,
      { wrapper: createWrapper() }
    );

    const expandButton = screen.getByLabelText('Show details');
    fireEvent.click(expandButton);

    expect(screen.getByText('Tags:')).toBeInTheDocument();
    expect(screen.getByText('nature')).toBeInTheDocument();
    expect(screen.getByText('water')).toBeInTheDocument();
    expect(screen.getByText('sky')).toBeInTheDocument();
  });
});