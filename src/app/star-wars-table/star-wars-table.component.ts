import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

interface Character {
  name: string;
  birth_year: string;
  species: string;
}

@Component({
  selector: 'app-star-wars-table',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './star-wars-table.component.html',
  styleUrls: ['./star-wars-table.component.css']
})
export class StarWarsTableComponent implements OnDestroy {
  characters$ = new BehaviorSubject<Character[]>([]);
  currentPage = 1;
  totalPages = 1;
  filters = {
    movieName: '',
    species: '',
    vehicle: '',
    starShips: '',
    birthYear: 'ALL'
  };
  subscription: Subscription;

  constructor(private http: HttpClient) {
    this.subscription = this.getCharacters().subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getCharacters(): Observable<Character[]> {
    const queryParams = new URLSearchParams();
    if (this.filters.birthYear !== 'ALL') {
      queryParams.append('birth_year', this.filters.birthYear);
    }

    return this.http.get<any>(`https://swapi.dev/api/people/?page=${this.currentPage}&${queryParams.toString()}`)
      .pipe(
        map(response => {
          this.totalPages = Math.ceil(response.count / 10); // Adjust based on API response
          return response.results as Character[];
        }),
        tap(data => this.characters$.next(data)),
        catchError(error => {
          console.error('Error fetching characters', error);
          this.characters$.next([]); // Emit empty array on error
          return [];
        })
      );
  }

  onFilterChange() {
    this.currentPage = 1;
    this.getCharacters().subscribe();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getCharacters().subscribe();
  }

  // getSpeciesName(speciesUrl: any): any {
  //   return speciesUrl ? speciesUrl.split('/').pop() : '';
  // }

  getSpeciesName(speciesUrls: string[]): string {
    if (!speciesUrls || speciesUrls.length === 0) {
      return 'Unknown';
    }
  
    // Assume speciesUrls is an array of strings (URLs)
    return speciesUrls.map(url => url.split('/').slice(-2, -1)[0]).join(', ');
  }
  

  onClick() {
    this.http.get<Character[]>(`https://swapi.dev/api/people/`)
      .subscribe(data => {
        console.log(data);
      });
  }
}

  // characters$: Observable<Character[]> = of([]);
  // currentPage = 1;
  // totalPages = 1;
  // filters = {
  //   movieName: '',
  //   species: '',
  //   vehicle: '',
  //   starShips: '',
  //   birthYear: 'ALL',
  // };

  // constructor(private http: HttpClient) {
  //   this.getCharacters();
  // }

  // getCharacters() {
  //   this.characters$ = this.http.get<any>(`https://swapi.dev/api/people/?page=${this.currentPage}&${this.getQueryParams()}`).pipe(
  //     map(response => {
  //       this.totalPages = Math.ceil(response.count / 10); // Assume 10 results per page
  //       return response.results as Character[];
  //     }),
  //     catchError(error => {
  //       console.error('Error fetching characters', error);
  //       return of([]); // Return an empty array on error
  //     })
  //   );
  // }

  // onFilterChange() {
  //   this.currentPage = 1;
  //   this.getCharacters();
  // }

  // onPageChange(page: number) {
  //   this.currentPage = page;
  //   this.getCharacters();
  // }

  // getQueryParams(): string {
  //   const queryParams = new URLSearchParams();
  //   if (this.filters.birthYear !== 'ALL') {
  //     queryParams.append('birth_year', this.filters.birthYear);
  //   }
  //   return queryParams.toString();
  // }

  // getSpeciesName(speciesUrl: any): any {
  //   return speciesUrl ? speciesUrl.split('/').pop() : '';
  // }

  // onClick() {
  //   this.http.get<Character[]>(`https://swapi.dev/api/people/`).pipe(
  //     catchError(error => {
  //       console.error('Error on button click', error);
  //       return of([]);
  //     })
  //   ).subscribe(data => {
  //     console.log(data);
  //   });
  // }
