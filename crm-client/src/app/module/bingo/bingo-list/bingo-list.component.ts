import { Component } from '@angular/core';
import { BingoDto, BingoService } from '../../../core/services/bingo.service';

@Component({
  selector: 'app-bingo-list',
  templateUrl: './bingo-list.component.html',
  styleUrl: './bingo-list.component.scss'
})
export class BingoListComponent {
  constructor(
    private bingoService: BingoService,
  ) { }

  bingoList: BingoDto[] = [];

  ngOnInit() {
    this.bingoService.getBingoData().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.bingoList = res.data;
        }
      },
      error: (error) => {
        console.error('Error fetching bingo data:', error);
      }
    });
  }
}
