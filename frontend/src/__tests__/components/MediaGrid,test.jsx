import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@testing-library/jest-dom';
import MediaGrid from '../../components/MediaGrid';

vi.mock('react-query', async () => {
  const actual = await vi.importActual('react-query');
  return {
    ...actual,
    useQuery: () => ({
      data: [],
      isLoading: false,
      isError: false
    })
  };
});

vi.mock('../../components/MediaCard', () => ({
  default: ({ item }) => (
    <div data-testid="media-card">
      <h3>{item.title}</h3>
      <p>{item.creator}</p>
    </div>
  )
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

describe('MediaGrid Component', () => {
  const mockMedia = [
    {
      id: '1',
      title: 'First Image',
      creator: 'Creator One',
      provider: 'flickr'
    },
    {
      id: '2',
      title: 'Second Image',
      creator: 'Creator Two',
      provider: 'wikimedia'
    },
    {
      id: '3',
      title: 'Third Image',
      creator: 'Creator Three',
      provider: 'flickr'
    }
  ];

  const mockPageChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders MediaGrid with media items', () => {
    render(
      <MediaGrid 
        media={mockMedia}
        isLoading={false}
        error={null}
        currentPage={1}
        totalPages={1}
      />,
      { wrapper: createWrapper() }
    );

    const mediaCards = screen.getAllByTestId('media-card');
    expect(mediaCards).toHaveLength(3);

    expect(screen.getByText('First Image')).toBeInTheDocument();
    expect(screen.getByText('Second Image')).toBeInTheDocument();
    expect(screen.getByText('Third Image')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(
      <MediaGrid 
        media={[]}
        isLoading={true}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/searching for/i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    render(
      <MediaGrid 
        media={[]}
        isLoading={false}
        error={{ message: 'Failed to load data' }}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
  });

  test('renders empty state when no media is provided', () => {
    render(
      <MediaGrid 
        media={[]}
        isLoading={false}
        error={null}
        query="forest"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  test('renders empty state with search prompt when no query is provided', () => {
    render(
      <MediaGrid 
        media={[]}
        isLoading={false}
        error={null}
        query=""
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/search for open license media/i)).toBeInTheDocument();
  });

  test('renders pagination when there are multiple pages', () => {
    render(
      <MediaGrid 
        media={mockMedia}
        isLoading={false}
        error={null}
        currentPage={1}
        totalPages={3}
        totalResults={30}
        onPageChange={mockPageChange}
      />,
      { wrapper: createWrapper() }
    );

    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
    
    const pageButtons = screen.getAllByRole('button', { name: /page \d/i });
    expect(pageButtons.length).toBeGreaterThan(0);
  });

  test('calls onPageChange when pagination is clicked', () => {
    render(
      <MediaGrid 
        media={mockMedia}
        isLoading={false}
        error={null}
        currentPage={1}
        totalPages={3}
        totalResults={30}
        onPageChange={mockPageChange}
      />,
      { wrapper: createWrapper() }
    );

    const page2Button = screen.getByRole('button', { name: /page 2/i });
    fireEvent.click(page2Button);
    
    expect(mockPageChange).toHaveBeenCalledWith(2);
  });

  test('displays results info correctly', () => {
    render(
      <MediaGrid 
        media={mockMedia}
        isLoading={false}
        error={null}
        currentPage={2}
        totalPages={5}
        totalResults={45}
        query="nature"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/showing page 2 of/i)).toBeInTheDocument();
    expect(screen.getByText(/45 results/i)).toBeInTheDocument();
  });

  test('can sort the results', () => {
    render(
      <MediaGrid 
        media={mockMedia}
        isLoading={false}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: 'title_asc' } });

    expect(sortSelect.value).toBe('title_asc');
  });
});