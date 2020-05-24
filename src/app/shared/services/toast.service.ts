import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastCtrl: ToastController) {}

  /**
   * Makes a delicious, buttery toast message
   * Mmmm.... 🍞
   */
  async makeToast(message: string, duration = 3000) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
    });
    return await toast.present();
  }
}
