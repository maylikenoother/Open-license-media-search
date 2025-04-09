import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import SearchForm from '../../components/SearchForm';

describe('SearchForm Component', () => {
  const mockOnSearch = vi.fn();
  const defaultValues = {
    query: '',
    mediaType: 'images',
    licenseType: '',
    creator: '',
    tags: '',
    source: ''
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders SearchForm with default values', () => {
    render(<SearchForm onSearch={mockOnSearch} defaultValues={defaultValues} />);
    
    const searchInput = screen.getByLabelText('Search for open license media');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.value).toBe('');
    
    const mediaTypeSelect = screen.getByLabelText('Media Type');
    expect(mediaTypeSelect).toBeInTheDocument();
    expect(mediaTypeSelect.value).toBe('images');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  test('renders SearchForm with provided values', () => {
    const customValues = {
      query: 'nature',
      mediaType: 'audio',
      licenseType: 'cc0',
      creator: 'Test Creator',
      tags: 'nature,water',
      source: 'freesound'
    };
    
    render(<SearchForm onSearch={mockOnSearch} defaultValues={customValues} />);
    
    const searchInput = screen.getByLabelText('Search for open license media');
    expect(searchInput.value).toBe('nature');
    
    const mediaTypeSelect = screen.getByLabelText('Media Type');
    expect(mediaTypeSelect.value).toBe('audio');
  });

  test('toggles advanced search options when button is clicked', async () => {
    render(<SearchForm onSearch={mockOnSearch} defaultValues={defaultValues} />);
    
    expect(screen.queryByText('Advanced Filter Options')).not.toBeInTheDocument();
    
    const toggleButton = screen.getByRole('button', { name: /show advanced options/i });
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Filter Options')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('License Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Creator')).toBeInTheDocument();
    expect(screen.getByLabelText('Source')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    
    const hideButton = screen.getByRole('button', { name: /hide advanced options/i });
    fireEvent.click(hideButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Advanced Filter Options')).not.toBeInTheDocument();
    });
  });

  test('submits the form with correct values', async () => {
    render(<SearchForm onSearch={mockOnSearch} defaultValues={defaultValues} />);
    
    const searchInput = screen.getByLabelText('Search for open license media');
    fireEvent.change(searchInput, { target: { value: 'forest' } });
    
    const mediaTypeSelect = screen.getByLabelText('Media Type');
    fireEvent.change(mediaTypeSelect, { target: { value: 'audio' } });

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith({
      query: 'forest',
      mediaType: 'audio',
      licenseType: '',
      creator: '',
      tags: '',
      source: ''
    });
  });

  test('submits the form with advanced search values', async () => {
    render(<SearchForm onSearch={mockOnSearch} defaultValues={defaultValues} />);
    
    const searchInput = screen.getByLabelText('Search for open license media');
    fireEvent.change(searchInput, { target: { value: 'forest' } });
    
    const toggleButton = screen.getByRole('button', { name: /show advanced options/i });
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Filter Options')).toBeInTheDocument();
    });
    
    const licenseTypeSelect = screen.getByLabelText('License Type');
    fireEvent.change(licenseTypeSelect, { target: { value: 'cc0' } });
    
    const creatorInput = screen.getByLabelText('Creator');
    fireEvent.change(creatorInput, { target: { value: 'John Doe' } });
    
    const tagsInput = screen.getByLabelText('Tags');
    fireEvent.change(tagsInput, { target: { value: 'forest,trees,nature' } });
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith({
      query: 'forest',
      mediaType: 'images',
      licenseType: 'cc0',
      creator: 'John Doe',
      tags: 'forest,trees,nature',
      source: ''
    });
  });

  test('resets the form when reset button is clicked', async () => {
    render(<SearchForm onSearch={mockOnSearch} defaultValues={defaultValues} />);
    
    const searchInput = screen.getByLabelText('Search for open license media');
    fireEvent.change(searchInput, { target: { value: 'forest' } });
    
    const toggleButton = screen.getByRole('button', { name: /show advanced options/i });
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Filter Options')).toBeInTheDocument();
    });
    
    const licenseTypeSelect = screen.getByLabelText('License Type');
    fireEvent.change(licenseTypeSelect, { target: { value: 'cc0' } });
    
    const resetButton = screen.getByRole('button', { name: /reset all filters/i });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      const searchInputAfterReset = screen.getByLabelText('Search for open license media');
      expect(searchInputAfterReset.value).toBe('');
      
      expect(screen.queryByText('Advanced Filter Options')).not.toBeInTheDocument();
    });
  });

  test('shows loading state when isLoading is true', () => {
    render(<SearchForm onSearch={mockOnSearch} defaultValues={defaultValues} isLoading={true} />);
    
    const searchButton = screen.getByRole('button', { name: /searching/i });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toBeDisabled();
  });
});