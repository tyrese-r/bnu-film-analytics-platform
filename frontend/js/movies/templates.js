// precompiled handlebars templates for movie feed + details
import Handlebars from 'handlebars';
import movieCardSource from '../../templates/movie-card.hbs?raw';
import movieDetailsSource from '../../templates/movie-details.hbs?raw';

export const renderMovieCard = Handlebars.compile(movieCardSource);
export const renderMovieDetails = Handlebars.compile(movieDetailsSource);
