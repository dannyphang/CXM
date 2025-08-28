import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { ToastService } from '../../core/services/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { BingoService } from '../../core/services/bingo.service';

@Component({
  selector: 'app-bingo',
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss'
})
export class BingoComponent {
  allowedFormats = [BarcodeFormat.QR_CODE];
  scannerEnable: boolean = true;
  scannedResult: string = '';
  qrEnable: boolean = false;
  qrValue: string = 'e41d54d5-7d7e-44d7-bf11-afed772c6ef1';
  user: {
    name: string;
    bingo: any[];
    hiddenMission: string;
  }
  usernameFormControl: FormControl = new FormControl('', Validators.required);

  constructor(
    private toastService: ToastService,
    private bingoService: BingoService,
  ) { }

  ngOnInit() {
    if (!this.user) {
      this.user = {
        name: null,
        bingo: [
          [
            {
              bingo: null,
              done: false,
            },
            {
              bingo: {
                uid: '7d1cd330-5ffb-4c8b-9702-5aa765aa7a1b',
                description: 'Find 2 people whose zodiac is the same as yours.',
                category: 'FAST',
                id: 3,
              },
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
          ],
          [
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
          ],
          [
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
          ],
          [
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
          ],
          [
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
            {
              bingo: null,
              done: false,
            },
          ],
        ],
        hiddenMission: null
      };
    }
    this.onScanSuccess('e41d54d5-7d7e-44d7-bf11-afed772c6ef1')
  }

  onScanComplete(event: any) {
    if (event) {
      console.log('Scan complete:', event);
    }
  }

  onScanSuccess(qr: string) {
    console.log('Scan success:', qr);
    this.scannedResult = qr;
    this.scannerEnable = false; // Disable scanner after successful scan
    this.bingoService.getBingoDataById(qr).subscribe({
      next: (res) => {
        console.log('Bingo data:', res);
        if (res.isSuccess) {
          // check user.bingo which one is null and check if the res.data.uid is not exist in the user.bingo list, then randomly inside into the user.bingo list
          this.assignBingoValue(res.data);
          console.log(this.user.bingo);
        }
      },
      error: (error) => {
        console.error('Error fetching bingo data:', error);
      }
    });
  }

  assignBingoValue(bingo: any) {
    // Collect all cells with their row/col info
    const allCells: { row: number; col: number; cell: any }[] = [];

    this.user.bingo.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        allCells.push({ row: rowIndex, col: colIndex, cell });
      });
    });

    // Check if uid already exists in the bingo grid
    const alreadyExists = allCells.some(item => item.cell?.bingo?.uid === bingo.uid);
    if (alreadyExists) {
      console.log(`UID ${bingo.uid} already exists in bingo list.`);
      return;
    }

    // Find all empty slots
    const emptyCells = allCells.filter(item => item.cell.bingo === null);

    if (emptyCells.length === 0) {
      console.log("No empty slots available in bingo.");
      return;
    }

    // Pick a random empty slot
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    // ✅ Assign directly back into the original grid
    this.user.bingo[row][col].bingo = {
      uid: bingo.uid,
      description: bingo.description,
      category: bingo.category,
      id: bingo.id,
    };

    console.log(`UID ${bingo.uid} assigned at row ${row}, col ${col}.`);
  }

  onScanError(event: any) {
    console.log('Scan error:', event);
    this.scannerEnable = true; // Disable scanner after error
  }

  cameraClick() {
    this.toastService.addSingle({ severity: 'info', message: 'BINGO.CAMERA_CLICKED' });
    this.scannerEnable = true;
    this.qrEnable = false;
  }

  qrCodeClick() {
    this.scannerEnable = false;
    this.qrEnable = true;
  }

  getUser() {

  }
}
