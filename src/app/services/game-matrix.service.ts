import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Observable, Subject, interval, map, takeUntil } from 'rxjs';
import { gameCellObject } from '../interfaces/cameCellObjectInterface';

@Injectable({
  providedIn: 'root',
})
export class GameMatixService {
  private stopGame$ = new Subject<void>();

  createMatrix(height: number, width: number): gameCellObject[][] {
    const matrix: gameCellObject[][] = [];
    for (let i = 0; i < height; i++) {
      matrix.push(Array(width).fill({ miliseconds: 0 }));
    }
    return matrix;
  }

  startGame(
    matrix: gameCellObject[][], 
    milisecondsTime: number, 
    stepInterval: number, 
    cdRef: ChangeDetectorRef): Observable<gameCellObject[][]> {
    // Reset previous game if exists
    this.stopGame();

    return interval(stepInterval).pipe(
      map(() => {
        const matrixCopy = matrix;
        const emptyCells: [number, number][] = [];

        // Find cells with miliseconds = 0
        matrixCopy.forEach((row, i) => {
          row.forEach((cell, j) => {
            if (cell.miliseconds === 0) {
              emptyCells.push([i, j]);
            }
          });
        });

        if (emptyCells.length > 0) {
          const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          // by changing the the link  we trigger the change detection
          matrixCopy[row][col] = { miliseconds: milisecondsTime };
        }
        cdRef.markForCheck();
        return matrixCopy;
      }),
      takeUntil(this.stopGame$)
    );
  }

  stopGame(): void {
    this.stopGame$.next();
  }
}