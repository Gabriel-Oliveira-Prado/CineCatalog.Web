import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import MovieCard from '../components/MovieCard/MovieCard';

const mockMovie = {
  id: '123-guid',
  title: 'Interestelar',
  imageUrl: 'http://example.com/poster.jpg',
  averageRating: 4.8,
  genres: [
    { id: '1', name: 'Ficção Científica' },
    { id: '2', name: 'Drama' },
  ],
  director: 'Christopher Nolan',
  releaseYear: 2014,
  durationMinutes: 169,
};

describe('MovieCard Component', () => {
  it('should render poster image when imageUrl is present and loads successfully', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={mockMovie} />
      </MemoryRouter>
    );

    const image = screen.getByAltText('Pôster do filme Interestelar');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toBe('http://example.com/poster.jpg');
  });

  it('should fallback to placeholder title and icon when image triggers onError', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={mockMovie} />
      </MemoryRouter>
    );

    const image = screen.getByAltText('Pôster do filme Interestelar');
    expect(image).toBeInTheDocument();

    // Dispara o evento de erro na imagem
    fireEvent.error(image);

    // O img deve sumir e o placeholder contendo o título deve aparecer
    expect(image).not.toBeInTheDocument();
    
    // O texto do título do filme deve estar dentro do placeholder
    const placeholderText = screen.getAllByText('Interestelar').find(el => el.tagName === 'SPAN');
    expect(placeholderText).toBeInTheDocument();
    expect(placeholderText.className).toContain('placeholderText');
  });
});