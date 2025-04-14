import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-slot777',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slot777.component.html',
  styleUrl: './slot777.component.css'
})
export class Slot777Component {
  @ViewChild('slotCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // Kích thước canvas
  canvasWidth = 500;
  canvasHeight = 300;

  // Số cột (reels) và số hàng (rows)
  numReels = 5;
  numRows = 3;

  symbols= [
    '7red.png',
    '7blue.png',
    '7green.png',
    '7purple.png',
    'bar.png'
  ];
  images: HTMLImageElement[] = [];

  // Tọa độ của các cuộn
  reels: { y: number; speed: number }[] = [];

  constructor() {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    // Tải ảnh và khởi tạo game
    this.loadImages().then(() => {
      this.initReels();
      this.draw();
    });
  }

  // Tải ảnh vào bộ nhớ trước khi hiển thị
  async loadImages() {
    const reelWidth = this.canvasWidth / this.numReels;
    const symbolHeight = this.canvasHeight / this.numRows;

    try {
        const promises = this.symbols.map(src => this.resizeImage(src, reelWidth, symbolHeight));
        this.images = (await Promise.all(promises)).filter(img => img !== null);

        console.log("✅ Ảnh đã tải và resize xong:", this.images);

        this.initReels();
        this.draw();
    } catch (error) {
        console.error("❌ Lỗi khi load ảnh:", error);
    }
  }

  resizeImage(src: string, targetWidth: number, targetHeight: number): Promise<HTMLImageElement | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.crossOrigin = "anonymous"; 

      img.onload = () => {
          console.log(`🖼️ Đã tải xong ảnh: ${src}, Kích thước gốc: ${img.width}x${img.height}`);

          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
              console.error("⚠️ Không thể lấy context từ canvas!");
              return resolve(null);
          }

          // Đảm bảo ảnh được resize theo đúng tỉ lệ
          const aspectRatio = img.width / img.height;
          let drawWidth = targetWidth;
          let drawHeight = targetHeight;

          if (aspectRatio > 1) {
              drawHeight = targetWidth / aspectRatio;
          } else {
              drawWidth = targetHeight * aspectRatio;
          }

          const offsetX = (targetWidth - drawWidth) / 2;
          const offsetY = (targetHeight - drawHeight) / 2;

          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          // Chuyển canvas thành ảnh mới
          const resizedImg = new Image();
          resizedImg.src = canvas.toDataURL("image/png");

          resizedImg.onload = () => {
              console.log(`✅ Ảnh resize xong: ${resizedImg.src}`);
              console.log(`🖼️ Ảnh sau resize (${resizedImg.src}): ${resizedImg.width}x${resizedImg.height}`); // ⬅️ Dòng log này

              resolve(resizedImg);
          };

          resizedImg.onerror = (err) => {
              console.error(`⚠️ Lỗi khi tạo ảnh từ canvas: ${src}`, err);
              resolve(null);
          };
      };

      img.onerror = (err) => {
          console.error(`❌ Không thể tải ảnh: ${src}`, err);
          resolve(null);
      };
  });
}

  // Tạo cuộn với vị trí và tốc độ ngẫu nhiên
  initReels() {
    for (let i = 0; i < this.numReels; i++) {
      this.reels.push({ y: Math.random() * -200, speed: 0 });
    }
  }

  // Hàm tải ảnh
  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });
  }

  // Hàm vẽ slot machine
  draw() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  
    const reelWidth = this.canvasWidth / this.numReels;
    const symbolHeight = this.canvasHeight / this.numRows;
  
    for (let i = 0; i < this.numReels; i++) {
        const reel = this.reels[i];

        for (let j = 0; j < this.numRows + 1; j++) {
            let symbolIndex = Math.abs(Math.floor((reel.y / symbolHeight) + j)) % this.images.length;

            if (symbolIndex < 0 || symbolIndex >= this.images.length) {
                symbolIndex = 0; // Đảm bảo luôn có ảnh hợp lệ
            }

            const img = this.images[symbolIndex];

            if (!img) {
                console.warn(`⚠️ Không tìm thấy ảnh cho index ${symbolIndex}`);
                continue;
            }

            // console.log(`🖼️ Đang vẽ ảnh: ${img.src} tại vị trí (${i * reelWidth}, ${reel.y + j * symbolHeight})`);

            const aspectRatio = img.width / img.height;
            let drawWidth = reelWidth;
            let drawHeight = drawWidth / aspectRatio;

            this.ctx.drawImage(img, i * reelWidth, reel.y + j * symbolHeight, drawWidth, drawHeight);
        }

        if (reel.speed > 0) {
            reel.y += reel.speed;
            if (reel.y >= symbolHeight) reel.y = -symbolHeight * this.images.length;
        }
    }

    requestAnimationFrame(() => this.draw()); // Vẽ liên tục
}

  // Khi nhấn "SPIN"
  spin() {
    console.log("🔄 Đang quay slot:", this.reels);
    this.reels.forEach((reel, index) => {
      reel.speed = 10 + Math.random() * 5; // Tốc độ ngẫu nhiên
      setTimeout(() => this.stopReel(index), 3000 + index * 500); // Dừng từng cuộn một
    });
  }

  // Khi dừng từng cuộn
  stopReel(index: number) {
    let stopInterval = setInterval(() => {
        this.reels[index].speed *= 0.9; // Giảm tốc độ từ từ

        if (this.reels[index].speed < 0.5) {
            this.reels[index].speed = 0; // Dừng hẳn

            // 🎲 Căn chỉnh ảnh một cách ngẫu nhiên để đảm bảo kết quả khác nhau
            const symbolHeight = this.canvasHeight / this.numRows;
            this.reels[index].y = -Math.floor(Math.random() * this.images.length) * symbolHeight;

            clearInterval(stopInterval);
        }
    }, 50);
}

}
