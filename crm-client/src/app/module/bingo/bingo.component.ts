import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { ToastService } from '../../core/services/toast.service';
import { FormControl, Validators } from '@angular/forms';
import { BingoDto, BingoService } from '../../core/services/bingo.service';
import { OptionsModel } from '../../core/services/components.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-bingo',
  templateUrl: './bingo.component.html',
  styleUrl: './bingo.component.scss'
})
export class BingoComponent {
  allowedFormats = [BarcodeFormat.QR_CODE];
  scannerEnable: boolean = true;
  scannedResult: BingoDto;
  qrEnable: boolean = false;
  qrValue: string = 'e41d54d5-7d7e-44d7-bf11-afed772c6ef1';
  user: {
    uid: string;
    name: string;
    bingo: any[];
    hiddenMission: string;
  }
  usernameFormControl: FormControl = new FormControl('', Validators.required);
  deviceFormControl: FormControl = new FormControl('');
  currentDeviceList: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | null = null;
  deviceOptions: OptionsModel[] = [];
  selectedBingo: {
    bingo: BingoDto;
    done: boolean;
  };

  constructor(
    private toastService: ToastService,
    private bingoService: BingoService,
    private titleService: Title,
  ) {
    this.titleService.setTitle('Bingo');
  }

  ngOnInit() {
    if (!this.user) {
      this.resetUser();
    }
    this.deviceFormControl.valueChanges.subscribe(value => {
      this.currentDevice = this.currentDeviceList.find(d => d.deviceId === value);
    })
  }

  resetUser() {
    this.user = {
      uid: '',
      name: null,
      bingo: [
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

  getAllBingoData() {
    this.bingoService.getBingoData().subscribe({
      next: (res) => {
        console.log('Bingo data:', res.data);
        if (this.user.name) {
          // randomly assign a hidden mission and a mission to the user 
          if (res.isSuccess && res.data.length > 0) {
            // assign a random hidden mission if not exist
            if (!this.user.hiddenMission) {
              if (res.data.length > 0) {
                const randomIndex = Math.floor(Math.random() * res.data.length);
                this.user.hiddenMission = res.data[randomIndex].uid;
                console.log('Hidden mission assigned:', this.user.hiddenMission);
              }
            }
            // assign a random mission if there is empty slot
            const missions = res.data.filter(b => b.category === 'SPIRITUAL');
            if (missions.length > 0) {
              const randomIndex = Math.floor(Math.random() * missions.length);
              this.assignBingoValue(missions[randomIndex]);
              console.log('Mission assigned:', missions[randomIndex].uid);
            }
          }

        }
      },
      error: (error) => {
        console.error('Error fetching bingo data:', error);
      }
    });
  }

  onScanComplete(event: any) {
    if (event) {
      console.log('Scan complete:', event);
    }
  }

  onScanSuccess(qr: string) {
    this.toastService.addSingle({ severity: 'info', message: 'Retrieving Bingo Data...', isLoading: true, key: 'loadingBingoData' });
    console.log('Scan success:', qr);
    this.scannerEnable = false; // Disable scanner after successful scan
    this.bingoService.getBingoDataById(qr).subscribe({
      next: (res) => {
        console.log('Bingo data:', res);
        this.scannedResult = res.data;
        if (res.isSuccess) {
          // check user.bingo which one is null and check if the res.data.uid is not exist in the user.bingo list, then randomly inside into the user.bingo list
          this.assignBingoValue(res.data);
        }
      },
      error: (error) => {
        console.error('Error fetching bingo data:', error);
        this.toastService.addSingle({ severity: 'error', message: 'Bingo not found. Please try again or find Danny.' });
      },
      complete: () => {
        this.toastService.clear('loadingBingoData');
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
      this.toastService.addSingle({ severity: 'error', message: 'This Bingo already exists. Please find another one.' });
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

    this.bingoService.updateUser(this.user).subscribe({
      next: (res) => {
        console.log(`User updated successfully: ${res.data.name}`);
        this.user = res.data;
      },
      error: (error) => {
        console.error('Error updating user:', error);
      }
    });

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
    this.currentDevice = this.currentDeviceList[0] || null;
    console.log(this.currentDevice);
  }

  qrCodeClick() {
    this.scannerEnable = false;
    this.qrEnable = true;
  }

  cameraFound(device: MediaDeviceInfo[]) {
    console.log('Cameras found:', device);
    this.currentDeviceList = device;
    this.deviceOptions = device.map(d => ({
      value: d.deviceId,
      label: d.label || `Camera ${d.deviceId}`
    }));
  }

  onSubmit() {
    if (this.usernameFormControl.valid) {
      // load toast
      this.toastService.addSingle({ severity: 'info', message: 'Loading...', isLoading: true, key: 'loadingToast' });

      this.bingoService.getUser(this.usernameFormControl.value ?? '').subscribe({
        next: (res) => {
          // if user not found
          if (!res.isSuccess) {
            this.resetUser();

            this.user.name = this.usernameFormControl.value;

            this.toastService.addSingle({ severity: 'info', message: 'Creating user...', isLoading: true, key: 'loadingCreate' });

            this.bingoService.createUser(this.user).subscribe({
              next: (res) => {
                if (res.isSuccess) {
                  this.toastService.addSingle({ severity: 'success', message: `User Created: ${this.user.name}` });
                  this.user.uid = res.data.uid;
                  this.getAllBingoData();
                } else {
                  this.toastService.addSingle({ severity: 'error', message: 'User Create Failed' });
                }
              },
              error: (error) => {
                console.error('Error creating user:', error);
              },
              complete: () => {
                this.toastService.clear('loadingCreate');
              }
            });
          }
          else {
            this.user = res.data;
            this.toastService.addSingle({ severity: 'success', message: `User Loaded: ${this.user.name}` });
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
        },
        complete: () => {
          this.toastService.clear('loadingToast');
        }
      });
    }
  }

  onBingoClick(item: {
    bingo: BingoDto,
    done: boolean
  }) {
    if (item?.bingo?.id) {
      this.selectedBingo = item;
    }
  }

  onComplete() {
    if (this.selectedBingo) {
      this.selectedBingo.done = true;
      this.user.bingo = this.user.bingo.map(row => row.map(cell => {
        if (cell.bingo?.id === this.selectedBingo.bingo?.id) {
          return { ...cell, done: this.selectedBingo.done };
        }
        return cell;
      }));
      this.bingoService.updateUser(this.user).subscribe({
        next: (res) => {
          console.log(`User updated successfully: ${res.data.name}`);
          this.user = res.data;
        },
        error: (error) => {
          console.error('Error updating user:', error);
        }
      });
    }
  }

  onCancel() {
    if (this.selectedBingo) {
      this.selectedBingo.done = false;
      this.user.bingo = this.user.bingo.map(row => row.map(cell => {
        if (cell.bingo?.id === this.selectedBingo.bingo?.id) {
          return { ...cell, done: this.selectedBingo.done };
        }
        return cell;
      }));
      this.bingoService.updateUser(this.user).subscribe({
        next: (res) => {
          console.log(`User updated successfully: ${res.data.name}`);
          this.user = res.data;
        },
        error: (error) => {
          console.error('Error updating user:', error);
        }
      });
    }
  }
}
