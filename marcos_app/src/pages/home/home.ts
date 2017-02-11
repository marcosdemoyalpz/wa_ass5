import { Component } from '@angular/core';
import { MoviesProvider } from '../../providers/movie-service';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [MoviesProvider]
})
export class HomePage {
  public movies: any;

  constructor(public navCtrl: NavController, public moviesProvider: MoviesProvider) {
    this.loadMovies();
  }

  loadMovies() {
    this.moviesProvider.load()
      .then(data => {
        this.movies = data;
      });
  }
}
