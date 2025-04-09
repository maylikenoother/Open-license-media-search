import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import SearchFilters from '../../components/SearchFilters';

describe('SearchFilters Component', () => {
  const mockFilterChange = vi.fn();
  const mockReset = vi.fn();
  
  const defaultFilters = {
    mediaType: 'images',
    licenseType: '',
    creator: '',
    tags: '',
    source: ''
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic filter sections', () => {
    render(
      <SearchFilters 
        activeFilters={defaultFilters} 
        onFilterChange={mockFilterChange}
        onReset={mockReset}
      />
    );
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Media Type')).toBeInTheDocument();
    expect(screen.getByText('License Type')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
  });

  test('applies license type filter when selected', () => {
    render(
      <SearchFilters 
        activeFilters={defaultFilters} 
        onFilterChange={mockFilterChange}
        onReset={mockReset}
      />
    );
    
    const licenseSection = screen.getByText('License Type');
    fireEvent.click(licenseSection);
    
    const cc0Radio = screen.getByLabelText('CC0 (Public Domain)');
    fireEvent.click(cc0Radio);
    
    expect(mockFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      licenseType: 'cc0'
    });
  });

  test('reset button calls onReset when clicked', () => {
    render(
      <SearchFilters 
        activeFilters={{...defaultFilters, licenseType: 'cc0'}} 
        onFilterChange={mockFilterChange}
        onReset={mockReset}
      />
    );
    
    const resetButton = screen.getByText('Reset All');
    fireEvent.click(resetButton);
    
    expect(mockReset).toHaveBeenCalled();
  });

  test('adds and removes tags correctly', () => {
    render(
      <SearchFilters 
        activeFilters={{...defaultFilters, tags: 'nature'}}
        onFilterChange={mockFilterChange}
        onReset={mockReset}
      />
    );
    
    const tagsSection = screen.getByText('Tags');
    fireEvent.click(tagsSection);
    
    expect(screen.getByText('nature')).toBeInTheDocument();
    
    const tagInput = screen.getByLabelText('Add tag');
    fireEvent.change(tagInput, { target: { value: 'water' } });
    const addButton = screen.getByLabelText('Add tag').nextSibling.querySelector('button');
    fireEvent.click(addButton);
    
    expect(mockFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      tags: 'nature,water'
    }));
  });
});