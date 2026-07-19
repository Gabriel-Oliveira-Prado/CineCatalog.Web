import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MovieCard from './MovieCard';
import { MemoryRouter } from 'react-router-dom';

const mockMovie = {
  id: 'movie-1',
  title: 'Inception',
  imageUrl: 'https://example.com/inception.jpg',
  averageRating: 8.8,
  releaseYear: 2010,
  durationMinutes: 148,
  director: 'Christopher Nolan',
  genres: [{ id: 1, name: 'Sci-Fi' }]
};

describe('MovieCard Component', () => {
  it('should render movie title, director and release year', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={mockMovie} />
      </MemoryRouter>
    );

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Christopher Nolan')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('148 min')).toBeInTheDocument();
  });

  it('should render poster image when imageUrl is present and loads successfully', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={mockMovie} />
      </MemoryRouter>
    );

    const img = screen.getByAltText('Pôster do filme Inception');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockMovie.imageUrl);
  });

  it('should fallback to placeholder on image loading error', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={mockMovie} />
      </MemoryRouter>
    );

    const img = screen.getByAltText('Pôster do filme Inception');
    expect(img).toBeInTheDocument();

    // Simulate image error
    fireEvent.error(img);

    // Image should be gone and placeholder text/icon should be displayed
    expect(screen.queryByAltText('Pôster do filme Inception')).toBeNull();
    
    // The placeholder shows the title as text
    const placeholders = screen.getAllByText('Inception');
    expect(placeholders.length).toBeGreaterThanOrEqual(1);
  });
});